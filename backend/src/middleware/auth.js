const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { shouldUseFallbackData } = require('../utils/dbState');
const { getFallbackUserById } = require('../utils/fallbackData');

// Protect routes
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');

    // Attach user to request (supporting fallback mode)
    if (shouldUseFallbackData()) {
      req.user = getFallbackUserById(decoded.id);
    } else {
      req.user = await User.findById(decoded.id).select('-password');
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not found with this token',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route',
    });
  }
};

module.exports = { protect };
