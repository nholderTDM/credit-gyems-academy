// Crash prevention utilities

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't exit, just log
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Only exit for critical errors
  if (err.code === 'EADDRINUSE') {
    process.exit(1);
  }
  // Otherwise, try to continue
});

// Increase memory limit warning
if (process.memoryUsage().heapUsed > 400 * 1024 * 1024) {
  console.warn('High memory usage detected');
}

module.exports = {
  setupCrashPrevention: () => {
    console.log('Crash prevention measures active');
  }
};
