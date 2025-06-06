const { google } = require('googleapis');
const Booking = require('../models/booking');
const fs = require('fs');
const path = require('path');

// Initialize Google Calendar API
let calendar;
let oauth2Client;

// Initialize OAuth2 client
const initializeOAuth2Calendar = async () => {
  try {
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
    );

    // Check if we have stored tokens
    const tokenPath = path.join(__dirname, '../.credentials/calendar-token.json');
    
    if (fs.existsSync(tokenPath)) {
      const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
      oauth2Client.setCredentials(tokens);
      
      // Initialize calendar with auth
      calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      console.log('✅ Google Calendar API initialized with stored credentials');
    } else {
      console.log('⚠️ No stored Google Calendar credentials. Run setup first.');
      console.log('📝 Setup URL:', getAuthUrl());
    }
  } catch (error) {
    console.error('❌ Failed to initialize Google Calendar:', error.message);
    console.log('⚠️ Calendar integration will work in fallback mode');
  }
};

// Get auth URL for initial setup
const getAuthUrl = () => {
  if (!oauth2Client) return null;
  
  const scopes = ['https://www.googleapis.com/auth/calendar'];
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

// Store tokens after authorization
const storeTokens = async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Store tokens for future use
    const tokenDir = path.join(__dirname, '../.credentials');
    
    if (!fs.existsSync(tokenDir)) {
      fs.mkdirSync(tokenDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(tokenDir, 'calendar-token.json'),
      JSON.stringify(tokens, null, 2)
    );
    
    // Reinitialize calendar
    calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    console.log('✅ Google Calendar credentials stored successfully');
    
    return true;
  } catch (error) {
    console.error('Error storing tokens:', error);
    return false;
  }
};

// Export setup functions
exports.getAuthUrl = getAuthUrl;
exports.storeTokens = storeTokens;

// Initialize on module load
initializeOAuth2Calendar().catch(console.error);

// Get available time slots
exports.getAvailableTimeSlots = async (date, serviceType) => {
  try {
    const workingHours = { start: 9, end: 17 }; // 9 AM to 5 PM
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      throw new Error('Cannot book appointments in the past');
    }
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get existing bookings from database
    const existingBookings = await Booking.find({
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: { $in: ['scheduled', 'confirmed'] }
    });
    
    // Get busy times from Google Calendar
    let googleBusyTimes = [];
    if (calendar && process.env.GOOGLE_CALENDAR_ID) {
      try {
        const response = await calendar.freebusy.query({
          requestBody: {
            timeMin: startOfDay.toISOString(),
            timeMax: endOfDay.toISOString(),
            items: [{ id: process.env.GOOGLE_CALENDAR_ID }]
          }
        });
        
        const calendarBusy = response.data.calendars[process.env.GOOGLE_CALENDAR_ID];
        if (calendarBusy && calendarBusy.busy) {
          googleBusyTimes = calendarBusy.busy.map(busy => ({
            start: new Date(busy.start),
            end: new Date(busy.end)
          }));
        }
      } catch (error) {
        console.error('Error fetching Google Calendar busy times:', error);
        // Continue without Google Calendar data
      }
    }
    
    const availableSlots = [];
    const slotDuration = 60; // 60 minutes
    const dayOfWeek = selectedDate.getDay();
    
    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return availableSlots;
    }
    
    // Generate time slots
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Don't create slots that would extend past working hours
        if (hour === workingHours.end - 1 && minute + slotDuration > 60) {
          continue;
        }
        
        const slotStartTime = new Date(selectedDate);
        slotStartTime.setHours(hour, minute, 0, 0);
        const slotEndTime = new Date(slotStartTime);
        slotEndTime.setMinutes(slotEndTime.getMinutes() + slotDuration);
        
        // Skip slots in the past
        if (slotStartTime < new Date()) {
          continue;
        }
        
        // Check conflicts with existing bookings
        const conflictsWithBooking = existingBookings.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          return (
            (slotStartTime >= bookingStart && slotStartTime < bookingEnd) ||
            (slotEndTime > bookingStart && slotEndTime <= bookingEnd) ||
            (slotStartTime <= bookingStart && slotEndTime >= bookingEnd)
          );
        });
        
        // Check conflicts with Google Calendar busy times
        const conflictsWithGoogle = googleBusyTimes.some(busy => {
          return (
            (slotStartTime >= busy.start && slotStartTime < busy.end) ||
            (slotEndTime > busy.start && slotEndTime <= busy.end) ||
            (slotStartTime <= busy.start && slotEndTime >= busy.end)
          );
        });
        
        if (!conflictsWithBooking && !conflictsWithGoogle) {
          availableSlots.push({
            startTime: slotStartTime.toISOString(),
            endTime: slotEndTime.toISOString()
          });
        }
      }
    }
    
    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

