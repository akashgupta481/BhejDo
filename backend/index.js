const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./db/connection');

const authRoutes = require('./routes/auth');
const parcelRoutes = require('./routes/parcels');
const tripRoutes = require('./routes/trips');
const matchingRoutes = require('./routes/matching');
const assignmentRoutes = require('./routes/assignments');
const walletRoutes = require('./routes/wallet');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

// Run migrations for handoff columns
try {
  const db = getDb();
  try { db.exec('ALTER TABLE assignments ADD COLUMN agent_handed INTEGER DEFAULT 0'); } catch (e) { /* column may already exist */ }
  try { db.exec('ALTER TABLE assignments ADD COLUMN traveler_received INTEGER DEFAULT 0'); } catch (e) { /* column may already exist */ }
  try { db.exec('ALTER TABLE assignments ADD COLUMN agent_handed_at TEXT'); } catch (e) { /* column may already exist */ }
  console.log('Handoff columns migration checked.');
} catch (e) {
  console.error('Migration error:', e.message);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://bhejdo.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    },
    message: 'BhejDo API is running.'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error.'
  });
});

app.listen(PORT, () => {
  console.log(`BhejDo Backend running on port ${PORT}`);
});

module.exports = app;
