const { google } = require('googleapis');

// Initialize Google Sheets client (only if configured)
let sheets = null;

const initializeSheets = () => {
  if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY) {
    console.log('Google Sheets not configured - analytics will be skipped');
    return null;
  }

  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      null,
      process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Failed to initialize Google Sheets:', error);
    return null;
  }
};

// Initialize on module load
sheets = initializeSheets();

// Add lead to Google Sheets
const addLeadToSheet = async (lead) => {
  if (!sheets || !process.env.GOOGLE_SHEETS_LEADS_ID) {
    return false; // Skip if not configured
  }

  try {
    const values = [
      [
        lead._id.toString(),
        lead.email,
        lead.firstName || '',
        lead.lastName || '',
        lead.phone || '',
        lead.source,
        (lead.interests || []).join(', '),
        lead.leadStatus,
        lead.notes || '',
        new Date(lead.createdAt).toLocaleString(),
        lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleString() : '',
        lead.convertedAt ? new Date(lead.convertedAt).toLocaleString() : '',
        lead.leadScore || 0
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_LEADS_ID,
      range: 'Leads!A:M',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values }
    });

    return true;
  } catch (error) {
    console.error('Error adding lead to Google Sheets:', error);
    return false;
  }
};

// Add order to Google Sheets
const addOrderToSheet = async (order) => {
  if (!sheets || !process.env.GOOGLE_SHEETS_ORDERS_ID) {
    return false; // Skip if not configured
  }

  try {
    // You'll need to populate the order with user data first
    const values = [
      [
        order._id.toString(),
        order.customerEmail,
        order.customerName,
        order.totalAmount.toFixed(2),
        order.paymentMethod,
        order.paymentStatus,
        order.fulfillmentStatus,
        new Date(order.createdAt).toLocaleString()
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ORDERS_ID,
      range: 'Orders!A:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values }
    });

    return true;
  } catch (error) {
    console.error('Error adding order to Google Sheets:', error);
    return false;
  }
};

// Create Google Sheets headers (run once to set up sheets)
const createLeadsSheetHeaders = async () => {
  if (!sheets || !process.env.GOOGLE_SHEETS_LEADS_ID) {
    throw new Error('Google Sheets not configured');
  }

  const headers = [
    'Lead ID',
    'Email',
    'First Name',
    'Last Name',
    'Phone',
    'Source',
    'Interests',
    'Status',
    'Notes',
    'Created At',
    'Last Contacted At',
    'Converted At',
    'Lead Score'
  ];

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_LEADS_ID,
      range: 'Leads!A1:M1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [headers]
      }
    });

    console.log('Google Sheets headers created successfully');
    return true;
  } catch (error) {
    console.error('Error creating Google Sheets headers:', error);
    throw error;
  }
};

module.exports = {
  addLeadToSheet,
  addOrderToSheet,
  createLeadsSheetHeaders
};