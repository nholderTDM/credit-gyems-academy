const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

// Public routes (no authentication required)
router.post('/login', authController.loginWithToken);
router.post('/register', authController.register);

// Protected routes (authentication required)
router.get('/me', protect, authController.getCurrentUser);
router.put('/profile', protect, authController.updateProfile);

// Example admin route
router.get('/admin/users', protect, restrictTo('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin endpoint - list users would go here'
  });
});

module.exports = router;