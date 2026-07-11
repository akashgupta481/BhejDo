const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

function generateTrackingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'BD-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function normalizeCity(city) {
  if (!city) return null;
  return city.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// POST /api/parcels — create parcel (sender only)
router.post('/', authMiddleware, roleCheck('SENDER', 'TRAVELER'), (req, res) => {
  try {
    const {
      receiver_name, receiver_phone, receiver_address, receiver_city,
      pickup_city, destination_city, weight, dimensions, description,
      photos, insurance, estimated_price
    } = req.body;

    if (!receiver_name || !receiver_phone || !receiver_address || !receiver_city || !pickup_city || !destination_city) {
      return res.status(400).json({
        success: false,
        message: 'Receiver details, pickup city, and destination city are required.'
      });
    }

    const db = getDb();
    const parcelId = uuidv4();
    const trackingCode = generateTrackingCode();
    const otpCode = generateOTP();

    db.prepare(`
      INSERT INTO parcels (id, sender_id, receiver_name, receiver_phone, receiver_address, receiver_city, pickup_city, destination_city, weight, dimensions, description, photos, insurance, estimated_price, status, otp_code, tracking_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CREATED', ?, ?)
    `).run(
      parcelId, req.user.id, receiver_name, receiver_phone, receiver_address,
      normalizeCity(receiver_city), normalizeCity(pickup_city), normalizeCity(destination_city), weight || null,
      dimensions || null, description || null, photos ? JSON.stringify(photos) : null,
      insurance ? 1 : 0, estimated_price || null, otpCode, trackingCode
    );

    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(parcelId);

    // Create notification for sender
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message)
      VALUES (?, ?, 'PARCEL_CREATED', 'Parcel Created', ?)
    `).run(uuidv4(), req.user.id, `Your parcel to ${destination_city} has been created. Tracking code: ${trackingCode}`);

    res.status(201).json({
      success: true,
      data: { parcel },
      message: 'Parcel created successfully.'
    });
  } catch (error) {
    console.error('Create parcel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// GET /api/parcels — list user's parcels (filtered by role)
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let parcels;
    let total;

    if (req.user.role === 'SENDER') {
      let query = 'SELECT * FROM parcels WHERE sender_id = ?';
      let countQuery = 'SELECT COUNT(*) as count FROM parcels WHERE sender_id = ?';
      const params = [req.user.id];

      if (status) {
        query += ' AND status = ?';
        countQuery += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      total = db.prepare(countQuery).get(...params).count;
      parcels = db.prepare(query).all(...params, parseInt(limit), parseInt(offset));
    } else if (req.user.role === 'TRAVELER') {
      let query = `
        SELECT p.* FROM parcels p
        JOIN assignments a ON a.parcel_id = p.id
        WHERE a.traveler_id = ?
      `;
      let countQuery = `
        SELECT COUNT(*) as count FROM parcels p
        JOIN assignments a ON a.parcel_id = p.id
        WHERE a.traveler_id = ?
      `;
      const params = [req.user.id];

      if (status) {
        query += ' AND p.status = ?';
        countQuery += ' AND p.status = ?';
        params.push(status);
      }

      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      total = db.prepare(countQuery).get(...params).count;
      parcels = db.prepare(query).all(...params, parseInt(limit), parseInt(offset));
    } else if (req.user.role === 'AGENT') {
      let query = `
        SELECT p.* FROM parcels p
        JOIN assignments a ON a.parcel_id = p.id
        WHERE a.agent_id = ?
      `;
      let countQuery = `
        SELECT COUNT(*) as count FROM parcels p
        JOIN assignments a ON a.parcel_id = p.id
        WHERE a.agent_id = ?
      `;
      const params = [req.user.id];

      if (status) {
        query += ' AND p.status = ?';
        countQuery += ' AND p.status = ?';
        params.push(status);
      }

      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      total = db.prepare(countQuery).get(...params).count;
      parcels = db.prepare(query).all(...params, parseInt(limit), parseInt(offset));
    } else {
      // ADMIN sees all
      let query = 'SELECT * FROM parcels';
      let countQuery = 'SELECT COUNT(*) as count FROM parcels';
      const params = [];

      if (status) {
        query += ' WHERE status = ?';
        countQuery += ' WHERE status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      total = db.prepare(countQuery).get(...params).count;
      parcels = db.prepare(query).all(...params, parseInt(limit), parseInt(offset));
    }

    res.json({
      success: true,
      data: {
        parcels,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Parcels retrieved successfully.'
    });
  } catch (error) {
    console.error('List parcels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// GET /api/parcels/available — browse available parcels (for travelers)
router.get('/available', authMiddleware, roleCheck('TRAVELER', 'SENDER'), (req, res) => {
  try {
    const db = getDb();
    const { city, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Get traveler's current city for sort preference
    const travelerUser = db.prepare('SELECT city FROM users WHERE id = ?').get(req.user.id);
    const travelerCity = city || (travelerUser ? travelerUser.city : '');

    let query = `
      SELECT p.*, u.name as sender_name, u.city as sender_city
      FROM parcels p
      JOIN users u ON u.id = p.sender_id
      WHERE p.status = 'CREATED'
    `;
    let countQuery = `
      SELECT COUNT(*) as count FROM parcels p
      WHERE p.status = 'CREATED'
    `;
    const params = [];
    const countParams = [];

    if (city) {
      query += ' AND (LOWER(p.pickup_city) = LOWER(?) OR LOWER(p.destination_city) = LOWER(?))';
      countQuery += ' AND (LOWER(p.pickup_city) = LOWER(?) OR LOWER(p.destination_city) = LOWER(?))';
      params.push(city, city);
      countParams.push(city, city);
    }

    // Sort by city match first (traveler's city parcels appear at top), then by created_at
    if (travelerCity) {
      query += ` ORDER BY
        CASE WHEN LOWER(p.pickup_city) = LOWER(?) THEN 0 ELSE 1 END,
        p.created_at DESC
        LIMIT ? OFFSET ?`;
      params.push(travelerCity);
    } else {
      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    }

    const total = db.prepare(countQuery).get(...countParams).count;
    const parcels = db.prepare(query).all(...params, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        parcels,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: `Found ${parcels.length} available parcel(s).`
    });
  } catch (error) {
    console.error('Available parcels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// GET /api/parcels/track/:trackingCode — public tracking
router.get('/track/:trackingCode', (req, res) => {
  try {
    const db = getDb();
    const parcel = db.prepare(`
      SELECT id, receiver_city, pickup_city, destination_city, weight, status, tracking_code, created_at
      FROM parcels WHERE tracking_code = ?
    `).get(req.params.trackingCode);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found with this tracking code.'
      });
    }

    // Get assignment info if exists
    const assignment = db.prepare(`
      SELECT a.status as assignment_status, a.pickup_time, a.delivery_time,
             u.name as traveler_name
      FROM assignments a
      JOIN users u ON u.id = a.traveler_id
      WHERE a.parcel_id = ?
    `).get(parcel.id);

    res.json({
      success: true,
      data: {
        parcel,
        assignment: assignment || null
      },
      message: 'Tracking info retrieved.'
    });
  } catch (error) {
    console.error('Track parcel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// GET /api/parcels/:id — get parcel details with timeline
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(req.params.id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found.'
      });
    }

    // Check access: sender owns it, or traveler/agent assigned to it, or admin
    if (req.user.role === 'SENDER' && parcel.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    // Get sender info
    const sender = db.prepare('SELECT id, name, phone, city FROM users WHERE id = ?').get(parcel.sender_id);

    // Get assignment info
    const assignment = db.prepare(`
      SELECT a.*,
             t.name as traveler_name, t.phone as traveler_phone,
             ag.name as agent_name, ag.phone as agent_phone
      FROM assignments a
      LEFT JOIN users t ON t.id = a.traveler_id
      LEFT JOIN users ag ON ag.id = a.agent_id
      WHERE a.parcel_id = ?
    `).get(parcel.id);

    // Build timeline
    const timeline = [];
    timeline.push({ status: 'CREATED', timestamp: parcel.created_at, description: 'Parcel created' });

    if (assignment) {
      if (['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(assignment.status)) {
        timeline.push({ status: 'MATCHED', timestamp: assignment.created_at, description: `Matched with traveler ${assignment.traveler_name}` });
      }
      if (['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(assignment.status) && assignment.pickup_time) {
        timeline.push({ status: 'PICKED_UP', timestamp: assignment.pickup_time, description: 'Parcel picked up' });
      }
      if (['IN_TRANSIT', 'DELIVERED'].includes(assignment.status)) {
        timeline.push({ status: 'IN_TRANSIT', timestamp: assignment.pickup_time, description: 'Parcel in transit' });
      }
      if (assignment.status === 'DELIVERED' && assignment.delivery_time) {
        timeline.push({ status: 'DELIVERED', timestamp: assignment.delivery_time, description: 'Parcel delivered' });
      }
    }

    res.json({
      success: true,
      data: {
        parcel,
        sender,
        assignment: assignment || null,
        timeline
      },
      message: 'Parcel details retrieved.'
    });
  } catch (error) {
    console.error('Get parcel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// POST /api/parcels/:id/accept — traveler accepts a parcel directly
router.post('/:id/accept', authMiddleware, roleCheck('TRAVELER', 'SENDER'), (req, res) => {
  try {
    const db = getDb();
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(req.params.id);

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    if (parcel.status !== 'CREATED') {
      return res.status(400).json({ success: false, message: 'Parcel is not available for acceptance.' });
    }

    // A user cannot accept (as traveler) a parcel they sent themselves.
    if (parcel.sender_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot accept your own parcel.' });
    }

    // Traveler must upload a travel ticket image to accept the order.
    const ticketImage = req.body && req.body.ticket_image;
    if (!ticketImage || typeof ticketImage !== 'string') {
      return res.status(400).json({ success: false, message: 'A travel ticket image is required to accept this order.' });
    }

    // Don't auto-assign agents - let them claim the job themselves
    const traveler = db.prepare('SELECT id, name, phone, city FROM users WHERE id = ?').get(req.user.id);
    const sender = db.prepare('SELECT id, name, phone, address, city FROM users WHERE id = ?').get(parcel.sender_id);

    // Create assignment (no trip_id needed, no agents assigned yet)
    const assignmentId = uuidv4();
    db.prepare(`
      INSERT INTO assignments (id, parcel_id, trip_id, traveler_id, agent_id, destination_agent_id, status, ticket_image)
      VALUES (?, ?, NULL, ?, NULL, NULL, 'MATCHED', ?)
    `).run(
      assignmentId,
      parcel.id,
      req.user.id,
      ticketImage
    );

    // Update parcel status to MATCHED
    db.prepare("UPDATE parcels SET status = 'MATCHED' WHERE id = ?").run(parcel.id);

    // Notify ALL agents in pickup city so they can claim it
    const senderAddress = sender ? `${sender.address || ''}, ${sender.city || parcel.pickup_city}` : parcel.pickup_city;
    const pickupMessage = `Pickup parcel ${parcel.tracking_code} from ${sender ? sender.name : 'sender'} at ${senderAddress}. Hand to traveler ${traveler ? traveler.name : 'N/A'}.`;

    const pickupAgents = db.prepare(`
      SELECT id FROM users WHERE role = 'AGENT' AND LOWER(city) = LOWER(?)
    `).all(parcel.pickup_city);

    for (const agent of pickupAgents) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'PICKUP_AVAILABLE', 'Pickup Available in Your City', ?)
      `).run(uuidv4(), agent.id, pickupMessage);
    }

    // Notify sender: "Your parcel has been accepted by traveler"
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message)
      VALUES (?, ?, 'ASSIGNMENT_ACCEPTED', 'Parcel Accepted by Traveler', ?)
    `).run(
      uuidv4(),
      parcel.sender_id,
      `Your parcel ${parcel.tracking_code} has been accepted by traveler ${traveler ? traveler.name : 'a traveler'}. An agent will pick it up from you soon.`
    );

    const assignment = db.prepare(`
      SELECT a.*,
             p.receiver_name, p.receiver_phone, p.receiver_address, p.receiver_city,
             p.pickup_city, p.destination_city, p.tracking_code, p.description, p.weight,
             t.name as traveler_name, t.phone as traveler_phone,
             ag.name as agent_name, ag.phone as agent_phone,
             s.name as sender_name, s.phone as sender_phone, s.address as sender_address, s.city as sender_city
      FROM assignments a
      JOIN parcels p ON p.id = a.parcel_id
      JOIN users t ON t.id = a.traveler_id
      LEFT JOIN users ag ON ag.id = a.agent_id
      JOIN users s ON s.id = p.sender_id
      WHERE a.id = ?
    `).get(assignmentId);

    res.status(201).json({
      success: true,
      data: { assignment },
      message: 'Parcel accepted successfully. Agent will be notified for pickup.'
    });
  } catch (error) {
    console.error('Accept parcel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/parcels/:id/status — update status
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['CREATED', 'MATCHED', 'PICKED_UP', 'IN_TRANSIT', 'REACHED', 'DELIVERED', 'CANCELLED'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const db = getDb();
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(req.params.id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found.'
      });
    }

    // Only sender can cancel their own parcel, others need proper role
    if (status === 'CANCELLED' && req.user.role === 'SENDER' && parcel.sender_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    db.prepare('UPDATE parcels SET status = ? WHERE id = ?').run(status, req.params.id);

    const updatedParcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(req.params.id);

    // Notify sender of status change
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message)
      VALUES (?, ?, 'PARCEL_UPDATE', 'Parcel Status Updated', ?)
    `).run(uuidv4(), parcel.sender_id, `Your parcel ${parcel.tracking_code} is now ${status}.`);

    res.json({
      success: true,
      data: { parcel: updatedParcel },
      message: `Parcel status updated to ${status}.`
    });
  } catch (error) {
    console.error('Update parcel status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;
