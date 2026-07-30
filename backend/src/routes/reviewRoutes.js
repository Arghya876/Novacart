const express = require('express');
const router = express.Router();
const {
  addReview,
  deleteReview,
  getProductReviews,
  getAllReviews,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public route
router.get('/product/:productId', getProductReviews);

// Protected routes
router.get('/', protect, authorize('admin'), getAllReviews);
router.post('/', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
