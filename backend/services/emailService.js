const sgMail = require('@sendgrid/mail');
const Order = require('../models/order');
const User = require('../models/user');
const Lead = require('../models/lead');
const Booking = require('../models/booking');
const Product = require('../models/product');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate calendar URLs for booking
const generateCalendarUrls = (booking, user) => {
  const startTime = new Date(booking.startTime);
  const endTime = new Date(booking.endTime);
  
  // Format dates for calendar URLs (YYYYMMDDTHHMMSSZ)
  const formatDateForCalendar = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const startFormatted = formatDateForCalendar(startTime);
  const endFormatted = formatDateForCalendar(endTime);
  
  // Map service type to readable name
  const serviceTypes = {
    credit_repair: 'Credit Repair Consultation',
    credit_coaching: 'Credit Coaching Session',
    financial_planning: 'Financial Planning Session'
  };
  
  const serviceName = serviceTypes[booking.serviceType] || booking.serviceType.replace('_', ' ');
  const eventTitle = encodeURIComponent(`${serviceName} - Credit Gyems 369`);
  const eventDescription = encodeURIComponent(
    `Your ${serviceName} consultation with Credit Gyems 369.\n\n` +
    `Meeting Link: ${booking.meetingLink || 'Will be provided via email'}\n` +
    `Booking ID: ${booking._id}\n\n` +
    `Prepare by gathering your credit reports and financial goals. ` +
    `We're excited to help you on your credit journey!`
  );
  
  const location = encodeURIComponent(booking.meetingLink || 'Virtual Meeting');
  
  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startFormatted}/${endFormatted}&details=${eventDescription}&location=${location}`,
    
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${eventTitle}&startdt=${startFormatted}&enddt=${endFormatted}&body=${eventDescription}&location=${location}`,
    
    apple: generateICalData(booking, serviceName, startTime, endTime),
    
    yahoo: `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${eventTitle}&st=${startFormatted}&et=${endFormatted}&desc=${eventDescription}&in_loc=${location}`
  };
};

// Generate iCal data for Apple Calendar
const generateICalData = (booking, serviceName, startTime, endTime) => {
  const icalData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Credit Gyems 369//Booking System//EN',
    'BEGIN:VEVENT',
    `UID:booking-${booking._id}@creditgyems369.com`,
    `DTSTART:${startTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTEND:${endTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `SUMMARY:${serviceName} - Credit Gyems 369`,
    `DESCRIPTION:Your consultation with Credit Gyems 369\\nBooking ID: ${booking._id}\\nMeeting: ${booking.meetingLink || 'Will be provided'}`,
    `LOCATION:${booking.meetingLink || 'Virtual Meeting'}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return `data:text/calendar;charset=utf8,${encodeURIComponent(icalData)}`;
};

