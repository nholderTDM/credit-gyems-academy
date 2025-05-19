const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Login with Firebase token
exports.loginWithToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'ID token is required'
      });
    }
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Find or create user
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    
    if (!user) {
      user = new User({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        firstName: decodedToken.name ? decodedToken.name.split(' ')[0] : '',
        lastName: decodedToken.name ? decodedToken.name.split(' ').slice(1).join(' ') : '',
        lastLoginAt: new Date()
      });
      
      await user.save();
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Register additional user data
exports.register = async (req, res, next) => {
  try {
    // User ID is from auth middleware
    const userId = req.user._id;
    const { firstName, lastName, phone } = req.body;
    
    // Update user profile
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user details'
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        creditScore: user.creditScore,
        targetCreditScore: user.targetCreditScore,
        creditGoals: user.creditGoals,
        membershipStatus: user.membershipStatus,
        isSubscribedToEmails: user.isSubscribedToEmails,
        communicationPreferences: user.communicationPreferences,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, phone, creditScore, targetCreditScore, creditGoals, communicationPreferences } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (creditScore) user.creditScore = creditScore;
    if (targetCreditScore) user.targetCreditScore = targetCreditScore;
    if (creditGoals) user.creditGoals = creditGoals;
    if (communicationPreferences) {
      user.communicationPreferences = {
        ...user.communicationPreferences,
        ...communicationPreferences
      };
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        creditScore: user.creditScore,
        targetCreditScore: user.targetCreditScore,
        creditGoals: user.creditGoals,
        communicationPreferences: user.communicationPreferences
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};