const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      productSnapshot: {
        title: String,
        price: Number,
        type: String
      },
      quantity: {
        type: Number,
        default: 1
      },
      price: Number,
      subtotal: Number
    }
  ],
  subtotal: {
    type: Number,
    required: true
  },
  discountCode: String,
  discountAmount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'klarna', 'afterpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentIntentId: String,
  stripeSessionId: String,
  transactionId: String,
  fulfillmentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  fulfillmentMethod: {
    type: String,
    default: 'digital_delivery'
  },
  fulfillmentDetails: {
    emailSent: Boolean,
    emailSentAt: Date,
    downloadLinks: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product'
        },
        title: String,
        url: String,
        expiresAt: Date,
        downloadCount: {
          type: Number,
          default: 0
        }
      }
    ]
  },
  customerEmail: String,
  customerName: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  paidAt: Date,
  fulfilledAt: Date
});

// Update the 'updatedAt' field on save
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate order number if not provided
OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Math.floor(Date.now() / 1000).toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `CG-${timestamp}${random}`;
  }
  
  next();
});

module.exports = mongoose.model('Order', OrderSchema);