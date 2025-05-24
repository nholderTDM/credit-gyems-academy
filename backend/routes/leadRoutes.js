const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
// Comment out auth middleware for now
// const { protect, restrictTo } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/', leadController.createLead);

// Comment out admin routes until auth is working
/*
// Protected admin routes
router.use(protect); // Apply authentication to all routes below
router.use(restrictTo('admin')); // Apply admin restriction to all routes below

// Lead management routes
router.get('/', leadController.getLeads);
router.get('/stats', leadController.getLeadStats);
router.get('/:id', leadController.getLeadById);
router.put('/:id/status', leadController.updateLeadStatus);
router.post('/:id/convert', leadController.convertLead);
router.delete('/:id', leadController.deleteLead);
*/

module.exports = router;