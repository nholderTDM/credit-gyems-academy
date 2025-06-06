/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart - UPDATED VERSION
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Handle both 'id' and 'productId' fields
      const productId = product.id || product.productId;
      const existingItem = prevItems.find(item =>
        (item.id === productId) ||
        (item.productId === productId) ||
        (item.id === product.productId) ||
        (item.productId === product.id)
      );
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          (item.id === productId || item.productId === productId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item - ensure it has an 'id' field
        return [...prevItems, {
          ...product,
          id: productId,
          quantity
        }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => 
      item.id !== productId && item.productId !== productId
    ));
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.id === productId || item.productId === productId) 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate totals
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    addItem: addToCart, // Alias for consistency with previous code
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    setError: (error) => setError(error),
    clearError: () => setError(null)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};