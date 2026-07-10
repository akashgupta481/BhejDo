const express = require('express');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — get user notifications
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 20, unread_only } = req.query;
    const offset = (page - 1) * limit;
    const params = [req.user.id];
    let unreadFilter = '';

    if (unread_only === 'true') {
      unreadFilter = ' AND read = 0';
    }

    const countQuery = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ?${unreadFilter}`;
    const total = db.prepare(countQuery).get(...params).count;

    const unreadCount = db.prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0').get(req.user.id).count;

    const notifications = db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?${unreadFilter}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount,
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
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/notifications/:id/read — mark as read
router.patch('/:id/read', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const notification = db.prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);

    res.json({
      success: true,
      data: { id: req.params.id, read: true },
      message: 'Notification marked as read.'
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/notifications/read-all — mark all read
router.patch('/read-all', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const result = db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0').run(req.user.id);

    res.json({
      success: true,
      data: { marked_count: result.changes },
      message: `${result.changes} notification(s) marked as read.`
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;
