const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,
  type: {
    type: String,
    enum: ['ebook', 'masterclass', 'consultation'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPrice: Number,
  currency: {
    type: String,
    default: 'USD'
  },
  featuredImage: String,
  galleryImages: [String],
  pdfFile: String,
  pageCount: Number,
  eventDate: Date,
  duration: Number,
  location: String,
  capacity: Number,
  features: [String],
  contentTable: [
    {
      title: String,
      description: String
    }
  ],
  tags: [String],
  categories: [String],
  isPopular: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seoTitle: String,
  seoDescription: String,
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date
});

// Update the 'updatedAt' field on save
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  next();
});

// Create slug from title
ProductSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-');
  }
  
  next();
});

module.exports = mongoose.model('Product', ProductSchema);