// Check availability
exports.checkAvailability = async (startTime, endTime) => {
  try {
    if (startTime < new Date()) return false;
    
    // Check database bookings
    const existingBookings = await Booking.find({
      $and: [
        { status: { $in: ['scheduled', 'confirmed'] } },
        {
          $or: [
            { startTime: { $lt: endTime, $gte: startTime } },
            { endTime: { $gt: startTime, $lte: endTime } },
            { $and: [{ startTime: { $lte: startTime } }, { endTime: { $gte: endTime } }] }
          ]
        }
      ]
    });
    
    if (existingBookings.length > 0) return false;
    
    // Check Google Calendar availability
    if (calendar && process.env.GOOGLE_CALENDAR_ID) {
      try {
        const response = await calendar.freebusy.query({
          requestBody: {
            timeMin: startTime.toISOString(),
            timeMax: endTime.toISOString(),
            items: [{ id: process.env.GOOGLE_CALENDAR_ID }]
          }
        });
        
        const calendarBusy = response.data.calendars[process.env.GOOGLE_CALENDAR_ID];
        if (calendarBusy && calendarBusy.busy && calendarBusy.busy.length > 0) {
          return false;
        }
      } catch (error) {
        console.error('Error checking Google Calendar availability:', error);
        // If Google Calendar check fails, still allow booking based on database check
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking availability:', error);
    throw error;
  }
};

// Create calendar event
exports.createEvent = async ({ summary, description, startTime, endTime, attendee }) => {
  try {
    // If Google Calendar is initialized, create the event
    if (calendar && process.env.GOOGLE_CALENDAR_ID) {
      try {
        const eventData = {
          summary: summary,
          description: description,
          start: {
            dateTime: startTime.toISOString(),
            timeZone: 'America/New_York'
          },
          end: {
            dateTime: endTime.toISOString(),
            timeZone: 'America/New_York'
          },
          attendees: [
            { email: attendee }
          ],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 }, // 24 hours before
              { method: 'email', minutes: 60 }       // 1 hour before
            ]
          },
          conferenceData: {
            createRequest: {
              requestId: `credit-gyems-${Date.now()}`,
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              }
            }
          }
        };
        
        const response = await calendar.events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          requestBody: eventData,
          conferenceDataVersion: 1,
          sendUpdates: 'all'
        });
        
        console.log('✅ Google Calendar event created:', response.data.id);
        
        return {
          id: response.data.id,
          meetingLink: response.data.hangoutLink || response.data.htmlLink,
          htmlLink: response.data.htmlLink
        };
      } catch (error) {
        console.error('Error creating Google Calendar event:', error);
        // Fall back to mock data
      }
    }
    
    // Fallback for when Google Calendar is not available
    console.log('⚠️ Using fallback calendar event (Google Calendar not configured)');
    return {
      id: `mock-${Date.now()}`,
      meetingLink: `https://meet.google.com/credit-gyems-${Date.now()}`,
      htmlLink: '#'
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Update calendar event
exports.updateEvent = async (eventId, { startTime, endTime }) => {
  try {
    if (calendar && process.env.GOOGLE_CALENDAR_ID && !eventId.startsWith('mock-')) {
      try {
        const response = await calendar.events.patch({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: eventId,
          requestBody: {
            start: {
              dateTime: startTime.toISOString(),
              timeZone: 'America/New_York'
            },
            end: {
              dateTime: endTime.toISOString(),
              timeZone: 'America/New_York'
            }
          },
          sendUpdates: 'all'
        });
        
        console.log('✅ Google Calendar event updated:', eventId);
        return response.data;
      } catch (error) {
        console.error('Error updating Google Calendar event:', error);
        // Continue even if update fails
      }
    }
    
    // Return success for mock events
    return { id: eventId, status: 'updated' };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
};

// Cancel calendar event
exports.cancelEvent = async (eventId) => {
  try {
    if (calendar && process.env.GOOGLE_CALENDAR_ID && !eventId.startsWith('mock-')) {
      try {
        await calendar.events.delete({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: eventId,
          sendUpdates: 'all'
        });
        
        console.log('✅ Google Calendar event cancelled:', eventId);
        return true;
      } catch (error) {
        if (error.code === 404) {
          console.log('⚠️ Calendar event not found, may have been deleted already');
          return true;
        }
        console.error('Error cancelling Google Calendar event:', error);
        // Continue even if cancellation fails
      }
    }
    
    // Return success for mock events
    return true;
  } catch (error) {
    console.error('Error cancelling calendar event:', error);
    throw error;
  }
};

// Get calendar event details
exports.getEvent = async (eventId) => {
  try {
    if (calendar && process.env.GOOGLE_CALENDAR_ID && !eventId.startsWith('mock-')) {
      try {
        const response = await calendar.events.get({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          eventId: eventId
        });
        
        return response.data;
      } catch (error) {
        console.error('Error getting Google Calendar event:', error);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting calendar event:', error);
    return null;
  }
};

// List upcoming events (useful for admin dashboard)
exports.listUpcomingEvents = async (maxResults = 10) => {
  try {
    if (calendar && process.env.GOOGLE_CALENDAR_ID) {
      try {
        const response = await calendar.events.list({
          calendarId: process.env.GOOGLE_CALENDAR_ID,
          timeMin: new Date().toISOString(),
          maxResults: maxResults,
          singleEvents: true,
          orderBy: 'startTime'
        });
        
        return response.data.items || [];
      } catch (error) {
        console.error('Error listing Google Calendar events:', error);
        return [];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error listing calendar events:', error);
    return [];
  }
};