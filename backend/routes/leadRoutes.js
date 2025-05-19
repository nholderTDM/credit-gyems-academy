const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.post('/', leadController.createLead);

// Admin routes
router.get('/', protect, adminOnly, leadController.getLeads);
router.put('/:id/status', protect, adminOnly, leadController.updateLeadStatus);
router.post('/:id/convert', protect, adminOnly, leadController.convertLead);

module.exports = router;