// Get service display name
const getServiceDisplayName = (serviceType) => {
  const serviceNames = {
    'credit_repair': 'Credit Repair Consultation',
    'credit_coaching': 'Credit Coaching Session',
    'financial_planning': 'Financial Planning Session'
  };
  
  return serviceNames[serviceType] || serviceType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Send welcome email to new leads
exports.sendLeadWelcome = async (leadId) => {
  try {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }
    
    const msg = {
      to: lead.email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'DorTae Freeman - Credit Gyems Academy'
      },
      subject: 'Welcome to Credit Gyems Academy!',
      text: `Hi ${lead.firstName || 'there'},\n\nThank you for your interest in Credit Gyems Academy. We're excited to help you on your credit transformation journey!\n\nStay tuned for valuable credit tips and resources to help you achieve your financial goals.\n\nBest regards,\nDorTae Freeman\nCredit Gyems Academy`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://creditgyemsacademy.com/logo.png" alt="Credit Gyems Academy" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">Welcome to Credit Gyems Academy!</h1>
          <p>Hi ${lead.firstName || 'there'},</p>
          <p>Thank you for your interest in Credit Gyems Academy. We're excited to help you on your credit transformation journey!</p>
          <p>Stay tuned for valuable credit tips and resources to help you achieve your financial goals.</p>
          <p>Best regards,<br>DorTae Freeman<br>Credit Gyems Academy</p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

// Send lead magnet email
exports.sendLeadMagnet = async (leadId) => {
  try {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }
    
    const msg = {
      to: lead.email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'DorTae Freeman - Credit Gyems Academy'
      },
      subject: 'Your Free Credit Score Improvement Guide',
      text: `Hi ${lead.firstName || 'there'},\n\nThank you for requesting our "7 Steps to Boost Your Credit Score by 100+ Points" guide. You can download it using the link below:\n\nhttps://creditgyemsacademy.com/guides/credit-score-guide\n\nIf you have any questions, feel free to reach out!\n\nBest regards,\nDorTae Freeman\nCredit Gyems Academy`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://creditgyemsacademy.com/logo.png" alt="Credit Gyems Academy" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">Your Free Credit Score Improvement Guide</h1>
          <p>Hi ${lead.firstName || 'there'},</p>
          <p>Thank you for requesting our "7 Steps to Boost Your Credit Score by 100+ Points" guide. You can download it using the link below:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://creditgyemsacademy.com/guides/credit-score-guide" style="background-color: #FFD700; color: #0A2342; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; display: inline-block;">Download Your Guide</a>
          </p>
          <p>If you have any questions, feel free to reach out!</p>
          <p>Best regards,<br>DorTae Freeman<br>Credit Gyems Academy</p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    
    // Update lead record
    lead.downloadedGuides.push({
      guideId: null, // Replace with actual guide ID if you have it in the database
      downloadedAt: new Date()
    });
    
    await lead.save();
    
    return true;
  } catch (error) {
    console.error('Error sending lead magnet email:', error);
    return false;
  }
};

// Send lead follow-up email
exports.sendLeadFollowUp = async (leadId) => {
  try {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }
    
    const msg = {
      to: lead.email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'DorTae Freeman - Credit Gyems Academy'
      },
      subject: 'Next Steps in Your Credit Journey',
      text: `Hi ${lead.firstName || 'there'},\n\nThank you for your continued interest in Credit Gyems Academy. We noticed you've shown interest in our resources and wanted to check in.\n\nWould you like to schedule a free credit assessment to discuss your specific situation?\n\nYou can book a session here: https://creditgyemsacademy.com/booking\n\nBest regards,\nDorTae Freeman\nCredit Gyems Academy`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://creditgyemsacademy.com/logo.png" alt="Credit Gyems Academy" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">Next Steps in Your Credit Journey</h1>
          <p>Hi ${lead.firstName || 'there'},</p>
          <p>Thank you for your continued interest in Credit Gyems Academy. We noticed you've shown interest in our resources and wanted to check in.</p>
          <p>Would you like to schedule a free credit assessment to discuss your specific situation?</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://creditgyemsacademy.com/booking" style="background-color: #FFD700; color: #0A2342; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; display: inline-block;">Book Your Free Assessment</a>
          </p>
          <p>Best regards,<br>DorTae Freeman<br>Credit Gyems Academy</p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending lead follow-up email:', error);
    return false;
  }
};

