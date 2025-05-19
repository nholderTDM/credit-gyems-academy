const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authController.loginWithToken);

// Protected routes
router.post('/register', protect, authController.register);
router.get('/me', protect, authController.getCurrentUser);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;