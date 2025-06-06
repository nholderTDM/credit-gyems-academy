// backend/routes/setupRoutes.js
const express = require('express');
const router = express.Router();
const calendarService = require('../services/calendarService');

// Admin only - setup calendar
router.get('/calendar-setup', (req, res) => {
  const authUrl = calendarService.getAuthUrl();
  if (!authUrl) {
    return res.status(500).json({ 
      success: false, 
      message: 'OAuth2 client not configured' 
    });
  }
  
  res.json({
    success: true,
    message: 'Visit this URL to authorize calendar access',
    authUrl
  });
});

// Callback route
router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }
  
  const stored = await calendarService.storeTokens(code);
  
  if (stored) {
    res.send('Calendar authorization successful! You can close this window.');
  } else {
    res.status(500).send('Failed to store credentials');
  }
});

module.exports = router;