// Notify admin of new lead
exports.notifyAdminOfNewLead = async (leadId) => {
  try {
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error(`Lead not found: ${leadId}`);
    }
    
    const msg = {
      to: process.env.ADMIN_EMAIL,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Credit Gyems Academy'
      },
      subject: 'New Lead Notification',
      text: `
        A new lead has been captured:
        
        Email: ${lead.email}
        Name: ${lead.firstName} ${lead.lastName}
        Phone: ${lead.phone || 'Not provided'}
        Source: ${lead.source}
        Interests: ${(lead.interests || []).join(', ')}
        Date: ${new Date(lead.createdAt).toLocaleString()}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">New Lead Notification</h1>
          <p>A new lead has been captured:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${lead.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${lead.firstName || ''} ${lead.lastName || ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${lead.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Source:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${lead.source}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Interests:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${(lead.interests || []).join(', ')}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(lead.createdAt).toLocaleString()}</td>
            </tr>
          </table>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://creditgyemsacademy.com/admin/leads/${lead._id}" style="background-color: #FFD700; color: #0A2342; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; display: inline-block;">View Lead Details</a>
          </p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
};

// Send booking confirmation email using SendGrid Dynamic Template
exports.sendBookingConfirmation = async (bookingId) => {
  try {
    // Get booking with populated user data
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'firstName lastName email');
    
    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    
    const user = booking.userId;
    
    // Generate calendar URLs
    const calendarUrls = generateCalendarUrls(booking, user);
    
    const startTime = new Date(booking.startTime);
    
    // Format dates for email
    const bookingDate = startTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const bookingTime = startTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Calculate duration (default 60 minutes)
    const duration = Math.round((new Date(booking.endTime) - startTime) / (1000 * 60));
    
    // Determine timezone (you can make this dynamic based on user preferences)
    const timezone = 'EST';
    
    // Send email using SendGrid Dynamic Template
    const emailData = {
      to: user.email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Credit Gyems 369'
      },
      templateId: process.env.SENDGRID_BOOKING_TEMPLATE_ID,
      dynamicTemplateData: {
        first_name: user.firstName,
        service_name: getServiceDisplayName(booking.serviceType),
        booking_date: bookingDate,
        booking_time: bookingTime,
        timezone: timezone,
        duration: duration.toString(),
        meeting_link: booking.meetingLink || 'Will be provided 15 minutes before your appointment',
        booking_id: booking._id.toString(),
        manage_booking_url: `${process.env.FRONTEND_URL}/bookings/manage/${booking._id}`,
        google_calendar_url: calendarUrls.google,
        outlook_calendar_url: calendarUrls.outlook,
        apple_calendar_url: calendarUrls.apple,
        yahoo_calendar_url: calendarUrls.yahoo
      }
    };
    
    await sgMail.send(emailData);
    
    console.log(`Booking confirmation email sent to ${user.email} for booking ${bookingId}`);
    
    // Also send a copy to admin
    const adminMsg = {
      to: process.env.ADMIN_EMAIL,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Credit Gyems Academy'
      },
      subject: `New Booking: ${getServiceDisplayName(booking.serviceType)}`,
      text: `
        A new booking has been made:
        
        Client: ${user.firstName} ${user.lastName}
        Email: ${user.email}
        Service: ${getServiceDisplayName(booking.serviceType)}
        Date: ${bookingDate}
        Time: ${bookingTime}
        
        View booking details: ${process.env.FRONTEND_URL}/admin/bookings/${booking._id}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">New Booking Alert</h1>
          <p>A new booking has been made:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.firstName} ${user.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Service:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${getServiceDisplayName(booking.serviceType)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Time:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookingTime}</td>
            </tr>
          </table>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/bookings/${booking._id}" style="background-color: #FFD700; color: #0A2342; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; display: inline-block;">View Booking Details</a>
          </p>
        </div>
      `
    };
    
    await sgMail.send(adminMsg);
    
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
    throw error;
  }
};

// Send booking cancellation email
exports.sendBookingCancellation = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'email firstName lastName');
    
    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    
    const user = booking.userId;
    const startTime = new Date(booking.startTime);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const serviceTypeName = getServiceDisplayName(booking.serviceType);
    
    const msg = {
      to: user.email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'DorTae Freeman - Credit Gyems Academy'
      },
      subject: 'Your Booking Has Been Cancelled',
      text: `
        Hi ${user.firstName},
        
        Your ${serviceTypeName} booking for ${formatDate(startTime)} at ${formatTime(startTime)} has been cancelled.
        
        If you'd like to schedule another time, please visit:
        ${process.env.FRONTEND_URL}/booking
        
        Thank you for your interest in Credit Gyems Academy!
        
        Best regards,
        DorTae Freeman
        Credit Gyems Academy
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://creditgyemsacademy.com/logo.png" alt="Credit Gyems Academy" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">Your Booking Has Been Cancelled</h1>
          <p>Hi ${user.firstName},</p>
          <p>Your <strong>${serviceTypeName}</strong> booking for ${formatDate(startTime)} at ${formatTime(startTime)} has been cancelled.</p>
          <p>If you'd like to schedule another time, please visit our booking page:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/booking" style="background-color: #FFD700; color: #0A2342; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; display: inline-block;">Book Another Session</a>
          </p>
          <p>Thank you for your interest in Credit Gyems Academy!</p>
          <p>Best regards,<br>DorTae Freeman<br>Credit Gyems Academy</p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    
    // Also notify admin
    const adminMsg = {
      to: process.env.ADMIN_EMAIL,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Credit Gyems Academy'
      },
      subject: `Booking Cancelled: ${serviceTypeName}`,
      text: `
        A booking has been cancelled:
        
        Client: ${user.firstName} ${user.lastName}
        Email: ${user.email}
        Service: ${serviceTypeName}
        Date: ${formatDate(startTime)}
        Time: ${formatTime(startTime)}
        Reason: ${booking.cancellationReason || 'No reason provided'}
        
        View booking details: ${process.env.FRONTEND_URL}/admin/bookings/${booking._id}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">Booking Cancellation Alert</h1>
          <p>A booking has been cancelled:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Client:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.firstName} ${user.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Service:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${serviceTypeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatDate(startTime)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Time:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatTime(startTime)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${booking.cancellationReason || 'No reason provided'}</td>
            </tr>
          </table>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/bookings/${booking._id}" style="background-color: #FFD700; color: #0A2342; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; display: inline-block;">View Booking Details</a>
          </p>
        </div>
      `
    };
    
    await sgMail.send(adminMsg);
    
    return true;
  } catch (error) {
    console.error('Error sending booking cancellation:', error);
    return false;
  }
};

