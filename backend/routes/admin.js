const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/connection');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

const router = express.Router();

// POST /api/admin/login — dedicated admin login (no auth middleware needed)
router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === 'admin0408') {
    const token = jwt.sign({ role: 'SUPER_ADMIN', isAdmin: true }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ success: true, data: { token }, message: 'Admin access granted.' });
  }
  return res.status(401).json({ success: false, message: 'Invalid admin password.' });
});

// Admin auth middleware — accepts either regular ADMIN user token or super admin token
function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Allow super admin token (from /admin/login)
    if (decoded.role === 'SUPER_ADMIN' && decoded.isAdmin === true) {
      req.user = { id: 'SUPER_ADMIN', role: 'ADMIN', name: 'Super Admin' };
      return next();
    }
    // Allow regular ADMIN user token
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, phone, role, city, verified, wallet_balance FROM users WHERE id = ?').get(decoded.userId);
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// All subsequent admin routes require admin auth
router.use(adminAuthMiddleware);

// GET /api/admin/users — list all users with filters
router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const { role, city, verified, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    if (city) {
      conditions.push('LOWER(city) LIKE LOWER(?)');
      params.push(`%${city}%`);
    }
    if (verified !== undefined) {
      conditions.push('verified = ?');
      params.push(verified === 'true' ? 1 : 0);
    }
    if (search) {
      conditions.push('(LOWER(name) LIKE LOWER(?) OR LOWER(email) LIKE LOWER(?))');
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`).get(...params).count;

    const users = db.prepare(`
      SELECT id, name, email, phone, role, address, city, verified, wallet_balance, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Users retrieved.'
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/parcels — list all parcels with filters
router.get('/parcels', (req, res) => {
  try {
    const db = getDb();
    const { status, pickup_city, destination_city, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('p.status = ?');
      params.push(status);
    }
    if (pickup_city) {
      conditions.push('LOWER(p.pickup_city) LIKE LOWER(?)');
      params.push(`%${pickup_city}%`);
    }
    if (destination_city) {
      conditions.push('LOWER(p.destination_city) LIKE LOWER(?)');
      params.push(`%${destination_city}%`);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM parcels p ${whereClause}`).get(...params).count;

    const parcels = db.prepare(`
      SELECT p.*, u.name as sender_name, u.email as sender_email
      FROM parcels p
      JOIN users u ON u.id = p.sender_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

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
      message: 'Parcels retrieved.'
    });
  } catch (error) {
    console.error('Admin parcels error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/stats — dashboard statistics
router.get('/stats', (req, res) => {
  try {
    const db = getDb();

    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const usersByRole = db.prepare('SELECT role, COUNT(*) as count FROM users GROUP BY role').all();

    const totalParcels = db.prepare('SELECT COUNT(*) as count FROM parcels').get().count;
    const parcelsByStatus = db.prepare('SELECT status, COUNT(*) as count FROM parcels GROUP BY status').all();

    const totalTrips = db.prepare('SELECT COUNT(*) as count FROM trips').get().count;
    const activeTrips = db.prepare("SELECT COUNT(*) as count FROM trips WHERE status = 'ACTIVE'").get().count;

    const totalAssignments = db.prepare('SELECT COUNT(*) as count FROM assignments').get().count;
    const deliveredAssignments = db.prepare("SELECT COUNT(*) as count FROM assignments WHERE status = 'DELIVERED'").get().count;

    const totalRevenue = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'DEBIT'").get().total;
    const totalCommissions = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'COMMISSION'").get().total;
    const totalPayouts = db.prepare("SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'PAYOUT'").get().total;

    // Top cities
    const topPickupCities = db.prepare(`
      SELECT pickup_city as city, COUNT(*) as count
      FROM parcels
      GROUP BY pickup_city
      ORDER BY count DESC
      LIMIT 5
    `).all();

    const topDestinationCities = db.prepare(`
      SELECT destination_city as city, COUNT(*) as count
      FROM parcels
      GROUP BY destination_city
      ORDER BY count DESC
      LIMIT 5
    `).all();

    // Recent activity
    const recentParcels = db.prepare(`
      SELECT p.id, p.tracking_code, p.status, p.pickup_city, p.destination_city, p.created_at, u.name as sender_name
      FROM parcels p JOIN users u ON u.id = p.sender_id
      ORDER BY p.created_at DESC LIMIT 5
    `).all();

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          by_role: usersByRole
        },
        parcels: {
          total: totalParcels,
          by_status: parcelsByStatus
        },
        trips: {
          total: totalTrips,
          active: activeTrips
        },
        assignments: {
          total: totalAssignments,
          delivered: deliveredAssignments,
          delivery_rate: totalAssignments > 0 ? Math.round((deliveredAssignments / totalAssignments) * 100) : 0
        },
        revenue: {
          total_collected: totalRevenue,
          total_commissions: totalCommissions,
          total_payouts: totalPayouts,
          platform_earnings: Math.round((totalRevenue - totalCommissions) * 100) / 100
        },
        top_routes: {
          pickup_cities: topPickupCities,
          destination_cities: topDestinationCities
        },
        recent_parcels: recentParcels
      },
      message: 'Admin stats retrieved.'
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// PATCH /api/admin/users/:id — update user (verify, ban, etc)
router.patch('/users/:id', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { verified, role, wallet_balance, name, city } = req.body;
    const updates = [];
    const params = [];

    if (verified !== undefined) { updates.push('verified = ?'); params.push(verified ? 1 : 0); }
    if (role) { updates.push('role = ?'); params.push(role); }
    if (wallet_balance !== undefined) { updates.push('wallet_balance = ?'); params.push(wallet_balance); }
    if (name) { updates.push('name = ?'); params.push(name); }
    if (city) { updates.push('city = ?'); params.push(city); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    params.push(req.params.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const updatedUser = db.prepare('SELECT id, name, email, phone, role, address, city, verified, wallet_balance, created_at FROM users WHERE id = ?').get(req.params.id);

    res.json({
      success: true,
      data: { user: updatedUser },
      message: 'User updated successfully.'
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/transactions — all transactions
router.get('/transactions', (req, res) => {
  try {
    const db = getDb();
    const { type, user_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (type) {
      conditions.push('t.type = ?');
      params.push(type);
    }
    if (user_id) {
      conditions.push('t.user_id = ?');
      params.push(user_id);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM transactions t ${whereClause}`).get(...params).count;

    const transactions = db.prepare(`
      SELECT t.*, u.name as user_name, u.email as user_email, u.role as user_role
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Transactions retrieved.'
    });
  } catch (error) {
    console.error('Admin transactions error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/assignments — all assignments
router.get('/assignments', (req, res) => {
  try {
    const db = getDb();
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (status) {
      conditions.push('a.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM assignments a ${whereClause}`).get(...params).count;

    const assignments = db.prepare(`
      SELECT a.*,
        p.tracking_code, p.pickup_city, p.destination_city, p.receiver_name,
        t.name as traveler_name, t.email as traveler_email,
        ag.name as agent_name,
        dag.name as destination_agent_name
      FROM assignments a
      LEFT JOIN parcels p ON p.id = a.parcel_id
      LEFT JOIN users t ON t.id = a.traveler_id
      LEFT JOIN users ag ON ag.id = a.agent_id
      LEFT JOIN users dag ON dag.id = a.destination_agent_id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

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
      message: 'Assignments retrieved.'
    });
  } catch (error) {
    console.error('Admin assignments error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// GET /api/admin/notifications — all notifications
router.get('/notifications', (req, res) => {
  try {
    const db = getDb();
    const { type, user_id, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (type) {
      conditions.push('n.type = ?');
      params.push(type);
    }
    if (user_id) {
      conditions.push('n.user_id = ?');
      params.push(user_id);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const total = db.prepare(`SELECT COUNT(*) as count FROM notifications n ${whereClause}`).get(...params).count;

    const notifications = db.prepare(`
      SELECT n.*, u.name as user_name, u.email as user_email, u.role as user_role
      FROM notifications n
      JOIN users u ON u.id = n.user_id
      ${whereClause}
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Notifications retrieved.'
    });
  } catch (error) {
    console.error('Admin notifications error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// POST /api/admin/notifications/broadcast — send notification to all users of a role
router.post('/notifications/broadcast', (req, res) => {
  try {
    const db = getDb();
    const { role, title, message, type } = req.body;

    if (!title || !role) {
      return res.status(400).json({ success: false, message: 'Title and role are required.' });
    }

    const users = db.prepare('SELECT id FROM users WHERE role = ?').all(role);
    const { v4: uuidv4 } = require('uuid');

    const insertStmt = db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

    let count = 0;
    for (const user of users) {
      insertStmt.run(uuidv4(), user.id, type || 'BROADCAST', title, message || '');
      count++;
    }

    res.json({
      success: true,
      data: { sent: count },
      message: `Notification sent to ${count} ${role} users.`
    });
  } catch (error) {
    console.error('Admin broadcast error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
