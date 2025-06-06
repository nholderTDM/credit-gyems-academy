const Service = require('../models/service');
const Booking = require('../models/booking');
const mongoose = require('mongoose');
const validator = require('validator');

// Get all services
exports.getServices = async (req, res) => {
  try {
    const { serviceType, status, search } = req.query;
    const query = {};
    
    // Build query filters
    if (serviceType) {
      query.serviceType = serviceType;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      const sanitizedSearch = validator.escape(search.trim());
      query.$or = [
        { title: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
        { shortDescription: { $regex: sanitizedSearch, $options: 'i' } }
      ];
    }
    
    const services = await Service.find(query)
      .select('-__v')
      .sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services'
    });
  }
};

// Get single service by ID
exports.getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }
    
    const service = await Service.findById(id)
      .select('-__v');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service'
    });
  }
};

// Create new service (admin only) - matching your model structure
exports.createService = async (req, res) => {
  try {
    const { 
      serviceType,
      title,
      displayName,
      description,
      shortDescription,
      features,
      benefits,
      duration = 60,
      price,
      pricingType = 'one_time',
      requirements,
      deliverables,
      targetAudience,
      bookingSettings,
      seo,
      status = 'active'
    } = req.body;
    
    // Validate required fields based on your model
    if (!serviceType || !title || !displayName || !description || !shortDescription || !price?.amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (serviceType, title, displayName, description, shortDescription, price.amount)'
      });
    }
    
    // Check if serviceType already exists (it's unique in your schema)
    const existingService = await Service.findOne({ serviceType });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: 'A service with this serviceType already exists'
      });
    }
    
    // Sanitize input
    const sanitizedData = {
      serviceType,
      title: validator.escape(title.trim()),
      displayName: validator.escape(displayName.trim()),
      description: validator.escape(description.trim()),
      shortDescription: validator.escape(shortDescription.trim()),
      features: Array.isArray(features) ? features.map(f => validator.escape(f)) : [],
      benefits: Array.isArray(benefits) ? benefits.map(b => ({
        title: validator.escape(b.title || ''),
        description: validator.escape(b.description || '')
      })) : [],
      duration,
      price: {
        amount: parseFloat(price.amount),
        currency: price.currency || 'USD',
        displayPrice: price.displayPrice || `$${price.amount}`
      },
      pricingType,
      requirements: Array.isArray(requirements) ? requirements.map(r => validator.escape(r)) : [],
      deliverables: Array.isArray(deliverables) ? deliverables.map(d => validator.escape(d)) : [],
      targetAudience: Array.isArray(targetAudience) ? targetAudience.map(t => validator.escape(t)) : [],
      bookingSettings: bookingSettings || {},
      seo: seo || {},
      status
    };
    
    // Validate price
    if (sanitizedData.price.amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }
    
    // Validate duration
    if (sanitizedData.duration < 0) {
      return res.status(400).json({
        success: false,
        message: 'Duration cannot be negative'
      });
    }
    
    const service = new Service(sanitizedData);
    await service.save();
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid service data',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create service'
    });
  }
};

// Update service (admin only)
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }
    
    // Remove fields that shouldn't be updated
    delete updates._id;
    delete updates.createdAt;
    delete updates.serviceType; // This is unique and shouldn't change
    
    // Sanitize string fields
    if (updates.title) updates.title = validator.escape(updates.title.trim());
    if (updates.displayName) updates.displayName = validator.escape(updates.displayName.trim());
    if (updates.description) updates.description = validator.escape(updates.description.trim());
    if (updates.shortDescription) updates.shortDescription = validator.escape(updates.shortDescription.trim());
    
    if (updates.features && Array.isArray(updates.features)) {
      updates.features = updates.features.map(f => validator.escape(f));
    }
    
    if (updates.benefits && Array.isArray(updates.benefits)) {
      updates.benefits = updates.benefits.map(b => ({
        title: validator.escape(b.title || ''),
        description: validator.escape(b.description || '')
      }));
    }
    
    const service = await Service.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid update data',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update service'
    });
  }
};

// Delete service (admin only)
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }
    
    // Check if there are active bookings for this service
    const activeBookings = await Booking.countDocuments({
      serviceType: { $in: ['credit_repair', 'credit_coaching', 'financial_planning'] },
      status: 'scheduled',
      startTime: { $gte: new Date() }
    });
    
    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service with active bookings'
      });
    }
    
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service'
    });
  }
};