// Send booking reminder email (scheduled 24 hours before)
exports.sendBookingReminder = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate('userId', 'email firstName lastName');
    
    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }
    
    // If booking is not scheduled or is already marked as reminded, skip
    if (booking.status !== 'scheduled' || booking.reminderSent) {
      return false;
    }
    
    const user = booking.userId;
    const startTime = new Date(booking.startTime);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
    
    const formatTime = (date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    const serviceTypeName = getServiceDisplayName(booking.serviceType);
    
    const msg = {
      to: user.email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'DorTae Freeman - Credit Gyems Academy'
      },
      subject: 'Reminder: Your Upcoming Booking',
      text: `
        Hi ${user.firstName},
        
        This is a friendly reminder about your upcoming ${serviceTypeName} with Credit Gyems Academy.
        
        Booking Details:
        - Date: ${formatDate(startTime)}
        - Time: ${formatTime(startTime)}
        - Service: ${serviceTypeName}
        
        ${booking.meetingLink ? `Meeting Link: ${booking.meetingLink}` : ''}
        
        If you need to reschedule or cancel, please visit:
        ${process.env.FRONTEND_URL}/account/bookings
        
        We look forward to speaking with you!
        
        Best regards,
        DorTae Freeman
        Credit Gyems Academy
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://creditgyemsacademy.com/logo.png" alt="Credit Gyems Academy" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">Reminder: Your Upcoming Booking</h1>
          <p>Hi ${user.firstName},</p>
          <p>This is a friendly reminder about your upcoming <strong>${serviceTypeName}</strong> with Credit Gyems Academy.</p>
          <div style="background-color: #f8f8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #0A2342; margin-top: 0;">Booking Details</h2>
            <p><strong>Date:</strong> ${formatDate(startTime)}</p>
            <p><strong>Time:</strong> ${formatTime(startTime)}</p>
            <p><strong>Service:</strong> ${serviceTypeName}</p>
            ${booking.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${booking.meetingLink}">${booking.meetingLink}</a></p>` : ''}
          </div>
          <p>If you need to reschedule or cancel, please visit your account bookings page:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/account/bookings" style="background-color: #FFD700; color: #0A2342; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; display: inline-block;">Manage Booking</a>
          </p>
          <p>We look forward to speaking with you!</p>
          <p>Best regards,<br>DorTae Freeman<br>Credit Gyems Academy</p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    
    // Mark as reminded
    booking.reminderSent = true;
    booking.reminderSentAt = new Date();
    await booking.save();
    
    return true;
  } catch (error) {
    console.error('Error sending booking reminder:', error);
    return false;
  }
};

