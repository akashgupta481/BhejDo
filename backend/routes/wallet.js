const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/wallet — get balance and transactions
router.get('/', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    const params = [req.user.id];
    let typeFilter = '';

    if (type) {
      typeFilter = ' AND type = ?';
      params.push(type);
    }

    const user = db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(req.user.id);

    const countQuery = `SELECT COUNT(*) as count FROM transactions WHERE user_id = ?${typeFilter}`;
    const total = db.prepare(countQuery).get(...params).count;

    const transactions = db.prepare(`
      SELECT * FROM transactions
      WHERE user_id = ?${typeFilter}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, parseInt(limit), parseInt(offset));

    res.json({
      success: true,
      data: {
        balance: user.wallet_balance,
        transactions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Wallet info retrieved.'
    });
  } catch (error) {
    console.error('Wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// POST /api/wallet/payout — request payout
router.post('/payout', authMiddleware, (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0.'
      });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (user.wallet_balance < amount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Current balance: Rs ${user.wallet_balance}`
      });
    }

    const newBalance = Math.round((user.wallet_balance - amount) * 100) / 100;

    db.prepare('UPDATE users SET wallet_balance = ? WHERE id = ?').run(newBalance, req.user.id);

    const transactionId = uuidv4();
    db.prepare(`
      INSERT INTO transactions (id, user_id, type, amount, balance_after, description)
      VALUES (?, ?, 'PAYOUT', ?, ?, 'Bank transfer payout requested')
    `).run(transactionId, req.user.id, amount, newBalance);

    // Notify user
    db.prepare(`
      INSERT INTO notifications (id, user_id, type, title, message)
      VALUES (?, ?, 'PAYOUT', 'Payout Requested', ?)
    `).run(uuidv4(), req.user.id, `Payout of Rs ${amount} has been initiated. It will be credited to your bank account within 2-3 business days.`);

    res.json({
      success: true,
      data: {
        transaction_id: transactionId,
        amount,
        new_balance: newBalance
      },
      message: 'Payout requested successfully. Amount will be transferred within 2-3 business days.'
    });
  } catch (error) {
    console.error('Payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// GET /api/wallet/earnings — traveler/agent earnings summary
router.get('/earnings', authMiddleware, (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    // Total earnings (all credits + commissions + rewards)
    const totalEarnings = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ? AND type IN ('COMMISSION', 'REWARD', 'CREDIT')
    `).get(userId);

    // Total payouts
    const totalPayouts = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ? AND type = 'PAYOUT'
    `).get(userId);

    // This month earnings
    const monthEarnings = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ? AND type IN ('COMMISSION', 'REWARD')
        AND created_at >= date('now', 'start of month')
    `).get(userId);

    // This week earnings
    const weekEarnings = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM transactions
      WHERE user_id = ? AND type IN ('COMMISSION', 'REWARD')
        AND created_at >= date('now', '-7 days')
    `).get(userId);

    // Completed deliveries count (as traveler, pickup agent, or destination agent)
    const completedDeliveries = db.prepare(`
      SELECT COUNT(*) as count
      FROM assignments
      WHERE (traveler_id = ? OR agent_id = ? OR destination_agent_id = ?) AND status = 'DELIVERED'
    `).get(userId, userId, userId);

    // Recent earnings (last 5)
    const recentEarnings = db.prepare(`
      SELECT * FROM transactions
      WHERE user_id = ? AND type IN ('COMMISSION', 'REWARD')
      ORDER BY created_at DESC
      LIMIT 5
    `).all(userId);

    res.json({
      success: true,
      data: {
        balance: req.user.wallet_balance,
        total_earnings: totalEarnings.total,
        total_payouts: totalPayouts.total,
        this_month: monthEarnings.total,
        this_week: weekEarnings.total,
        completed_deliveries: completedDeliveries.count,
        recent_earnings: recentEarnings
      },
      message: 'Earnings summary retrieved.'
    });
  } catch (error) {
    console.error('Earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;
