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
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieOptions = {
    expires: new Date(
      Date.now() + (parseInt(process.env.REFRESH_TOKEN_COOKIE_EXPIRE) || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
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

// @desc    Google OAuth Login/Register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, role } = req.body;

    if (!credential) {
      return res.status(400).json({ success: false, error: 'Google credential token is required' });
    }

    let payload;
    const axios = require('axios');
    try {
      const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      payload = googleRes.data;
    } catch (err) {
      try {
        const base64Url = credential.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          Buffer.from(base64, 'base64')
            .toString('utf-8')
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        payload = JSON.parse(jsonPayload);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid Google token' });
      }
    }

    const { email, name, picture, sub } = payload || {};
    if (!email) {
      return res.status(400).json({ success: false, error: 'Google token did not provide an email' });
    }

    const targetRole = role === 'seller' ? 'seller' : 'customer';
    const useFallback = shouldUseFallbackData();
    if (useFallback) {
      const fallbackUser = {
        _id: 'google_' + (sub || Date.now()),
        name: name || 'Google User',
        email,
        role: targetRole,
        avatar: picture || '',
        isVerified: true,
      };
      return res.status(200).json({
        success: true,
        accessToken: 'fallback-google-token',
        user: {
          id: fallbackUser._id,
          name: fallbackUser.name,
          email: fallbackUser.email,
          role: fallbackUser.role,
          avatar: fallbackUser.avatar,
          isVerified: true,
        },
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
    } else {
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        role: targetRole,
        avatar: picture || '',
        isVerified: true,
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Strong Password Policy Validation (Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
      });
    }

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

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      emailVerificationOtp: hashedOtp,
      emailVerificationOtpExpire: Date.now() + 60 * 60 * 1000, // 1 hour
      isVerified: false,
    });

    // Send welcome & verification email with full account details
    const sendEmail = require('../utils/sendEmail');
    const message = `Welcome to NovaCart, ${user.name}!\n\nThank you for creating your account. Here are your registered account details:\n\n• Name: ${user.name}\n• Email: ${user.email}\n• Account Type: ${user.role.toUpperCase()}\n• Registration Timestamp: ${new Date().toISOString()}\n\nPlease verify your email to log in and activate your account. Your 6-digit verification OTP is:\n\n${otp}\n\nThis OTP is valid for 1 hour. Welcome aboard!`;

    const htmlWelcomeEmail = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e5e7eb; shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #f3f4f6;">
          <h1 style="color: #6d28d9; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">NovaCart</h1>
          <p style="color: #6b7280; font-size: 13px; margin-top: 4px;">Welcome to Your Next Generation Shopping Destination</p>
        </div>

        <div style="padding: 24px 0;">
          <h2 style="color: #111827; font-size: 18px; margin-top: 0;">Welcome aboard, ${user.name}! 🎉</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            Thank you for creating an account with <strong>NovaCart</strong>. We are thrilled to have you! Here are your registered account details:
          </p>

          <div style="margin: 20px 0; padding: 18px; background-color: #f9fafb; border-radius: 12px; border-left: 4px solid #6d28d9; font-size: 13px; line-height: 1.8; color: #374151;">
            <strong>• Full Name:</strong> ${user.name}<br>
            <strong>• Registered Email:</strong> ${user.email}<br>
            <strong>• Account Type:</strong> ${user.role.toUpperCase()}<br>
            <strong>• Registered On:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            To complete your registration and activate your account, please verify your email address using the 6-digit OTP below:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; padding: 14px 28px; background-color: #f3e8ff; border: 2px dashed #9333ea; border-radius: 12px;">
              <span style="font-size: 28px; font-weight: 800; letter-spacing: 8px; color: #6d28d9; font-mono: monospace;">${otp}</span>
            </div>
            <p style="color: #9ca3af; font-size: 11px; margin-top: 8px;">This code expires in 1 hour.</p>
          </div>
        </div>

        <div style="padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; line-height: 1.5;">
          <p>If you did not initiate this account creation, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} NovaCart Inc. All rights reserved.</p>
        </div>
      </div>
    `;

    let mailInfo = null;
    try {
      mailInfo = await sendEmail({
        email: user.email,
        subject: `Welcome to NovaCart! Account Details & Verification OTP`,
        message,
        html: htmlWelcomeEmail,
      });
    } catch (err) {
      console.error('Failed to send welcome verification email on register:', err.message);
    }

    res.status(201).json({
      success: true,
      isVerified: false,
      email: user.email,
      message: 'Registration successful! A verification OTP has been sent to your email.',
      previewUrl: mailInfo?.previewUrl || null,
    });
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
      return res.status(401).json({ success: false, error: 'No registered account found with this email. Please create an account first.' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Incorrect password for this account.' });
    }

    // Block unverified users & send verification OTP
    if (!user.isVerified) {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const crypto = require('crypto');
      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

      user.emailVerificationOtp = hashedOtp;
      user.emailVerificationOtpExpire = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save({ validateBeforeSave: false });

      // Send email
      const sendEmail = require('../utils/sendEmail');
      const message = `Please verify your email to log in and activate your account. Your 6-digit verification OTP is:\n\n${otp}\n\nThis OTP is valid for 1 hour.`;

      let mailInfo = null;
      try {
        mailInfo = await sendEmail({
          email: user.email,
          subject: 'NovaCart Email Verification OTP',
          message,
        });
      } catch (err) {
        console.error('Failed to send verification email on login:', err.message);
      }

      return res.status(403).json({
        success: false,
        isVerified: false,
        email: user.email,
        error: 'Your email address is not verified. A verification OTP has been sent to your email.',
        previewUrl: mailInfo?.previewUrl || null,
      });
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
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    if (!refreshSecret && process.env.NODE_ENV === 'production') {
      throw new Error('REFRESH_TOKEN_SECRET environment variable is missing in production!');
    }
    const decoded = jwt.verify(token, refreshSecret || 'fallback_refresh_token_secret');

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

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
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

// @desc    Forgot Password (Send OTP)
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Please provide an email' });
    }

    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      console.log(`[MOCK forgotPassword] OTP request for fallback user: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'OTP sent to email (Mock Mode)',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and expiration (10 minutes)
    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Send via email
    const sendEmail = require('../utils/sendEmail');
    const message = `You requested a password reset. Your 6-digit verification OTP is:\n\n${otp}\n\nThis OTP is valid for 10 minutes. If you did not request this, please ignore this email.`;

    try {
      const mailInfo = await sendEmail({
        email: user.email,
        subject: 'NovaCart Password Reset OTP',
        message,
      });

      res.status(200).json({ 
        success: true, 
        message: 'OTP sent to email',
        previewUrl: mailInfo?.previewUrl || null
      });
    } catch (err) {
      console.error(err);
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email, OTP, and new password' });
    }

    // Strong Password Policy Validation (Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
      });
    }

    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      console.log(`[MOCK resetPassword] Password reset for fallback user: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'Password reset successful (Mock Mode)',
      });
    }

    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Find user by email, matching OTP and checking expiration
    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Set new password (will be hashed automatically by user pre-save hook)
    user.password = password;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verifyemail
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Please provide email and OTP' });
    }

    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully (Mock Mode)',
        user: { email, name: 'Fallback User', role: 'customer' },
        accessToken: 'fallback-token',
      });
    }

    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Find user by email, matching OTP and checking expiration
    const user = await User.findOne({
      email,
      emailVerificationOtp: hashedOtp,
      emailVerificationOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired verification OTP' });
    }

    // Activate user
    user.isVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpire = undefined;

    await user.save();

    // Send Welcome Email
    const sendEmail = require('../utils/sendEmail');
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #6d28d9; text-align: center;">Welcome to NovaCart!</h2>
        <p>Dear ${user.name},</p>
        <p>Congratulations! Your email address has been successfully verified, and your NovaCart account is now fully active.</p>
        <p>You can now browse products, add items to your cart, set up your shipping addresses, and place orders seamlessly.</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #6d28d9; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Start Shopping ↗</a>
        </div>
        
        <p>If you did not sign up for this account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
        <p style="font-size: 11px; color: #777; text-align: center;">&copy; ${new Date().getFullYear()} NovaCart. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to NovaCart - Account Activated',
        message: 'Welcome to NovaCart! Your account is now active.',
        html: welcomeHtml,
      });
    } catch (err) {
      console.error('Welcome email failed to send:', err.message);
    }

    // Log the user in and return tokens
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Request OTP for account deletion
// @route   POST /api/auth/request-delete-otp
// @access  Private
exports.requestDeleteOtp = async (req, res, next) => {
  try {
    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      return res.status(200).json({
        success: true,
        message: 'Deletion OTP sent to email (Mock Mode)',
        previewUrl: null,
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.deleteAccountOtp = hashedOtp;
    user.deleteAccountOtpExpire = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save({ validateBeforeSave: false });

    // Send email
    const sendEmail = require('../utils/sendEmail');
    const message = `Dear ${user.name},\n\nWe received a request to permanently delete your NovaCart account. To confirm this action, please enter the following 6-digit OTP:\n\n${otp}\n\nThis OTP is valid for 15 minutes. If you did not request this, please ignore this email.`;

    let mailInfo = null;
    try {
      mailInfo = await sendEmail({
        email: user.email,
        subject: 'NovaCart Account Deletion OTP',
        message,
      });
    } catch (err) {
      console.error('Failed to send account deletion OTP email:', err.message);
      return res.status(500).json({ success: false, error: 'Failed to send verification email' });
    }

    res.status(200).json({
      success: true,
      message: 'Deletion OTP sent to email',
      previewUrl: mailInfo?.previewUrl || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete current user account
// @route   DELETE /api/auth/deleteme
// @access  Private
exports.deleteMe = async (req, res, next) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, error: 'Please provide the verification OTP' });
    }

    const useFallback = process.env.USE_FALLBACK_DATA === 'true';
    if (useFallback) {
      console.log(`[MOCK deleteMe] Deleting fallback user account: ${req.user.id}`);
      return res.status(200).json({ success: true, message: 'Account deleted successfully (Mock Mode)' });
    }

    const crypto = require('crypto');
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      _id: req.user.id,
      deleteAccountOtp: hashedOtp,
      deleteAccountOtpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired deletion OTP' });
    }

    const userEmail = user.email;
    const userName = user.name;

    // Delete user
    await user.deleteOne();

    // Send goodbye email
    const sendEmail = require('../utils/sendEmail');
    const message = `Dear ${userName},\n\nYour NovaCart account has been successfully deleted as requested. We are sad to see you go!\n\nIf this was a mistake, please register a new account at any time.`;
    try {
      await sendEmail({
        email: userEmail,
        subject: 'NovaCart Account Deleted Successfully',
        message,
      });
    } catch (err) {
      console.error('Failed to send goodbye email:', err.message);
    }

    // Clear refresh cookie
    res.cookie('refreshToken', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
