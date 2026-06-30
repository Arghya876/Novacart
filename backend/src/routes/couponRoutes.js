const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getCoupons,
  validateCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Validate coupon is available to any logged-in user
router.post('/validate', protect, validateCoupon);

// Admin-only routes
router.post('/', protect, authorize('admin'), createCoupon);
router.get('/', protect, authorize('admin'), getCoupons);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

module.exports = router;
