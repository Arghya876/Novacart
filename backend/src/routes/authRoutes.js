const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateDetails,
  addAddress,
  deleteAddress,
  getUsers,
  deleteUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);

// Admin-only User Management
router.get('/users', protect, authorize('admin'), getUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
