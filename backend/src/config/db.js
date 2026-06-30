const mongoose = require('mongoose');
const { markFallbackMode } = require('../utils/dbState');

let mongod = null;

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI not configured');
    }

    console.log('Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      autoIndex: false,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.env.USE_FALLBACK_DATA = 'false';
  } catch (error) {
    console.error(`Atlas Connection Error: ${error.message}`);
    
    // Fall back to in-memory MongoDB in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Attempting to start in-memory MongoDB server...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        
        console.log(`Connecting to In-Memory MongoDB at ${uri}...`);
        const conn = await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 5000,
          autoIndex: false,
        });
        console.log(`In-Memory MongoDB Connected: ${conn.connection.host}`);
        process.env.USE_FALLBACK_DATA = 'false';
        
        // Handle clean shutdown of in-memory server
        process.on('SIGINT', async () => {
          if (mongod) {
            await mongoose.disconnect();
            await mongod.stop();
          }
          process.exit(0);
        });
        
        return;
      } catch (memError) {
        console.error(`In-Memory MongoDB Error: ${memError.message}`);
      }
    }

    markFallbackMode(error.message);
    throw error;
  }
};

module.exports = connectDB;