// Send order confirmation email
exports.sendOrderConfirmation = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('userId', 'email firstName lastName')
      .populate('items.product');
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    const user = order.userId;
    
    // Prepare product details
    const productItems = order.items.map(item => {
      return {
        title: item.productSnapshot.title,
        quantity: item.quantity,
        price: item.price.toFixed(2),
        subtotal: item.subtotal.toFixed(2)
      };
    });
    
    // Check if there are downloadable products
    const hasDownloads = order.items.some(item => 
      item.product.type === 'ebook' && item.product.pdfFile
    );
    
    const msg = {
      to: user.email,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'DorTae Freeman - Credit Gyems Academy'
      },
      subject: 'Your Order Confirmation',
      text: `
        Hi ${user.firstName},
        
        Thank you for your purchase from Credit Gyems Academy!
        
        Order #: ${order.orderNumber}
        Date: ${new Date(order.createdAt).toLocaleDateString()}
        Total: $${order.total.toFixed(2)}
        
        Items:
        ${productItems.map(item => `- ${item.title} (${item.quantity}) - $${item.subtotal}`).join('\n')}
        
        ${hasDownloads ? 'You can access your digital products in your account:' : ''}
        ${hasDownloads ? `${process.env.FRONTEND_URL}/account/orders` : ''}
        
        If you have any questions about your order, please contact us.
        
        Thank you for choosing Credit Gyems Academy!
        
        Best regards,
        DorTae Freeman
        Credit Gyems Academy
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="https://creditgyemsacademy.com/logo.png" alt="Credit Gyems Academy" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">Your Order Confirmation</h1>
          <p>Hi ${user.firstName},</p>
          <p>Thank you for your purchase from Credit Gyems Academy!</p>
          <div style="background-color: #f8f8ff; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #0A2342; margin-top: 0;">Order Summary</h2>
            <p><strong>Order #:</strong> ${order.orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
            
            <h3 style="margin-top: 20px;">Items:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #ddd; text-align: left;">
                <th style="padding: 8px;">Item</th>
                <th style="padding: 8px;">Qty</th>
                <th style="padding: 8px;">Price</th>
                <th style="padding: 8px;">Total</th>
              </tr>
              ${productItems.map(item => `
                <tr style="border-bottom: 1px solid #ddd;">
                  <td style="padding: 8px;">${item.title}</td>
                  <td style="padding: 8px;">${item.quantity}</td>
                  <td style="padding: 8px;">$${item.price}</td>
                  <td style="padding: 8px;">$${item.subtotal}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          
          ${hasDownloads ? `
            <p>You can access your digital products in your account:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/account/orders" style="background-color: #FFD700; color: #0A2342; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; display: inline-block;">Access Your Products</a>
            </p>
          ` : ''}
          
          <p>If you have any questions about your order, please contact us.</p>
          <p>Thank you for choosing Credit Gyems Academy!</p>
          <p>Best regards,<br>DorTae Freeman<br>Credit Gyems Academy</p>
        </div>
      `
    };
    
    await sgMail.send(msg);
    
    // Also notify admin
    const adminMsg = {
      to: process.env.ADMIN_EMAIL,
      from: {
        email: process.env.EMAIL_FROM,
        name: 'Credit Gyems Academy'
      },
      subject: `New Order: #${order.orderNumber}`,
      text: `
        A new order has been placed:
        
        Order #: ${order.orderNumber}
        Customer: ${user.firstName} ${user.lastName}
        Email: ${user.email}
        Date: ${new Date(order.createdAt).toLocaleDateString()}
        Total: $${order.total.toFixed(2)}
        
        Items:
        ${productItems.map(item => `- ${item.title} (${item.quantity}) - $${item.subtotal}`).join('\n')}
        
        View order details: ${process.env.FRONTEND_URL}/admin/orders/${order._id}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0A2342; margin-bottom: 20px;">New Order Alert</h1>
          <p>A new order has been placed:</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Order #:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Customer:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.firstName} ${user.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${user.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Date:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(order.createdAt).toLocaleDateString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Total:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">$${order.total.toFixed(2)}</td>
            </tr>
          </table>
          
          <h3>Items:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #ddd; text-align: left;">
              <th style="padding: 8px;">Item</th>
              <th style="padding: 8px;">Qty</th>
              <th style="padding: 8px;">Price</th>
              <th style="padding: 8px;">Total</th>
            </tr>
            ${productItems.map(item => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 8px;">${item.title}</td>
                <td style="padding: 8px;">${item.quantity}</td>
                <td style="padding: 8px;">$${item.price}</td>
                <td style="padding: 8px;">$${item.subtotal}</td>
              </tr>
            `).join('')}
          </table>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/admin/orders/${order._id}" style="background-color: #FFD700; color: #0A2342; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: bold; display: inline-block;">View Order Details</a>
          </p>
        </div>
      `
    };
    
    await sgMail.send(adminMsg);
    
    return true;
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return false;
  }
};

// Export calendar URL generation function for direct use
exports.generateCalendarUrls = generateCalendarUrls;