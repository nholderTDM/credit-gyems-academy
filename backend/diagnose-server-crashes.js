// diagnose-server-crashes.js
// Run this in your backend folder to catch server crashes
// Usage: node diagnose-server-crashes.js

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Global error handlers to catch crashes
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
});

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Log when response finishes
  res.on('finish', () => {
    console.log(`📤 ${req.method} ${req.path} - Status: ${res.statusCode}`);
  });
  
  next();
});

// Body parsing with error handling
app.use(express.json({
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.error('❌ Invalid JSON in request body:', e.message);
      throw new Error('Invalid JSON');
    }
  }
}));

// Load routes with error catching
console.log('\n🔌 Loading routes...\n');

const routes = [
  { name: 'auth', path: '/api/auth', file: './routes/authRoutes' },
  { name: 'products', path: '/api/products', file: './routes/productRoutes' },
  { name: 'community', path: '/api/community', file: './routes/communityRoutes' },
  { name: 'services', path: '/api/services', file: './routes/serviceRoutes' },
  { name: 'orders', path: '/api/orders', file: './routes/orderRoutes' },
  { name: 'bookings', path: '/api/bookings', file: './routes/bookingRoutes' },
  { name: 'leads', path: '/api/leads', file: './routes/leadRoutes' },
  { name: 'contact', path: '/api/contact', file: './routes/contactRoutes' }
];

routes.forEach(route => {
  try {
    const router = require(route.file);
    app.use(route.path, router);
    console.log(`✅ Loaded ${route.name} routes`);
  } catch (error) {
    console.error(`❌ Failed to load ${route.name} routes:`, error.message);
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    pid: process.pid,
    memory: process.memoryUsage(),
    uptime: process.uptime()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Express Error Handler:', err);
  console.error('   Request:', req.method, req.path);
  console.error('   Stack:', err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`⚠️  404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Connect to MongoDB with error handling
console.log('\n🔗 Connecting to MongoDB...\n');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected');
  
  // Monitor MongoDB connection
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.error('❌ MongoDB disconnected');
  });
})
.catch(err => {
  console.error('❌ MongoDB connection failed:', err);
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Diagnostic server running on port ${PORT}`);
  console.log('📊 Process ID:', process.pid);
  console.log('🔍 Watching for crashes and errors...\n');
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
});