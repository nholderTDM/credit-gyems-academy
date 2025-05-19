const { google } = require('googleapis');
const Booking = require('../models/booking');

// Set up Google Calendar API client
const setupCalendarClient = () => {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/calendar']
    );
    
    return google.calendar({ version: 'v3', auth });
  } catch (error) {
    console.error('Error setting up calendar client:', error);
    throw error;
  }
};

// Get available time slots
exports.getAvailableTimeSlots = async (date, serviceType) => {
  try {
    // Define working hours (9 AM to 5 PM)
    const workingHours = {
      start: 9,
      end: 17
    };
    
    // Convert date string to Date object
    const selectedDate = new Date(date);
    
    // Check if date is in the past
    const today = new Date();
    if (selectedDate < today) {
      throw new Error('Cannot book appointments in the past');
    }
    
    // Get existing bookings for the selected date
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingBookings = await Booking.find({
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    // Get events from Google Calendar
    const calendar = setupCalendarClient();
    
    const calendarResponse = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });
    
    const events = calendarResponse.data.items || [];
    
    // Generate available time slots
    const availableSlots = [];
    const slotDuration = 60; // minutes
    
    // Skip Sundays (0) and Saturdays (6)
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return availableSlots; // Return empty array for weekends
    }
    
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Skip slots that would go beyond working hours
        if (hour === workingHours.end - 1 && minute + slotDuration > 60) {
          continue;
        }
        
        const slotStartTime = new Date(selectedDate);
        slotStartTime.setHours(hour, minute, 0, 0);
        
        const slotEndTime = new Date(slotStartTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);
        
        // Skip slots in the past
        if (slotStartTime < today) {
          continue;
        }
        
        // Check if slot conflicts with existing bookings
        const conflictsWithBooking = existingBookings.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          
          return (
            (slotStartTime >= bookingStart && slotStartTime < bookingEnd) ||
            (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
            (slotStartTime <= bookingStart && slotEndTime >= bookingEnd)
          );
        });
        
        if (conflictsWithBooking) {
          continue;
        }
        
        // Check if slot conflicts with Google Calendar events
        const conflictsWithEvent = events.some(event => {
          if (!event.start || !event.end) return false;
          
          const eventStart = new Date(event.start.dateTime || `${event.start.date}T00:00:00`);
          const eventEnd = new Date(event.end.dateTime || `${event.end.date}T23:59:59`);
          
          return (
            (slotStartTime >= eventStart && slotStartTime < eventEnd) ||
            (slotEndTime > eventStart && slotEndTime <= eventEnd) ||
            (slotStartTime <= eventStart && slotEndTime >= eventEnd)
          );
        });
        
        if (conflictsWithEvent) {
          continue;
        }
        
        // Add available slot
        availableSlots.push({
          startTime: slotStartTime.toISOString(),
          endTime: slotEndTime.toISOString()
        });
      }
    }
    
    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

// Check if a specific time slot is available
exports.checkAvailability = async (startTime, endTime) => {
  try {
    // Check if slot is in the past
    const now = new Date();
    if (startTime < now) {
      return false;
    }
    
    // Check for existing bookings that conflict
    const existingBookings = await Booking.find({
      $and: [
        { status: { $in: ['scheduled', 'confirmed'] } },
        {
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            {
              $and: [
                { startTime: { $lte: startTime } },
                { endTime: { $gte: endTime } }
              ]
            }
          ]
        }
      ]
    });
    
    if (existingBookings.length > 0) {
      return false;
    }
    
    // Check Google Calendar for conflicts
    const calendar = setupCalendarClient();
    
    const calendarResponse = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: startTime.toISOString(),
      timeMax: endTime.toISOString(),
      singleEvents: true
    });
    
    const events = calendarResponse.data.items || [];
    
    if (events.length > 0) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

// Create a calendar event
exports.createEvent = async ({ summary, description, startTime, endTime, attendee }) => {
  try {
    const calendar = setupCalendarClient();
    
    // Create a Google Meet link
    const conferenceData = {
      createRequest: {
        requestId: `credit-gyems-${Date.now()}`
      }
    };
    
    const event = {
      summary,
      description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'America/New_York'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'America/New_York'
      },
      attendees: [
        { email: attendee },
        { email: process.env.ADMIN_EMAIL }
      ],
      conferenceData,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 }
        ]
      }
    };
    
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });
    
    const createdEvent = response.data;
    
    // Extract meeting link
    let meetingLink = null;
    if (createdEvent.conferenceData && createdEvent.conferenceData.entryPoints) {
      const videoEntry = createdEvent.conferenceData.entryPoints.find(
        entry => entry.entryPointType === 'video'
      );
      if (videoEntry) {
        meetingLink = videoEntry.uri;
      }
    }
    
    return {
      id: createdEvent.id,
      meetingLink
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Update a calendar event
exports.updateEvent = async (eventId, { startTime, endTime }) => {
  try {
    const calendar = setupCalendarClient();
    
    // First, get the existing event
    const { data: existingEvent } = await calendar.events.get({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId
    });
    
    // Update only the time fields
    const updatedEvent = {
      ...existingEvent,
      start: {
        ...existingEvent.start,
        dateTime: startTime.toISOString()
      },
      end: {
        ...existingEvent.end,
        dateTime: endTime.toISOString()
      }
    };
    
    const response = await calendar.events.update({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      resource: updatedEvent,
      sendUpdates: 'all'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

// Cancel a calendar event
exports.cancelEvent = async (eventId) => {
  try {
    const calendar = setupCalendarClient();
    
    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
      sendUpdates: 'all'
    });
    
    return true;
  } catch (error) {
    console.error('Error cancelling calendar event:', error);
    throw error;
  }
};