const User = require('../models/User');
const jwt = require('jsonwebtoken');
const {
  authenticateFallbackUser,
  getFallbackUserByToken,
  getFallbackUserById,
  updateFallbackUser,
  addFallbackAddress,
  deleteFallbackAddress,
} = require('../utils/fallbackData');
const { shouldUseFallbackData } = require('../utils/dbState');

// Helper to set cookie and return tokens
const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = user.getSignedJwtToken();
  const refreshToken = user.getSignedRefreshToken();

  // Save refresh token in DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.REFRESH_TOKEN_COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        addresses: user.addresses,
        isVerified: user.isVerified,
      },
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const useFallback = shouldUseFallbackData();
    if (useFallback) {
      const fallbackUser = authenticateFallbackUser(email, password);
      if (!fallbackUser) {
        return res.status(400).json({ success: false, error: 'User already exists' });
      }
      return res.status(200).json({ success: true, ...fallbackUser });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const useFallback = shouldUseFallbackData();
    if (useFallback) {
      const fallbackUser = authenticateFallbackUser(email, password);
      if (!fallbackUser) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      return res.status(200).json({ success: true, ...fallbackUser });
    }

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh Token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, error: 'No refresh token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_token_secret');

    // Check if user exists and has this refresh token
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token' });
    }

    // Generate new Access Token
    const accessToken = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired refresh token' });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      return res.status(200).json({ success: true, data: {} });
    }

    const user = await User.findById(req.user.id);
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }

    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      const user = getFallbackUserById(req.user.id || req.user._id);
      return res.status(200).json({ success: true, data: user });
    }

    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      const user = updateFallbackUser(req.user.id || req.user._id, req.body);
      return res.status(200).json({ success: true, data: user });
    }

    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      avatar: req.body.avatar,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/address
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      const addresses = addFallbackAddress(req.user.id || req.user._id, req.body);
      return res.status(200).json({ success: true, data: addresses });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { street, city, state, zipCode, country, isDefault } = req.body;

    // If setting as default, unset previous default
    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({ street, city, state, zipCode, country, isDefault: isDefault || false });
    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/address/:addressId
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      const addresses = deleteFallbackAddress(req.user.id || req.user._id, req.params.addressId);
      return res.status(200).json({ success: true, data: addresses });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );

    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Prevent deleting own admin account
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, error: 'You cannot delete your own account' });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
