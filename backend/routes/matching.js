const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

// POST /api/matching/find — find matching travelers for a parcel
router.post('/find', authMiddleware, roleCheck('SENDER', 'ADMIN'), (req, res) => {
  try {
    const { parcel_id } = req.body;

    if (!parcel_id) {
      return res.status(400).json({
        success: false,
        message: 'Parcel ID is required.'
      });
    }

    const db = getDb();
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(parcel_id);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found.'
      });
    }

    // Find trips that match the parcel route
    const matchingTrips = db.prepare(`
      SELECT t.*, u.name as traveler_name, u.phone as traveler_phone, u.city as traveler_city,
             (SELECT AVG(r.rating) FROM reviews r WHERE r.reviewee_id = u.id) as avg_rating,
             (SELECT COUNT(*) FROM assignments a2 WHERE a2.traveler_id = u.id AND a2.status = 'DELIVERED') as completed_deliveries
      FROM trips t
      JOIN users u ON u.id = t.traveler_id
      WHERE t.status = 'ACTIVE'
        AND t.available_capacity >= COALESCE(?, 0)
        AND t.travel_date >= date('now')
        AND LOWER(t.source_city) = LOWER(?)
        AND LOWER(t.destination_city) = LOWER(?)
      ORDER BY t.travel_date ASC
    `).all(parcel.weight, parcel.pickup_city, parcel.destination_city);

    res.json({
      success: true,
      data: {
        parcel: {
          id: parcel.id,
          pickup_city: parcel.pickup_city,
          destination_city: parcel.destination_city,
          weight: parcel.weight
        },
        matching_trips: matchingTrips,
        count: matchingTrips.length
      },
      message: matchingTrips.length > 0 ? `Found ${matchingTrips.length} matching traveler(s).` : 'No matching travelers found.'
    });
  } catch (error) {
    console.error('Find matching error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// POST /api/matching/assign — assign parcel to trip/traveler
router.post('/assign', authMiddleware, roleCheck('SENDER', 'ADMIN'), (req, res) => {
  try {
    const { parcel_id, trip_id, agent_id } = req.body;

    if (!parcel_id || !trip_id) {
      return res.status(400).json({
        success: false,
        message: 'Parcel ID and Trip ID are required.'
      });
    }

    const db = getDb();

    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(parcel_id);
    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found.' });
    }

    if (parcel.status !== 'CREATED') {
      return res.status(400).json({ success: false, message: 'Parcel has already been assigned or is not available.' });
    }

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(trip_id);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    if (trip.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Trip is not active.' });
    }

    if (parcel.weight && trip.available_capacity < parcel.weight) {
      return res.status(400).json({ success: false, message: 'Trip does not have enough capacity.' });
    }

    // Auto-assign an agent from the pickup city if none specified
    let resolvedAgentId = agent_id || null;
    if (!resolvedAgentId) {
      const autoAgent = db.prepare(`
        SELECT id FROM users WHERE role = 'AGENT' AND LOWER(city) = LOWER(?) LIMIT 1
      `).get(parcel.pickup_city);
      if (autoAgent) {
        resolvedAgentId = autoAgent.id;
      }
    }

    // Create assignment
    const assignmentId = uuidv4();
    db.prepare(`
      INSERT INTO assignments (id, parcel_id, trip_id, traveler_id, agent_id, status)
      VALUES (?, ?, ?, ?, ?, 'PENDING')
    `).run(assignmentId, parcel_id, trip_id, trip.traveler_id, resolvedAgentId);

    // Update parcel status
    db.prepare("UPDATE parcels SET status = 'MATCHED' WHERE id = ?").run(parcel_id);

    // Update trip available capacity
    const newCapacity = trip.available_capacity - (parcel.weight || 0);
    db.prepare('UPDATE trips SET available_capacity = ? WHERE id = ?').run(newCapacity, trip_id);

    // Notify traveler
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message)
      VALUES (?, ?, 'NEW_ASSIGNMENT', 'New Delivery Request', ?)
    `).run(uuidv4(), trip.traveler_id, `You have a new parcel delivery request from ${parcel.pickup_city} to ${parcel.destination_city}.`);

    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignmentId);

    res.status(201).json({
      success: true,
      data: { assignment },
      message: 'Parcel assigned to traveler. Waiting for acceptance.'
    });
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// POST /api/matching/accept — traveler accepts assignment
router.post('/accept', authMiddleware, roleCheck('TRAVELER', 'SENDER'), (req, res) => {
  try {
    const { assignment_id } = req.body;

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID is required.'
      });
    }

    const db = getDb();
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignment_id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (assignment.traveler_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'This assignment is not for you.' });
    }

    if (assignment.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Assignment is not in pending state.' });
    }

    db.prepare("UPDATE assignments SET status = 'ACCEPTED' WHERE id = ?").run(assignment_id);

    // Get parcel and traveler details for notifications
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(assignment.parcel_id);
    const traveler = db.prepare('SELECT * FROM users WHERE id = ?').get(assignment.traveler_id);
    const sender = parcel ? db.prepare('SELECT * FROM users WHERE id = ?').get(parcel.sender_id) : null;

    if (parcel) {
      // Notify sender with traveler name
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'ASSIGNMENT_ACCEPTED', 'Traveler Accepted', ?)
      `).run(uuidv4(), parcel.sender_id, `Your parcel ${parcel.tracking_code} has been matched with traveler ${traveler ? traveler.name : 'a traveler'}. Delivery from ${parcel.pickup_city} to ${parcel.destination_city}.`);

      // Notify agent if assigned — agent needs to pick up from sender
      if (assignment.agent_id) {
        const senderAddress = sender ? `${sender.address || ''}, ${sender.city || parcel.pickup_city}` : parcel.pickup_city;
        db.prepare(`
          INSERT INTO notifications (id, user_id, type, title, message)
          VALUES (?, ?, 'PICKUP_REQUEST', 'Parcel Pickup Required', ?)
        `).run(uuidv4(), assignment.agent_id, `Parcel ${parcel.tracking_code} has been accepted by traveler ${traveler ? traveler.name : 'N/A'}. Pickup from sender at ${senderAddress}. Deliver to traveler at ${parcel.pickup_city}.`);
      }
    }

    res.json({
      success: true,
      data: { assignment_id },
      message: 'Assignment accepted successfully.'
    });
  } catch (error) {
    console.error('Accept error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// POST /api/matching/reject — traveler rejects assignment
router.post('/reject', authMiddleware, roleCheck('TRAVELER', 'SENDER'), (req, res) => {
  try {
    const { assignment_id, reason } = req.body;

    if (!assignment_id) {
      return res.status(400).json({
        success: false,
        message: 'Assignment ID is required.'
      });
    }

    const db = getDb();
    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(assignment_id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (assignment.traveler_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'This assignment is not for you.' });
    }

    if (assignment.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Assignment is not in pending state.' });
    }

    // Delete the assignment
    db.prepare('DELETE FROM assignments WHERE id = ?').run(assignment_id);

    // Revert parcel status
    db.prepare("UPDATE parcels SET status = 'CREATED' WHERE id = ?").run(assignment.parcel_id);

    // Restore trip capacity
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(assignment.parcel_id);
    if (parcel && parcel.weight) {
      db.prepare('UPDATE trips SET available_capacity = available_capacity + ? WHERE id = ?').run(parcel.weight, assignment.trip_id);
    }

    // Notify sender
    if (parcel) {
      db.prepare(`
        INSERT INTO notifications (id, user_id, type, title, message)
        VALUES (?, ?, 'ASSIGNMENT_REJECTED', 'Traveler Declined', ?)
      `).run(uuidv4(), parcel.sender_id, `A traveler has declined your parcel delivery. ${reason ? 'Reason: ' + reason : 'Looking for another match...'}`);
    }

    res.json({
      success: true,
      data: { assignment_id },
      message: 'Assignment rejected. Parcel is available for re-matching.'
    });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;
