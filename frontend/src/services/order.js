import api from './api';

export const createOrder = async (data) => {
  try {
    const response = await api.post('/orders/confirm', data);
    return response.data.data;
  } catch (error) {
    console.error('Error confirming order:', error);
    throw error;
  }
};

export const getOrder = async (id) => {
  try {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};

export const getUserOrders = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};