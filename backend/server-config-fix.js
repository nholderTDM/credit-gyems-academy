// server-config-fix.js
// Add these configurations to your server.js

// Improved MongoDB connection options
const mongoOptions = {
  maxPoolSize: 50,              // Increase pool size for tests
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,                    // Use IPv4
  retryWrites: true,
  w: 'majority'
};

// Keep-alive for HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Set keep-alive to prevent connection drops
  server.keepAliveTimeout = 120000; // 2 minutes
  server.headersTimeout = 120000;   // 2 minutes
});

// Graceful error handling
server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Handle process termination gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
