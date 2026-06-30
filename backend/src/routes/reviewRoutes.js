const express = require('express');
const router = express.Router();
const {
  addReview,
  deleteReview,
  getProductReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public route
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
