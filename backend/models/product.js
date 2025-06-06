const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  // Support both 'name' and 'title' for compatibility
  name: { 
    type: String, 
    required: function() { return !this.title; },
    trim: true 
  },
  title: { 
    type: String, 
    required: function() { return !this.name; },
    trim: true 
  },
  slug: { type: String },
  description: { type: String, required: true },
  shortDescription: { type: String },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number },
  category: { 
    type: String, 
    required: false, // Make optional
    enum: ['guide', 'course', 'template', 'bundle', 'service', 'general', 'general'],
    default: 'general'
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['digital', 'physical', 'service', 'ebook', 'masterclass', 'consultation', 'general'] 
  },
  features: [{ type: String }],
  images: [{ url: String, alt: String }],
  galleryImages: [String],
  featuredImage: String,
  downloadUrl: { type: String },
  pdfFile: { type: String },
  stock: { type: Number, default: -1, min: -1 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  salesCount: { type: Number, default: 0 },
  rating: { average: { type: Number, default: 0, min: 0, max: 5 }, count: { type: Number, default: 0 } },
  metadata: { type: Map, of: String },
  status: { type: String, enum: ['draft', 'published', 'archived', 'general'], default: 'published' },
  
  // Event-specific fields
  eventDate: { type: Date },
  duration: { type: Number },
  capacity: { type: Number },
  
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware
ProductSchema.pre('save', async function(next) {
  this.updatedAt = Date.now();
  
  // If title is provided but not name, copy title to name
  if (this.title && !this.name) {
    this.name = this.title;
  }
  // If name is provided but not title, copy name to title
  if (this.name && !this.title) {
    this.title = this.name;
  }
  
  // Always generate a unique slug
  if (!this.slug || this.isNew) {
    const source = this.title || this.name || 'product';
    const baseSlug = source
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .substring(0, 50); // Limit length
    
    // Generate unique slug with random string
    const randomStr = Math.random().toString(36).substring(2, 8);
    this.slug = `${baseSlug}-${randomStr}`;
  }
  
  // Map old types to new types
  if (this.type === 'ebook') {
    this.type = 'digital';
    if (!this.category) this.category = 'guide';
  } else if (this.type === 'masterclass') {
    this.type = 'service';
    if (!this.category) this.category = 'course';
  }
  
  // Ensure category has a default
  if (!this.category) {
    this.category = 'general';
  }
  
  next();
});

ProductSchema.virtual('displayPrice').get(function() {
  return '$' + this.price.toFixed(2);
});

ProductSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);




