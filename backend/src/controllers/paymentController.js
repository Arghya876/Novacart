const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'dummy_stripe_key');
const Razorpay = require('razorpay');

// Initialize Razorpay conditionally
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// @desc    Create Stripe Payment Intent
// @route   POST /api/payments/stripe/intent
// @access  Private
exports.createStripePaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, error: 'Please provide payment amount' });
    }

    // Check if we are in mock mode (i.e. dummy key is being used)
    if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === 'dummy_stripe_key') {
      console.warn('Stripe key not configured. Using Mock Payment Intent.');
      return res.status(200).json({
        success: true,
        clientSecret: 'mock_client_secret_' + Math.random().toString(36).substring(2, 15),
        isMock: true,
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency || 'usd',
      metadata: { integration_check: 'accept_a_payment', userId: req.user.id },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Razorpay Order
// @route   POST /api/payments/razorpay/order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, error: 'Please provide payment amount' });
    }

    // Check if we are in mock mode
    if (!razorpay) {
      console.warn('Razorpay keys not configured. Using Mock Razorpay Order.');
      return res.status(200).json({
        success: true,
        id: 'mock_order_' + Math.random().toString(36).substring(2, 15),
        amount: Math.round(amount * 100),
        currency: currency || 'INR',
        isMock: true,
      });
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency: currency || 'INR',
      receipt: 'receipt_order_' + Math.random().toString(36).substring(2, 10),
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
