// frontend/src/types/cart.js

import { ProductTypes } from './product';

export const CartItemTemplate = {
  id: '',
  title: '',
  price: 0,
  image: '',
  quantity: 1,
  type: ProductTypes[0] // e.g., 'ebook', 'masterclass', or 'consultation'
};