const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

// POST /api/trips — create trip (traveler only)
router.post('/', authMiddleware, roleCheck('TRAVELER'), (req, res) => {
  try {
    const { source_city, destination_city, travel_date, capacity } = req.body;

    if (!source_city || !destination_city || !travel_date || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Source city, destination city, travel date, and capacity are required.'
      });
    }

    if (capacity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Capacity must be greater than 0.'
      });
    }

    const db = getDb();
    const tripId = uuidv4();

    db.prepare(`
      INSERT INTO trips (id, traveler_id, source_city, destination_city, travel_date, capacity, available_capacity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).run(tripId, req.user.id, source_city, destination_city, travel_date, capacity, capacity);

    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);

    res.status(201).json({
      success: true,
      data: { trip },
      message: 'Trip created successfully.'
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// GET /api/trips — list trips, filter by source/destination/date
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { source_city, destination_city, travel_date, status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    // If traveler, show only their trips
    if (req.user.role === 'TRAVELER') {
      conditions.push('t.traveler_id = ?');
      params.push(req.user.id);
    }

    if (source_city) {
      conditions.push('LOWER(t.source_city) LIKE LOWER(?)');
      params.push(`%${source_city}%`);
    }
    if (destination_city) {
      conditions.push('LOWER(t.destination_city) LIKE LOWER(?)');
      params.push(`%${destination_city}%`);
    }
    if (travel_date) {
      conditions.push('t.travel_date = ?');
      params.push(travel_date);
    }
    if (status) {
      conditions.push('t.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const countQuery = `SELECT COUNT(*) as count FROM trips t ${whereClause}`;
    const total = db.prepare(countQuery).get(...params).count;

    const query = `
      SELECT t.*, u.name as traveler_name, u.phone as traveler_phone, u.city as traveler_city
      FROM trips t
      JOIN users u ON u.id = t.traveler_id
      ${whereClause}
      ORDER BY t.travel_date ASC
      LIMIT ? OFFSET ?
    `;

    const trips = db.prepare(query).all(...params, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        trips,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Trips retrieved successfully.'
    });
  } catch (error) {
    console.error('List trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// GET /api/trips/available — available trips for matching
router.get('/available', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { source_city, destination_city, min_capacity } = req.query;
    const params = [];
    const conditions = ["t.status = 'ACTIVE'", 't.available_capacity > 0', "t.travel_date >= date('now')"];

    if (source_city) {
      conditions.push('LOWER(t.source_city) LIKE LOWER(?)');
      params.push(`%${source_city}%`);
    }
    if (destination_city) {
      conditions.push('LOWER(t.destination_city) LIKE LOWER(?)');
      params.push(`%${destination_city}%`);
    }
    if (min_capacity) {
      conditions.push('t.available_capacity >= ?');
      params.push(parseFloat(min_capacity));
    }

    const query = `
      SELECT t.*, u.name as traveler_name, u.city as traveler_city
      FROM trips t
      JOIN users u ON u.id = t.traveler_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY t.travel_date ASC
    `;

    const trips = db.prepare(query).all(...params);

    res.json({
      success: true,
      data: { trips },
      message: 'Available trips retrieved.'
    });
  } catch (error) {
    console.error('Available trips error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/trips/:id — update trip
router.patch('/:id', authMiddleware, roleCheck('TRAVELER'), (req, res) => {
  try {
    const db = getDb();
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found.'
      });
    }

    if (trip.traveler_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own trips.'
      });
    }

    const { source_city, destination_city, travel_date, capacity, status } = req.body;
    const updates = [];
    const params = [];

    if (source_city) { updates.push('source_city = ?'); params.push(source_city); }
    if (destination_city) { updates.push('destination_city = ?'); params.push(destination_city); }
    if (travel_date) { updates.push('travel_date = ?'); params.push(travel_date); }
    if (capacity) {
      const capacityDiff = capacity - trip.capacity;
      updates.push('capacity = ?');
      updates.push('available_capacity = ?');
      params.push(capacity);
      params.push(Math.max(0, trip.available_capacity + capacityDiff));
    }
    if (status) { updates.push('status = ?'); params.push(status); }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update.'
      });
    }

    params.push(req.params.id);
    db.prepare(`UPDATE trips SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updatedTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      data: { trip: updatedTrip },
      message: 'Trip updated successfully.'
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;
