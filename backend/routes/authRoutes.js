// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);

// Protected routes (authentication required)
router.get('/profile', protect, authController.getCurrentUser);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);

// Admin routes
router.get('/users', protect, adminOnly, authController.getAllUsers);
router.get('/users/:id', protect, adminOnly, authController.getUserById);
router.put('/users/:id', protect, adminOnly, authController.updateUserByAdmin);
router.delete('/users/:id', protect, adminOnly, authController.deleteUser);

module.exports = router;