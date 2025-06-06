import api from './api';

export const createPaymentIntent = async (request) => {
  try {
    const response = await api.post('/orders/payment-intent', request);
    return response.data.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};