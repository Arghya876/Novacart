const Coupon = require('../models/Coupon');

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Private (Admin)
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin)
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate a coupon code
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: 'Please provide a coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    if (!coupon.isValid(subtotal)) {
      // Check specific reasons
      const isExpired = new Date() > coupon.expiryDate;
      const isAmountValid = subtotal >= coupon.minActiveValue;

      if (!coupon.isActive) {
        return res.status(400).json({ success: false, error: 'Coupon is inactive' });
      }
      if (isExpired) {
        return res.status(400).json({ success: false, error: 'Coupon has expired' });
      }
      if (!isAmountValid) {
        return res.status(400).json({
          success: false,
          error: `Minimum purchase of $${coupon.minActiveValue} required for this coupon`,
        });
      }

      return res.status(400).json({ success: false, error: 'Coupon is invalid' });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon applied successfully',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: coupon.discountAmount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }

    await coupon.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
