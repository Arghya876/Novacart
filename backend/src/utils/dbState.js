const mongoose = require('mongoose');

const isMongoConnected = () => mongoose.connection?.readyState === 1;

const markFallbackMode = (reason = 'Database unavailable') => {
  process.env.USE_FALLBACK_DATA = 'true';
  if (reason) {
    console.warn(`Falling back to local demo data: ${reason}`);
  }
};

const shouldUseFallbackData = () => {
  if (process.env.USE_FALLBACK_DATA === 'true') {
    return true;
  }

  if (!process.env.MONGO_URI) {
    return true;
  }

  return !isMongoConnected();
};

const getDbStatus = () => ({
  connected: isMongoConnected(),
  readyState: mongoose.connection?.readyState ?? 0,
  useFallback: shouldUseFallbackData(),
});

module.exports = {
  isMongoConnected,
  markFallbackMode,
  shouldUseFallbackData,
  getDbStatus,
};
