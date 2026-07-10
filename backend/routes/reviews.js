const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews — submit a review for a delivered parcel
router.post('/', authMiddleware, (req, res) => {
  try {
    const { parcel_id, rating, comment } = req.body;

    if (!parcel_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'parcel_id and rating are required.'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    const db = getDb();

    // Verify the parcel exists and is delivered
    const parcel = db.prepare('SELECT * FROM parcels WHERE id = ?').get(parcel_id);
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found.'
      });
    }

    if (parcel.status !== 'DELIVERED') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for delivered parcels.'
      });
    }

    // Check if user already reviewed this parcel
    const existingReview = db.prepare('SELECT id FROM reviews WHERE parcel_id = ? AND reviewer_id = ?').get(parcel_id, req.user.id);
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this delivery.'
      });
    }

    // Determine the reviewee (the traveler assigned to the parcel)
    const assignment = db.prepare('SELECT traveler_id FROM assignments WHERE parcel_id = ?').get(parcel_id);
    const revieweeId = assignment ? assignment.traveler_id : null;

    if (!revieweeId) {
      return res.status(400).json({
        success: false,
        message: 'No traveler found for this parcel.'
      });
    }

    const reviewId = uuidv4();
    db.prepare(`
      INSERT INTO reviews (id, parcel_id, reviewer_id, reviewee_id, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(reviewId, parcel_id, req.user.id, revieweeId, rating, comment || null);

    res.status(201).json({
      success: true,
      data: {
        review: {
          id: reviewId,
          parcel_id,
          rating,
          comment: comment || null,
        }
      },
      message: 'Review submitted successfully.'
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

// GET /api/reviews/user/:userId — get reviews for a user
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();

    const reviews = db.prepare(`
      SELECT r.*, u.name as reviewer_name
      FROM reviews r
      JOIN users u ON u.id = r.reviewer_id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
    `).all(userId);

    const avgRating = db.prepare('SELECT AVG(rating) as avg FROM reviews WHERE reviewee_id = ?').get(userId);

    res.json({
      success: true,
      data: {
        reviews,
        average_rating: avgRating?.avg || 0,
        total_reviews: reviews.length,
      },
      message: 'Reviews retrieved successfully.'
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
});

module.exports = router;
