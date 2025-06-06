const Product = require('../models/product');
const mongoose = require('mongoose');

// Get all products
exports.getAllProducts = async (req, res, next) => {
  try {
    const { type, featured, popular, limit = 10, page = 1 } = req.query;
    
    // Build query
    const query = { status: 'published' };
    
    if (type) {
      query.type = type;
    }
    
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    if (popular === 'true') {
      query.isPopular = true;
    }
    
    // Count total products
    const total = await Product.countDocuments(query);
    
    // Fetch products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
};

// Create new product (admin only) - FIXED VERSION
exports.createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };
    
    // Map test data format to model format
    // Handle both 'title' and 'name'
    if (productData.title && !productData.name) {
      productData.name = productData.title;
    }
    if (!productData.title && productData.name) {
      productData.title = productData.name;
    }
    
    // Map 'ebook' and 'masterclass' types to valid enum values
    if (productData.type === 'ebook') {
      productData.type = 'digital';
      if (!productData.category) {
        productData.category = 'guide';
      }
    } else if (productData.type === 'masterclass') {
      productData.type = 'service';
      if (!productData.category) {
        productData.category = 'course';
      }
    }
    
    // Ensure required fields have defaults
    if (!productData.category) {
      productData.category = 'general';
    }
    
    // Add createdBy from authenticated user
    productData.createdBy = req.user._id;
    
    // Create product with mapped data
    const product = new Product(productData);
    
    await product.save();
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Update product fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt') {
        product[key] = req.body[key];
      }
    });
    
    await product.save();
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await Product.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
};
