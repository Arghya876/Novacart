const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a coupon code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: [true, 'Please specify discount type (percentage or fixed)'],
    },
    discountAmount: {
      type: Number,
      required: [true, 'Please specify discount amount'],
      min: [0, 'Discount amount must be positive'],
    },
    minActiveValue: {
      type: Number,
      default: 0,
      min: [0, 'Minimum active value must be positive'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Please specify an expiry date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Method to check if coupon is valid
CouponSchema.methods.isValid = function (orderAmount = 0) {
  const isExpired = new Date() > this.expiryDate;
  const isAmountValid = orderAmount >= this.minActiveValue;
  return this.isActive && !isExpired && isAmountValid;
};

module.exports = mongoose.model('Coupon', CouponSchema);
