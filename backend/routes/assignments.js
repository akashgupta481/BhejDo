const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

// GET /api/assignments — list assignments for user
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (req.user.role === 'TRAVELER') {
      conditions.push('a.traveler_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'AGENT') {
      // Get agent's current city so they see orders relevant to their location
      const agentUser = db.prepare('SELECT city FROM users WHERE id = ?').get(req.user.id);
      const agentCity = agentUser ? agentUser.city : '';

      conditions.push(`(
        a.agent_id = ? OR a.destination_agent_id = ?
        OR (a.agent_id IS NULL AND LOWER(p.pickup_city) = LOWER(?) AND a.status IN ('MATCHED', 'ACCEPTED', 'PICKED_UP'))
        OR (a.destination_agent_id IS NULL AND LOWER(p.destination_city) = LOWER(?) AND a.status = 'REACHED')
      )`);
      params.push(req.user.id, req.user.id, agentCity, agentCity);
    } else if (req.user.role === 'SENDER') {
      conditions.push('p.sender_id = ?');
      params.push(req.user.id);
    }
    // ADMIN sees all

    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countQuery = `
      SELECT COUNT(*) as count FROM assignments a
      JOIN parcels p ON p.id = a.parcel_id
      ${whereClause}
    `;
    const total = db.prepare(countQuery).get(...params).count;

    const query = `
      SELECT a.*,
             p.receiver_name, p.receiver_phone, p.receiver_address, p.receiver_city,
             p.pickup_city, p.destination_city,
             p.weight, p.description, p.tracking_code, p.status as parcel_status,
             p.estimated_price,
             t.name as traveler_name, t.phone as traveler_phone, t.address as traveler_address, t.city as traveler_city,
             ag.name as agent_name, ag.phone as agent_phone,
             dag.name as destination_agent_name, dag.phone as destination_agent_phone,
             s.name as sender_name, s.phone as sender_phone, s.address as sender_address, s.city as sender_city
      FROM assignments a
      JOIN parcels p ON p.id = a.parcel_id
      JOIN users t ON t.id = a.traveler_id
      LEFT JOIN users ag ON ag.id = a.agent_id
      LEFT JOIN users dag ON dag.id = a.destination_agent_id
      JOIN users s ON s.id = p.sender_id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const assignments = db.prepare(query).all(...params, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Assignments retrieved successfully.'
    });
  } catch (error) {
    console.error('List assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/assignments/:id/claim — agent claims an unassigned order in their city
router.patch('/:id/claim', authMiddleware, roleCheck('AGENT'), (req, res) => {
  try {
    const db = getDb();
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    const agent = db.prepare('SELECT city FROM users WHERE id = ?').get(req.user.id);
    const parcel = db.prepare('SELECT pickup_city, destination_city FROM parcels WHERE id = ?').get(assignment.parcel_id);

    if (!agent || !parcel) {
      return res.status(400).json({ success: false, message: 'Cannot claim this assignment.' });
    }

    // Agent can claim if:
    // - pickup_city matches their city AND agent_id is null
    // - OR destination_city matches their city AND destination_agent_id is null AND status is REACHED
    if (!assignment.agent_id && agent.city && agent.city.toLowerCase() === parcel.pickup_city.toLowerCase()) {
      db.prepare('UPDATE assignments SET agent_id = ? WHERE id = ?').run(req.user.id, assignment.id);
    } else if (!assignment.destination_agent_id && agent.city && agent.city.toLowerCase() === parcel.destination_city.toLowerCase() && assignment.status === 'REACHED') {
      db.prepare('UPDATE assignments SET destination_agent_id = ? WHERE id = ?').run(req.user.id, assignment.id);
    } else {
      return res.status(400).json({ success: false, message: 'Cannot claim this assignment.' });
    }

    // Return updated assignment
    const updated = db.prepare(`
      SELECT a.*,
             p.receiver_name, p.receiver_phone, p.receiver_address, p.receiver_city,
             p.pickup_city, p.destination_city,
             p.weight, p.description, p.tracking_code, p.status as parcel_status,
             p.estimated_price,
             t.name as traveler_name, t.phone as traveler_phone, t.address as traveler_address, t.city as traveler_city,
             ag.name as agent_name, ag.phone as agent_phone,
             dag.name as destination_agent_name, dag.phone as destination_agent_phone,
             s.name as sender_name, s.phone as sender_phone, s.address as sender_address, s.city as sender_city
      FROM assignments a
      JOIN parcels p ON p.id = a.parcel_id
      JOIN users t ON t.id = a.traveler_id
      LEFT JOIN users ag ON ag.id = a.agent_id
      LEFT JOIN users dag ON dag.id = a.destination_agent_id
      JOIN users s ON s.id = p.sender_id
      WHERE a.id = ?
    `).get(req.params.id);

    res.json({ success: true, data: { assignment: updated }, message: 'Assignment claimed successfully.' });
  } catch (error) {
    console.error('Claim assignment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PATCH /api/assignments/:id/pickup — mark picked up (agent)
router.patch('/:id/pickup', authMiddleware, roleCheck('AGENT', 'TRAVELER', 'ADMIN'), (req, res) => {
  try {
    const db = getDb();
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (!['MATCHED', 'ACCEPTED'].includes(assignment.status)) {
      return res.status(400).json({ success: false, message: 'Assignment must be in MATCHED or ACCEPTED state to mark as picked up.' });
    }

    const now = new Date().toISOString();
    db.prepare("UPDATE assignments SET status = 'PICKED_UP', pickup_time = ? WHERE id = ?").run(now, req.params.id);
    db.prepare("UPDATE parcels SET status = 'PICKED_UP' WHERE id = ?").run(assignment.parcel_id);

    // Notify sender
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(assignment.parcel_id);
    if (parcel) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'PARCEL_UPDATE', 'Parcel Picked Up', ?)
      `).run(uuidv4(), parcel.sender_id, `Your parcel ${parcel.tracking_code} has been picked up and is ready for transit.`);
    }

    res.json({
      success: true,
      data: { assignment_id: req.params.id, status: 'PICKED_UP', pickup_time: now },
      message: 'Assignment marked as picked up.'
    });
  } catch (error) {
    console.error('Pickup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/assignments/:id/transit — mark in transit (legacy, kept for backward compat)
router.patch('/:id/transit', authMiddleware, roleCheck('TRAVELER', 'AGENT', 'ADMIN'), (req, res) => {
  try {
    const db = getDb();
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (assignment.status !== 'PICKED_UP') {
      return res.status(400).json({ success: false, message: 'Assignment must be in PICKED_UP state to mark as in transit.' });
    }

    if (req.user.role === 'TRAVELER' && assignment.traveler_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    db.prepare("UPDATE assignments SET status = 'IN_TRANSIT' WHERE id = ?").run(req.params.id);
    db.prepare("UPDATE parcels SET status = 'IN_TRANSIT' WHERE id = ?").run(assignment.parcel_id);

    // Notify sender
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(assignment.parcel_id);
    if (parcel) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'PARCEL_UPDATE', 'Parcel In Transit', ?)
      `).run(uuidv4(), parcel.sender_id, `Your parcel ${parcel.tracking_code} is now in transit to ${parcel.destination_city}.`);

      // Notify agent at destination — traveler is on the way, arrange pickup from traveler
      if (assignment.agent_id) {
        const traveler = db.prepare('SELECT * FROM users WHERE id = ?').get(assignment.traveler_id);
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message)
          VALUES (?, ?, 'DELIVERY_INCOMING', 'Traveler In Transit', ?)
        `).run(uuidv4(), assignment.agent_id, `Traveler ${traveler ? traveler.name : 'N/A'} is in transit with parcel ${parcel.tracking_code} heading to ${parcel.destination_city}. Please arrange pickup from traveler and deliver to receiver ${parcel.receiver_name} at ${parcel.receiver_address}, ${parcel.receiver_city}.`);
      }
    }

    res.json({
      success: true,
      data: { assignment_id: req.params.id, status: 'IN_TRANSIT' },
      message: 'Assignment marked as in transit.'
    });
  } catch (error) {
    console.error('Transit error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/assignments/:id/hand-to-traveler — agent confirms handoff to traveler
router.patch('/:id/hand-to-traveler', authMiddleware, roleCheck('AGENT', 'ADMIN'), (req, res) => {
  try {
    const db = getDb();
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (assignment.status !== 'PICKED_UP') {
      return res.status(400).json({ success: false, message: 'Assignment must be in PICKED_UP state.' });
    }

    if (req.user.role === 'AGENT' && assignment.agent_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not the assigned agent.' });
    }

    const now = new Date().toISOString();
    db.prepare("UPDATE assignments SET agent_handed = 1, agent_handed_at = ? WHERE id = ?").run(now, req.params.id);

    // Check if traveler has also confirmed
    const updatedAssignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
    let newStatus = 'PICKED_UP';

    if (updatedAssignment.traveler_received === 1) {
      // Both confirmed — move to IN_TRANSIT
      db.prepare("UPDATE assignments SET status = 'IN_TRANSIT' WHERE id = ?").run(req.params.id);
      db.prepare("UPDATE parcels SET status = 'IN_TRANSIT' WHERE id = ?").run(assignment.parcel_id);
      newStatus = 'IN_TRANSIT';

      // Notify sender
      const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(assignment.parcel_id);
      if (parcel) {
        const traveler = db.prepare('SELECT name FROM users WHERE id = ?').get(assignment.traveler_id);
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message)
          VALUES (?, ?, 'PARCEL_UPDATE', 'Parcel In Transit', ?)
        `).run(uuidv4(), parcel.sender_id, `Your parcel ${parcel.tracking_code} is now in transit with traveler ${traveler ? traveler.name : 'N/A'}.`);
      }
    }

    // Notify traveler to confirm receipt
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(assignment.parcel_id);
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message)
      VALUES (?, ?, 'HANDOFF', 'Parcel Handed to You', ?)
    `).run(uuidv4(), assignment.traveler_id, `Agent has handed parcel ${parcel ? parcel.tracking_code : ''} to you. Please confirm receipt in your dashboard.`);

    res.json({
      success: true,
      data: {
        assignment_id: req.params.id,
        status: newStatus,
        agent_handed: 1,
        traveler_received: updatedAssignment.traveler_received,
        agent_handed_at: now
      },
      message: newStatus === 'IN_TRANSIT'
        ? 'Both parties confirmed. Parcel is now in transit!'
        : 'Handoff recorded. Waiting for traveler to confirm receipt.'
    });
  } catch (error) {
    console.error('Hand-to-traveler error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/assignments/:id/confirm-received — traveler confirms receipt from agent
router.patch('/:id/confirm-received', authMiddleware, roleCheck('TRAVELER', 'ADMIN'), (req, res) => {
  try {
    const db = getDb();
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (req.user.role === 'TRAVELER' && assignment.traveler_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. This assignment is not yours.' });
    }

    if (assignment.status !== 'PICKED_UP') {
      return res.status(400).json({ success: false, message: 'Assignment must be in PICKED_UP state.' });
    }

    db.prepare("UPDATE assignments SET traveler_received = 1 WHERE id = ?").run(req.params.id);

    // Check if agent has also confirmed
    const updatedAssignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);
    let newStatus = 'PICKED_UP';

    if (updatedAssignment.agent_handed === 1) {
      // Both confirmed — move to IN_TRANSIT
      db.prepare("UPDATE assignments SET status = 'IN_TRANSIT' WHERE id = ?").run(req.params.id);
      db.prepare("UPDATE parcels SET status = 'IN_TRANSIT' WHERE id = ?").run(assignment.parcel_id);
      newStatus = 'IN_TRANSIT';

      // Notify sender
      const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(assignment.parcel_id);
      const traveler = db.prepare('SELECT name FROM users WHERE id = ?').get(assignment.traveler_id);
      if (parcel) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message)
          VALUES (?, ?, 'PARCEL_UPDATE', 'Parcel In Transit', ?)
        `).run(uuidv4(), parcel.sender_id, `Your parcel ${parcel.tracking_code} is now in transit with traveler ${traveler ? traveler.name : 'N/A'}.`);

        // Notify ALL agents in destination city that traveler is coming
        const destAgents = db.prepare(`
          SELECT id FROM users WHERE role = 'AGENT' AND LOWER(city) = LOWER(?)
        `).all(parcel.destination_city);

        for (const agent of destAgents) {
          db.prepare(`
            INSERT INTO notifications (id, user_id, type, title, message)
            VALUES (?, ?, 'DELIVERY_INCOMING', 'Traveler Heading to Your City', ?)
          `).run(uuidv4(), agent.id, `Traveler ${traveler ? traveler.name : 'N/A'} is in transit with parcel ${parcel.tracking_code} heading to ${parcel.destination_city}. Be ready to claim this delivery when they arrive.`);
        }
      }
    }

    res.json({
      success: true,
      data: {
        assignment_id: req.params.id,
        status: newStatus,
        agent_handed: updatedAssignment.agent_handed,
        traveler_received: 1
      },
      message: newStatus === 'IN_TRANSIT'
        ? 'Both parties confirmed. Parcel is now in transit!'
        : 'Receipt confirmed. Waiting for agent to confirm handoff.'
    });
  } catch (error) {
    console.error('Confirm-received error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/assignments/:id/reached — traveler marks they've reached destination city
router.patch('/:id/reached', authMiddleware, roleCheck('TRAVELER'), (req, res) => {
  try {
    const db = getDb();
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (assignment.traveler_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. This assignment is not yours.' });
    }

    if (!['PICKED_UP', 'IN_TRANSIT'].includes(assignment.status)) {
      return res.status(400).json({ success: false, message: 'Assignment must be in PICKED_UP or IN_TRANSIT state to mark as reached.' });
    }

    const now = new Date().toISOString();
    db.prepare("UPDATE assignments SET status = 'REACHED', reached_time = ? WHERE id = ?").run(now, req.params.id);
    db.prepare("UPDATE parcels SET status = 'REACHED' WHERE id = ?").run(assignment.parcel_id);

    // Get parcel and traveler details
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(assignment.parcel_id);
    const traveler = db.prepare('SELECT id, name, phone FROM users WHERE id = ?').get(assignment.traveler_id);

    // Notify ALL agents in destination city (not auto-assign, let them claim it)
    if (parcel) {
      const destAgents = db.prepare(`
        SELECT id FROM users WHERE role = 'AGENT' AND LOWER(city) = LOWER(?)
      `).all(parcel.destination_city);

      for (const agent of destAgents) {
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message)
          VALUES (?, ?, 'DELIVERY_AVAILABLE', 'Delivery Available in Your City', ?)
        `).run(
          uuidv4(),
          agent.id,
          `Traveler ${traveler ? traveler.name : 'N/A'} has arrived at ${parcel.destination_city} with parcel ${parcel.tracking_code}. Claim this delivery to pickup from traveler and deliver to ${parcel.receiver_name} at ${parcel.receiver_address}, ${parcel.receiver_city}.`
        );
      }
    }

    // Notify sender
    if (parcel) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'PARCEL_UPDATE', 'Parcel Reached Destination City', ?)
      `).run(uuidv4(), parcel.sender_id, `Your parcel ${parcel.tracking_code} has reached ${parcel.destination_city}. Delivery to ${parcel.receiver_name} will happen soon.`);
    }

    res.json({
      success: true,
      data: { assignment_id: req.params.id, status: 'REACHED', reached_time: now },
      message: 'Marked as reached. Destination agent has been notified for final delivery.'
    });
  } catch (error) {
    console.error('Reached error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/assignments/:id/deliver — mark delivered (verify OTP)
router.patch('/:id/deliver', authMiddleware, roleCheck('TRAVELER', 'AGENT', 'ADMIN'), (req, res) => {
  try {
    const { otp } = req.body;
    const db = getDb();
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (!['IN_TRANSIT', 'REACHED'].includes(assignment.status)) {
      return res.status(400).json({ success: false, message: 'Assignment must be in IN_TRANSIT or REACHED state to mark as delivered.' });
    }

    // Verify OTP
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(assignment.parcel_id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    if (!otp || otp !== parcel.otp_code) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Delivery cannot be confirmed.' });
    }

    const now = new Date().toISOString();
    db.prepare("UPDATE assignments SET status = 'DELIVERED', delivery_time = ? WHERE id = ?").run(now, req.params.id);
    db.prepare("UPDATE parcels SET status = 'DELIVERED' WHERE id = ?").run(assignment.parcel_id);

    // Credit traveler commission (70% of estimated price)
    if (parcel.estimated_price) {
      const commission = Math.round(parcel.estimated_price * 0.7 * 100) / 100;
      const traveler = db.prepare('SELECT * FROM users WHERE id = ?').get(assignment.traveler_id);
      const newBalance = (traveler.wallet_balance || 0) + commission;

      db.prepare('UPDATE users SET wallet_balance = ? WHERE id = ?').run(newBalance, assignment.traveler_id);
      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description)
        VALUES (?, ?, 'COMMISSION', ?, ?, ?)
      `).run(uuidv4(), assignment.traveler_id, commission, newBalance, `Delivery commission for parcel ${parcel.tracking_code}`);

      // Notify traveler about payment
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'PAYMENT', 'Payment Received', ?)
      `).run(uuidv4(), assignment.traveler_id, `You earned Rs ${commission} for delivering parcel ${parcel.tracking_code}.`);
    }

    // Credit pickup agent commission (10% of estimated price) if agent assigned
    if (assignment.agent_id && parcel.estimated_price) {
      const agentCommission = Math.round(parcel.estimated_price * 0.1 * 100) / 100;
      const agent = db.prepare('SELECT * FROM users WHERE id = ?').get(assignment.agent_id);
      const newAgentBalance = (agent.wallet_balance || 0) + agentCommission;

      db.prepare('UPDATE users SET wallet_balance = ? WHERE id = ?').run(newAgentBalance, assignment.agent_id);
      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description)
        VALUES (?, ?, 'COMMISSION', ?, ?, ?)
      `).run(uuidv4(), assignment.agent_id, agentCommission, newAgentBalance, `Pickup commission for parcel ${parcel.tracking_code}`);

      // Notify pickup agent about payment
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'PAYMENT', 'Commission Earned', ?)
      `).run(uuidv4(), assignment.agent_id, `You earned Rs ${agentCommission} pickup commission for parcel ${parcel.tracking_code}.`);
    }

    // Credit destination agent commission (10% of estimated price) if destination agent assigned
    if (assignment.destination_agent_id && parcel.estimated_price) {
      const destAgentCommission = Math.round(parcel.estimated_price * 0.1 * 100) / 100;
      const destAgent = db.prepare('SELECT * FROM users WHERE id = ?').get(assignment.destination_agent_id);
      const newDestAgentBalance = (destAgent.wallet_balance || 0) + destAgentCommission;

      db.prepare('UPDATE users SET wallet_balance = ? WHERE id = ?').run(newDestAgentBalance, assignment.destination_agent_id);
      db.prepare(`
        INSERT INTO transactions (id, user_id, type, amount, balance_after, description)
        VALUES (?, ?, 'COMMISSION', ?, ?, ?)
      `).run(uuidv4(), assignment.destination_agent_id, destAgentCommission, newDestAgentBalance, `Delivery commission for parcel ${parcel.tracking_code}`);

      // Notify destination agent about payment
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'PAYMENT', 'Commission Earned', ?)
      `).run(uuidv4(), assignment.destination_agent_id, `You earned Rs ${destAgentCommission} delivery commission for parcel ${parcel.tracking_code}.`);
    }

    // Notify sender
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message)
      VALUES (?, ?, 'PARCEL_UPDATE', 'Parcel Delivered!', ?)
    `).run(uuidv4(), parcel.sender_id, `Your parcel ${parcel.tracking_code} has been delivered successfully to ${parcel.receiver_name}.`);

    res.json({
      success: true,
      data: { assignment_id: req.params.id, status: 'DELIVERED', delivery_time: now },
      message: 'Parcel delivered successfully! OTP verified.'
    });
  } catch (error) {
    console.error('Deliver error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;
