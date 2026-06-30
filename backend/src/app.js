const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error');

// Route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://novacart-arghya876.vercel.app',
      process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 requests in dev, 100 in prod
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 10 minutes',
  },
});
app.use('/api/', limiter);

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base route
const { getDbStatus } = require('./utils/dbState');
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to NovaCart API',
    database: getDbStatus()
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
