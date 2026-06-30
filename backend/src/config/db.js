const mongoose = require('mongoose');
const { markFallbackMode } = require('../utils/dbState');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI not configured');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      autoIndex: false,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.env.USE_FALLBACK_DATA = 'false';
  } catch (error) {
    console.error(`Error: ${error.message}`);
    markFallbackMode(error.message);
    throw error;
  }
};

module.exports = connectDB;
