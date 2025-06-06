// frontend/src/types/product.js

// Available product types
export const ProductTypes = ['ebook', 'masterclass', 'consultation'];

// Example structure of a product object
export const ProductTemplate = {
  id: '',
  title: '',
  slug: '',
  description: '',
  shortDescription: '',
  type: '', // should be one of ProductTypes
  price: 0,
  compareAtPrice: null,
  featuredImage: '',
  galleryImages: [],
  isPopular: false,
  isFeatured: false,
  createdAt: '',
  updatedAt: '',

  // E-book specific
  pageCount: null,
  pdfFile: '',

  // Masterclass specific
  eventDate: '',
  duration: null,
  capacity: null,

  // Features and content
  features: [],
  contentTable: [
    {
      title: '',
      description: ''
    }
  ],

  // Categorization
  tags: [],
  categories: []
};