// fix-mongo-pool.js
// MongoDB connection options compatible with all driver versions

const mongoOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
  retryWrites: true,
  w: 'majority',
  // Add connection retry logic
  retryReads: true,
  readPreference: 'primaryPreferred',
  // Remove unsupported options: keepAlive, keepAliveInitialDelay
  heartbeatFrequencyMS: 10000
};

module.exports = mongoOptions;
