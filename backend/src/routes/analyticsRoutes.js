const express = require('express');
const router = express.Router();
const {
  getAdminAnalytics,
  getSellerAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/admin', protect, authorize('admin'), getAdminAnalytics);
router.get('/seller', protect, authorize('seller'), getSellerAnalytics);

module.exports = router;
