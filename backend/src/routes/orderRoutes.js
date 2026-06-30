const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
  cancelOrderItem,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// All routes are protected
router.use(protect);

router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/items/:productId/cancel', cancelOrderItem);

// Seller/Admin routes
router.get('/', authorize('seller', 'admin'), getOrders);
router.put('/:id/status', authorize('seller', 'admin'), updateOrderStatus);

// Admin-only route
router.delete('/:id', authorize('admin'), deleteOrder);

module.exports = router;
