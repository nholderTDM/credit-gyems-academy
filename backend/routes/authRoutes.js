const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // Fixed import

// Public routes (no authentication required)
router.post('/login', authController.loginWithToken);
router.post('/register', authController.register);

// Protected routes (authentication required)
router.get('/me', protect, authController.getCurrentUser);
router.put('/profile', protect, authController.updateProfile);

// Admin route - changed restrictTo to adminOnly
router.get('/admin/users', protect, adminOnly, (req, res) => {
  res.json({
    success: true,
    message: 'Admin endpoint - list users would go here'
  });
});

module.exports = router;