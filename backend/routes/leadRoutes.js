const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/', leadController.createLead);
router.post('/newsletter', leadController.subscribeNewsletter);
router.post('/download-guide', leadController.downloadGuide);

// Protected admin routes
router.get('/analytics', protect, adminOnly, leadController.getLeadAnalytics);
router.get('/export', protect, adminOnly, leadController.exportLeads);

// Other admin routes (currently commented out until auth is fully working)
/*
router.use(protect); // Apply authentication to all routes below
router.use(adminOnly); // Apply admin restriction to all routes below

// Lead management routes
router.get('/', leadController.getLeads);
router.get('/stats', leadController.getLeadStats);
router.get('/:id', leadController.getLeadById);
router.put('/:id/status', leadController.updateLeadStatus);
router.post('/:id/convert', leadController.convertLead);
router.delete('/:id', leadController.deleteLead);
*/

module.exports = router;