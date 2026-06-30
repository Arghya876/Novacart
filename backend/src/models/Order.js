const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        title: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        status: {
          type: String,
          enum: ['Active', 'Cancelled'],
          default: 'Active',
        },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ['Stripe', 'Razorpay', 'COD'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    paymentDetails: {
      transactionId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Processing',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    deliveredAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