// Book a service
exports.bookService = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      startTime,
      customerNotes,
      timeZone = 'America/New_York'
    } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid service ID'
      });
    }
    
    // Validate required fields
    if (!startTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time is required'
      });
    }
    
    // Find the service
    const service = await Service.findById(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    if (service.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Service is not available for booking'
      });
    }
    
    if (!service.bookingSettings.allowOnlineBooking) {
      return res.status(400).json({
        success: false,
        message: 'This service does not allow online booking'
      });
    }
    
    // Parse and validate the start time
    const bookingStartTime = new Date(startTime);
    
    if (isNaN(bookingStartTime.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date/time format'
      });
    }
    
    // Check minimum booking notice
    const hoursUntilBooking = (bookingStartTime - new Date()) / (1000 * 60 * 60);
    if (hoursUntilBooking < service.bookingSettings.minBookingNotice) {
      return res.status(400).json({
        success: false,
        message: `Bookings must be made at least ${service.bookingSettings.minBookingNotice} hours in advance`
      });
    }
    
    // Check advance booking days
    const daysUntilBooking = hoursUntilBooking / 24;
    if (daysUntilBooking > service.bookingSettings.advanceBookingDays) {
      return res.status(400).json({
        success: false,
        message: `Cannot book more than ${service.bookingSettings.advanceBookingDays} days in advance`
      });
    }
    
    // Calculate end time
    const bookingEndTime = new Date(bookingStartTime.getTime() + service.duration * 60000);
    
    // Create booking matching your existing booking model
    const booking = new Booking({
      userId: req.user._id,
      serviceType: service.serviceType,
      startTime: bookingStartTime,
      endTime: bookingEndTime,
      duration: service.duration,
      timeZone,
      status: 'scheduled',
      customerName: `${req.user.firstName} ${req.user.lastName}`,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || '',
      customerNotes: customerNotes ? validator.escape(customerNotes.trim()) : '',
      meetingLink: service.bookingSettings.meetingPlatform === 'Google Meet' ? 'To be generated' : ''
    });
    
    await booking.save();
    
    res.status(201).json({
      success: true,
      message: 'Service booked successfully',
      data: {
        bookingId: booking._id,
        serviceType: booking.serviceType,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Error booking service:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking data',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to book service'
    });
  }
};

// Get user's bookings
exports.getUserBookings = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const query = { userId: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.startTime = { $gte: new Date() };
    }
    
    const bookings = await Booking.find(query)
      .sort({ startTime: -1 });
    
    // Get service details for each booking
    const serviceTypes = [...new Set(bookings.map(b => b.serviceType))];
    const services = await Service.find({ serviceType: { $in: serviceTypes } });
    const serviceMap = services.reduce((map, service) => {
      map[service.serviceType] = service;
      return map;
    }, {});
    
    // Enrich bookings with service details
    const enrichedBookings = bookings.map(booking => {
      const service = serviceMap[booking.serviceType];
      return {
        ...booking.toObject(),
        service: service ? {
          title: service.title,
          displayName: service.displayName,
          price: service.price,
          duration: service.duration
        } : null
      };
    });
    
    res.status(200).json({
      success: true,
      count: enrichedBookings.length,
      data: enrichedBookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancellationReason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }
    
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }
    
    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed bookings'
      });
    }
    
    // Get service for cancellation policy
    const service = await Service.findOne({ serviceType: booking.serviceType });
    
    if (service && service.bookingSettings.minBookingNotice) {
      const hoursBeforeBooking = (booking.startTime - new Date()) / (1000 * 60 * 60);
      
      if (hoursBeforeBooking < service.bookingSettings.minBookingNotice) {
        return res.status(400).json({
          success: false,
          message: service.bookingSettings.cancellationPolicy || 
            `Cancellations must be made at least ${service.bookingSettings.minBookingNotice} hours in advance`
        });
      }
    }
    
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason ? 
      validator.escape(cancellationReason.trim()) : 
      'Cancelled by customer';
    
    await booking.save();
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking'
    });
  }
};

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const { 
      status, 
      serviceType, 
      startDate, 
      endDate,
      page = 1,
      limit = 20
    } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (serviceType) {
      query.serviceType = serviceType;
    }
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }
    
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    
    const total = await Booking.countDocuments(query);
    
    const bookings = await Booking.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ startTime: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    
    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
};

// Update booking status (admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, privateNotes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID'
      });
    }
    
    const validStatuses = ['scheduled', 'cancelled', 'completed', 'no_show'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Update booking
    booking.status = status;
    
    if (privateNotes) {
      booking.privateNotes = validator.escape(privateNotes.trim());
    }
    
    await booking.save();
    
    // Populate for response
    await booking.populate('userId', 'firstName lastName email');
    
    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status'
    });
  }
};

// Seed initial services
exports.seedServices = async (req, res) => {
  try {
    await Service.seedServices();
    
    const services = await Service.find({});
    
    res.status(200).json({
      success: true,
      message: 'Services seeded successfully',
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error seeding services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed services'
    });
  }
};