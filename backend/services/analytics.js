// services/analytics.js
// Safe dummy analytics service - no googleapis required

console.log('📊 Analytics service loaded (dummy mode - no googleapis required)');

const addLeadToSheet = async (lead) => {
  try {
    console.log('📊 [ANALYTICS] Lead would be added to Google Sheets:');
    console.log({
      id: lead._id?.toString() || 'unknown',
      email: lead.email || 'unknown',
      firstName: lead.firstName || '',
      lastName: lead.lastName || '',
      source: lead.source || 'website',
      created: new Date().toLocaleString()
    });
    return true;
  } catch (error) {
    console.error('Error in analytics:', error);
    return false;
  }
};

const addOrderToSheet = async (order) => {
  try {
    console.log('📊 [ANALYTICS] Order would be added to Google Sheets:');
    console.log({
      id: order._id?.toString() || 'unknown',
      amount: order.totalAmount || 0,
      created: new Date().toLocaleString()
    });
    return true;
  } catch (error) {
    console.error('Error in analytics:', error);
    return false;
  }
};

const createLeadsSheetHeaders = async () => {
  console.log('📊 [ANALYTICS] Sheet headers would be created (dummy mode)');
  return true;
};

module.exports = {
  addLeadToSheet,
  addOrderToSheet,
  createLeadsSheetHeaders
};