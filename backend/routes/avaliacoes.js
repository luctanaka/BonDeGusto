const express = require('express');
const Review = require('../models/Review');
const router = express.Router();

// Get all approved reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new review
router.post('/', async (req, res) => {
  try {
    const { nome, email, nota, comentario } = req.body;
    
    // Validation
    if (!nome || !email || !nota || !comentario) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (nota < 1 || nota > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    const review = new Review({
      nome,
      email,
      nota,
      comentario,
      status: 'pending' // Reviews need approval
    });
    
    await review.save();
    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get review statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$nota' },
          ratingDistribution: {
            $push: '$nota'
          }
        }
      }
    ]);
    
    if (stats.length === 0) {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      });
    }
    
    const result = stats[0];
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.ratingDistribution.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });
    
    res.json({
      totalReviews: result.totalReviews,
      averageRating: Math.round(result.averageRating * 10) / 10,
      ratingDistribution: distribution
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;