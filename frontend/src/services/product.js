import api from './api';

// Get all products with optional filtering
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.type) {
      params.append('type', filters.type);
    }

    if (filters.category) {
      params.append('category', filters.category);
    }

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.featured) {
      params.append('featured', 'true');
    }

    if (filters.popular) {
      params.append('popular', 'true');
    }

    params.append('page', (filters.page || 1).toString());
    params.append('limit', (filters.limit || 12).toString());

    const response = await api.get(`/products?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get a single product by ID or slug
export const getProduct = async (idOrSlug) => {
  try {
    const response = await api.get(`/products/${idOrSlug}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching product ${idOrSlug}:`, error);
    throw error;
  }
};

// Get related products
export const getRelatedProducts = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/related`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    throw error;
  }
};