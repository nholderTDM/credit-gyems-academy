// update-server-routes.js
// Script to add missing routes to server configuration

const fs = require('fs');
const path = require('path');

// Add to routes/index.js
const routesIndexAddition = `
// Add cart routes
try {
    console.log('📍 Loading cartRoutes...');
    const cartRoutes = require('./cartRoutes');
    router.use('/cart', cartRoutes);
    console.log('✅ cartRoutes loaded successfully');
} catch (error) {
    console.error('❌ Error loading cartRoutes:', error.message);
}
`;

// Health DB endpoint to add to server.js
const healthDbEndpoint = `
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
    
    // Test database connection with a simple query
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
`;

console.log('🔧 Server routes update instructions:\n');

console.log('1. Add cart routes to routes/index.js (after contact routes):');
console.log('```javascript' + routesIndexAddition + '\n```\n');

console.log('2. Add health/db endpoint to server.js (after the regular health endpoint):');
console.log('```javascript' + healthDbEndpoint + '\n```\n');

console.log('3. Make sure to create routes/cartRoutes.js with the content from the artifact above\n');

console.log('4. If using sessions for cart, add session middleware to server.js:');
console.log('```javascript');
console.log("const session = require('express-session');");
console.log("app.use(session({");
console.log("  secret: process.env.SESSION_SECRET || 'your-secret-key',");
console.log("  resave: false,");
console.log("  saveUninitialized: false,");
console.log("  cookie: { secure: false } // Set true in production with HTTPS");
console.log("}));");
console.log('```\n');

console.log('✅ After making these changes, restart your server!');