// Import the original useCart hook and CartProvider from CartContext
import { useCart as useCartOriginal, CartProvider } from './CartContext';

// Re-export CartProvider for convenience
export { CartProvider };

// Create a wrapper hook that provides backward compatibility
export const useCart = () => {
  const cart = useCartOriginal();
  
  // Return the cart context with addItem as an alias for addToCart
  // This maintains backward compatibility for components expecting addItem
  return {
    ...cart,
    addItem: cart.addToCart, // Alias for backward compatibility
    // You can add more aliases or transformations here if needed
  };
};

// Helper utilities for cart functionality

// Format price for display
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

// Calculate discount information
export const calculateDiscount = (originalPrice, discountedPrice) => {
  const discount = originalPrice - discountedPrice;
  const discountPercentage = Math.round((discount / originalPrice) * 100);
  return {
    amount: discount,
    percentage: discountPercentage
  };
};

// Check if item is in cart
export const isInCart = (cartItems, productId) => {
  return cartItems.some(item => item.id === productId || item.productId === productId);
};

// Get item quantity in cart
export const getItemQuantity = (cartItems, productId) => {
  const item = cartItems.find(item => item.id === productId || item.productId === productId);
  return item ? item.quantity : 0;
};