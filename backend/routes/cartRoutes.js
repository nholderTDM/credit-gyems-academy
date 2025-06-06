const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Simple cart implementation using sessions
router.get('/', protect, (req, res) => {
  const cart = req.session?.cart || { items: [], total: 0 };
  res.status(200).json({ success: true, data: cart });
});

router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1, type = 'product' } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    if (!req.session) req.session = {};
    if (!req.session.cart) req.session.cart = { items: [], total: 0 };
    
    const existingItemIndex = req.session.cart.items.findIndex(
      item => item.productId === productId && item.type === type
    );
    
    if (existingItemIndex > -1) {
      req.session.cart.items[existingItemIndex].quantity += quantity;
    } else {
      req.session.cart.items.push({ productId, type, quantity, addedAt: new Date() });
    }
    
    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: req.session.cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to cart' });
  }
});

module.exports = router;
