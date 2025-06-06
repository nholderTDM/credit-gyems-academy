const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Public route - no authentication required
router.post('/', contactController.submitContactForm);

module.exports = router;