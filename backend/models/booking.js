const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BookingSchema = new Schema({
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
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
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
    type: Number,
    default: 60 // in minutes
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
  cancellationReason: String,
  customerName: String,
  customerEmail: String,
  customerPhone: String,
  customerNotes: String,
  privateNotes: String,
  calendarEventId: String,
  meetingLink: String,
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);