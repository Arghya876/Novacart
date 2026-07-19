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
  forgotPassword,
  resetPassword,
  verifyEmail,
  deleteMe,
  requestDeleteOtp,
  googleAuth,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/refresh', refreshToken);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);
router.post('/verifyemail', verifyEmail);
router.post('/logout', protect, logout);
router.post('/request-delete-otp', protect, requestDeleteOtp);
router.delete('/deleteme', protect, deleteMe);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.post('/address', protect, addAddress);
router.delete('/address/:addressId', protect, deleteAddress);

// Admin-only User Management
router.get('/users', protect, authorize('admin'), getUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
