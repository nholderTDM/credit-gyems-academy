const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConsultationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceType: {
    type: String,
    enum: ['credit_repair', 'credit_coaching', 'financial_planning'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 15
  },
  timeZone: {
    type: String,
    default: 'America/New_York'
  },
  status: {
    type: String,
    enum: ['scheduled', 'cancelled', 'completed', 'no_show'],
    default: 'scheduled'
  },
  cancellationReason: {
    type: String
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Customer details
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String
  },
  
  // Notes
  customerNotes: {
    type: String
  },
  privateNotes: {
    type: String
  },
  
  // Integration
  calendarEventId: {
    type: String
  },
  meetingLink: {
    type: String
  },
  
  // Notifications
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: {
    type: Date
  },
  
  // System fields
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consultation', ConsultationSchema);