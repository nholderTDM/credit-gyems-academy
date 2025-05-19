const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const mongoose = require('mongoose');
const emailService = require('../services/emailService');
const storageService = require('../services/storageService');

// Create payment intent
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { cartItems, paymentMethod } = req.body;
    const userId = req.user._id;
    
    if (!cartItems || !cartItems.length) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }
    
    // Get products from database to validate prices
    const productIds = cartItems.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    if (products.length !== productIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some products are not available'
      });
    }
    
    // Calculate order total
    let subtotal = 0;
    const orderItems = [];
    
    for (const cartItem of cartItems) {
      const product = products.find(p => p._id.toString() === cartItem.productId);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${cartItem.productId}`
        });
      }
      
      const itemPrice = product.discountPrice || product.price;
      const itemTotal = itemPrice * cartItem.quantity;
      
      subtotal += itemTotal;
      
      orderItems.push({
        product: product._id,
        productSnapshot: {
          title: product.title,
          price: itemPrice,
          type: product.type
        },
        quantity: cartItem.quantity,
        price: itemPrice,
        subtotal: itemTotal
      });
    }
    
    // No tax or shipping for digital products
    const total = subtotal;
    
    // Convert to cents for Stripe
    const amount = Math.round(total * 100);
    
    // Make sure user exists in Stripe or create them
    const user = await User.findById(userId);
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      // Create a customer in Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }
    
    // Determine payment method types
    const paymentMethodTypes = ['card'];
    
    if (paymentMethod === 'klarna') {
      paymentMethodTypes.push('klarna');
    } else if (paymentMethod === 'afterpay') {
      paymentMethodTypes.push('afterpay_clearpay');
    }
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method_types: paymentMethodTypes,
      metadata: {
        userId: userId.toString(),
        cartItems: JSON.stringify(cartItems)
      }
    });
    
    // Create order in pending state
    const order = new Order({
      userId,
      items: orderItems,
      subtotal,
      total,
      currency: 'USD',
      paymentMethod,
      paymentStatus: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      customerEmail: user.email,
      customerName: `${user.firstName} ${user.lastName}`
    });
    
    await order.save();
    
    res.status(200).json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        orderId: order._id,
        amount
      }
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment request'
    });
  }
};

// Get orders for current user
exports.getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Ensure the user owns this order or is an admin
    if (order.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order'
    });
  }
};

// Stripe webhook handler
exports.handleWebhook = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      // Add more event types as needed
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ received: true, error: error.message });
  }
};

// Handle successful payment
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    // Find order by paymentIntentId
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id
    });
    
    if (!order) {
      console.error('Order not found for payment intent:', paymentIntent.id);
      return;
    }
    
    // Update order status
    order.paymentStatus = 'completed';
    order.paidAt = new Date();
    
    await order.save();
    
    // Fulfill order (deliver digital products)
    await fulfillOrder(order._id);
    
    // Send confirmation email
    await emailService.sendOrderConfirmation(order._id);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
};

// Handle failed payment
const handlePaymentFailed = async (paymentIntent) => {
  try {
    // Find order by paymentIntentId
    const order = await Order.findOne({
      stripePaymentIntentId: paymentIntent.id
    });
    
    if (!order) {
      console.error('Order not found for payment intent:', paymentIntent.id);
      return;
    }
    
    // Update order status
    order.paymentStatus = 'failed';
    
    await order.save();
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
};

// Fulfill order (deliver digital products)
const fulfillOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('items.product');
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    // Check if order has been paid
    if (order.paymentStatus !== 'completed') {
      throw new Error(`Order has not been paid: ${orderId}`);
    }
    
    // Generate download links for digital products
    const downloadLinks = [];
    
    for (const item of order.items) {
      const product = item.product;
      
      if (product.type === 'ebook' && product.pdfFile) {
        // Generate signed URL with 7-day expiration
        const url = await storageService.getSignedUrl(product.pdfFile, 7 * 24 * 60); // 7 days in minutes
        
        downloadLinks.push({
          productId: product._id,
          title: product.title,
          url,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
      }
    }
    
    // Update order fulfillment status
    order.fulfillmentStatus = 'completed';
    order.fulfilledAt = new Date();
    order.fulfillmentDetails = {
      emailSent: true,
      emailSentAt: new Date(),
      downloadLinks
    };
    
    await order.save();
    
    return order;
  } catch (error) {
    console.error('Error fulfilling order:', error);
    throw error;
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const query = {};
    
    if (status) {
      query.paymentStatus = status;
    }
    
    // Count total orders
    const total = await Order.countDocuments(query);
    
    // Fetch orders with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};