const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');

// Load environment variables FIRST
dotenv.config();

console.log('🚀 Starting Credit Gyems Academy Backend Server...');

// Skip Firebase Admin SDK - using REST API instead
console.log('⚠️  Using Firebase REST API for authentication (no Admin SDK)');

// MongoDB connection with improved options
// Load optimized MongoDB options
const mongoOptions = require('./fix-mongo-pool');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, mongoOptions)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => {
    console.error(`   - ${envVar}`);
  });
  console.error('🔧 Please check your .env file in the backend folder');
  process.exit(1);
}

console.log('✅ Environment variables loaded successfully');

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for ngrok/production
app.set('trust proxy', 1);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'https://*.ngrok-free.app',
  'https://*.ngrok.io'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);  
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    callback(null, true); // Allow all for development
  },
  credentials: true
}));

// Body parser middleware
// CRITICAL: Webhook route MUST use raw body BEFORE other middleware
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

// Add session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Regular JSON middleware for other routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import Stripe
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  console.log('✅ Stripe initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Stripe:', error.message);
}

// Health check endpoint (before routes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    stripe: stripe ? 'configured' : 'not configured',
    firebase: 'REST API mode'
  });
});

// Database health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    let canQuery = false;
    if (dbStatus === 1) {
      try {
        await mongoose.connection.db.admin().ping();
        canQuery = true;
      } catch (err) {
        console.error('DB ping failed:', err);
      }
    }
    
    res.status(200).json({
      success: true,
      database: {
        status: dbStates[dbStatus],
        statusCode: dbStatus,
        canQuery: canQuery,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('DB health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: {
        status: 'error',
        statusCode: mongoose.connection.readyState
      }
    });
  }
});

// Import and use routes - ONLY ONCE
const routes = require('./routes');
app.use('/api', routes);
console.log('✅ Routes loaded successfully');

// Webhook endpoint for Stripe
app.post('/api/orders/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    console.log(`✅ Webhook verified: ${event.type}`);
    res.json({ received: true });
  } catch (err) {
    console.error(`❌ Webhook error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Webhook test endpoint
app.get('/api/webhook-test', (req, res) => {
  res.status(200).json({
    message: 'Webhook endpoint is accessible',
    webhook_url: '/api/orders/webhook',
    method: 'POST',
    timestamp: new Date().toISOString()
  });
});

// Routes info endpoint
app.get('/api/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) {
      routes.push({
        method: Object.keys(middleware.route.methods)[0].toUpperCase(),
        path: middleware.route.path
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach(handler => {
        if (handler.route) {
          const path = middleware.regexp.source.match(/\\\/([^\\]+)/);
          routes.push({
            method: Object.keys(handler.route.methods)[0].toUpperCase(),
            path: `/${path ? path[1] : ''}${handler.route.path}`
          });
        }
      });
    }
  });
  res.json({ routes });
});

// 404 handler for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 Global error:', err);
  
  if (err.type === 'entity.too.large' || 
      err.message === 'request entity too large' ||
      (err.status === 413)) {
    return res.status(413).json({
      success: false,
      message: 'Internal server error',
      error: 'request entity too large'
    });
  }
  
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON',
      error: 'Malformed JSON in request body'
    });
  }
  
  const status = err.status || 500;
  res.status(status).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message || 'Something went wrong'
  });
});

// Start server with keep-alive settings
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`💾 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
  console.log(`🔐 Auth: Firebase REST API + MongoDB`);
  
  // Set keep-alive to prevent connection drops
  server.keepAliveTimeout = 120000; // 2 minutes
  server.headersTimeout = 120000;   // 2 minutes
});

// Handle server errors
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

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server gracefully');
  server.close(() => {
    mongoose.connection.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('💥 Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  console.error('🔧 Check your environment variables and dependencies');
  process.exit(1);
});

module.exports = app;