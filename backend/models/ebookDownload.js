// backend/models/ebookDownload.js - Model for tracking e-book downloads
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EbookDownloadSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  originalFilePath: {
    type: String,
    required: true
  },
  watermarkedFilePath: {
    type: String,
    required: true
  },
  watermarkedFileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  watermarkInfo: {
    userName: String,
    userEmail: String,
    orderNumber: String,
    userId: String,
    createdAt: String
  },
  securityFingerprint: {
    type: String,
    required: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  downloadTokens: [{
    token: String,
    createdAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  downloadHistory: [{
    timestamp: Date,
    ipAddress: String,
    userAgent: String,
    downloadToken: String,
    deviceFingerprint: String,
    success: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  antiPiracy: {
    suspiciousActivity: [{
      type: String,
      timestamp: Date,
      details: String
    }],
    isBlocked: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    deviceInfo: [{
      userAgent: String,
      ipAddress: String,
      firstSeen: Date,
      lastSeen: Date,
      downloadCount: Number
    }],
    totalBandwidthUsed: {
      type: Number,
      default: 0
    }
  }
});

// Method to detect suspicious activity
EbookDownloadSchema.methods.detectSuspiciousActivity = function() {
  const suspiciousActivities = [];
  
  // Check for excessive downloads
  if (this.downloadCount > 10) {
    suspiciousActivities.push('excessive_downloads');
  }
  
  // Check for multiple devices
  if (this.metadata.deviceInfo.length > 5) {
    suspiciousActivities.push('multiple_devices');
  }
  
  // Check for rapid downloads
  const recentDownloads = this.downloadHistory.filter(download => 
    Date.now() - download.timestamp < 60 * 60 * 1000 // Last hour
  );
  
  if (recentDownloads.length > 3) {
    suspiciousActivities.push('rapid_downloads');
  }
  
  return suspiciousActivities;
};

// Index for performance
EbookDownloadSchema.index({ userId: 1, productId: 1, orderId: 1 });
EbookDownloadSchema.index({ createdAt: -1 });
EbookDownloadSchema.index({ lastAccessedAt: -1 });

module.exports = mongoose.model('EbookDownload', EbookDownloadSchema);