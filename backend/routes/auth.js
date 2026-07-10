const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

const TOKEN_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY = '30d';

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

function normalizeCity(city) {
  if (!city) return null;
  return city.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, role, address, city } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.'
      });
    }

    if (!['SENDER', 'TRAVELER', 'AGENT'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be SENDER, TRAVELER, or AGENT.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.'
      });
    }

    const db = getDb();

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, role, address, city)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, name, email, phone || null, passwordHash, role, address || null, normalizeCity(city));

    const user = db.prepare('SELECT id, name, email, phone, role, address, city, verified, wallet_balance, created_at FROM users WHERE id = ?').get(userId);

    const token = generateToken(userId, role);
    const refreshToken = generateRefreshToken(userId);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
        refreshToken
      },
      message: 'Account created successfully.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      },
      message: 'Login successful.'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required.'
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.'
      });
    }

    const db = getDb();
    const user = db.prepare('SELECT id, role FROM users WHERE id = ?').get(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    const newToken = generateToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      },
      message: 'Token refreshed successfully.'
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token.'
    });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, phone, role, address, city, verified, wallet_balance, created_at FROM users WHERE id = ?').get(req.user.id);

    res.json({
      success: true,
      data: { user },
      message: 'User profile retrieved.'
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// POST /api/auth/verify-id — submit ID verification (mark as pending)
router.post('/verify-id', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, verified FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user.verified === 1) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified.'
      });
    }

    // For demo: immediately mark as verified (in production, this would be a pending review)
    db.prepare('UPDATE users SET verified = 1 WHERE id = ?').run(req.user.id);

    res.json({
      success: true,
      data: { id_verified: true, status: 'pending' },
      message: 'ID verification submitted. Your identity will be verified within 1-2 business days.'
    });
  } catch (error) {
    console.error('Verify ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// PATCH /api/auth/profile — update user profile
router.patch('/profile', authMiddleware, (req, res) => {
  try {
    const { name, phone, city, address } = req.body;
    const db = getDb();

    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      params.push(normalizeCity(city));
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update.'
      });
    }

    params.push(req.user.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    const user = db.prepare('SELECT id, name, email, phone, role, address, city, verified, wallet_balance, created_at FROM users WHERE id = ?').get(req.user.id);

    res.json({
      success: true,
      data: { user },
      message: 'Profile updated successfully.'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;
