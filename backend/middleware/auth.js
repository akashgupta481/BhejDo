const jwt = require('jsonwebtoken');
const { getDb } = require('../db/connection');

const JWT_SECRET = process.env.JWT_SECRET || 'bhejdo-secret-key-change-in-production';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, phone, role, city, verified, wallet_balance FROM users WHERE id = ?').get(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
