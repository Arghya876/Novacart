require('dotenv').config();
const app = require('./app');
const debugLog = require('./utils/debugLog');
const { markFallbackMode, getDbStatus } = require('./utils/dbState');
const connectDB = async () => {
  const db = require('./config/db');
  await db();
};

const PORT = process.env.PORT || 5000;
let server;

const startServer = async () => {
  try {
    await connectDB();
    // #region agent log
    await debugLog('server.js:connectDB', 'MongoDB connected', { readyState: require('mongoose').connection.readyState }, 'H1', 'post-fix');
    // #endregion
    if (process.env.NODE_ENV !== 'production') {
      const autoSeed = require('./utils/autoSeed');
      await autoSeed();
      // #region agent log
      await debugLog('server.js:autoSeed', 'Auto-seed completed', {}, 'H5', 'post-fix');
      // #endregion
    }
    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      // #region agent log
      debugLog('server.js:listen', 'HTTP server listening', { port: PORT, dbReadyState: require('mongoose').connection.readyState }, 'H1', 'post-fix');
      // #endregion
    });
  } catch (err) {
    // #region agent log
    await debugLog('server.js:connectDB', 'MongoDB connection failed', { error: err.message }, 'H3', 'post-fix');
    // #endregion
    console.error(`MongoDB connection failed: ${err.message}`);
    markFallbackMode(err.message);
    console.log('Starting server in fallback mode without database...');
    server = app.listen(PORT, () => {
      console.log(`Server running in fallback mode on port ${PORT}`);
      console.log('Database status:', getDbStatus());
    });
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // #region agent log
  debugLog('server.js:unhandledRejection', 'Unhandled rejection', { error: err.message }, 'H3', 'post-fix');
  // #endregion
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
