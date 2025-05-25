// test-server.js
// Minimal server to test if the basic setup works

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🧪 Starting minimal test server...');

// Initialize Express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(cors());

// Test route - no external files
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Minimal test server is working!',
    timestamp: new Date().toISOString()
  });
});

// Test health route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Test API route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API route working',
    environment: process.env.NODE_ENV 
  });
});

// Connect to MongoDB (if configured)
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));
} else {
  console.log('⚠️  MongoDB not configured (missing MONGODB_URI)');
}

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Server error',
    error: err.message
  });
});

// Start server
const PORT = process.env.PORT || 5001; // Different port to avoid conflicts
app.listen(PORT, () => {
  console.log(`✅ Minimal test server running on port ${PORT}`);
  console.log(`🔗 Test at: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
});