import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const location = useLocation();
  const { addItem } = useCart();
  
  // Parse category from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category) {
      setActiveCategory(category);
    }
  }, [location.search]);
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
        setProducts(response.data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Filter products by category
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.type === activeCategory);
  
  // Add to cart handler
  const handleAddToCart = (product) => {
    addItem({
      productId: product._id,
      title: product.title,
      price: product.discountPrice || product.price,
      quantity: 1,
      image: product.featuredImage
    });
    
    // Show toast notification (you can implement this with a library like react-toastify)
    alert(`${product.title} added to cart!`);
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="pt-28 pb-16 bg-gradient-to-br from-yellow-50 to-red-50">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-6 text-slate-800 text-center">
            Credit Transformation Resources
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto text-center mb-8">
            Discover our comprehensive collection of educational resources designed to help you master your credit and build lasting financial freedom.
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-white rounded-full p-1 shadow-md">
              <button
                className={`px-4 py-2 rounded-full ${
                  activeCategory === 'all' 
                    ? 'bg-primary text-slate-800 font-medium'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                onClick={() => setActiveCategory('all')}
              >
                All Products
              </button>
              <button
                className={`px-4 py-2 rounded-full ${
                  activeCategory === 'ebook' 
                    ? 'bg-primary text-slate-800 font-medium'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                onClick={() => setActiveCategory('ebook')}
              >
                E-Books
              </button>
              <button
                className={`px-4 py-2 rounded-full ${
                  activeCategory === 'masterclass' 
                    ? 'bg-primary text-slate-800 font-medium'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                onClick={() => setActiveCategory('masterclass')}
              >
                Masterclasses
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="py-16 flex-grow">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-red-500 mb-4">{error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="bg-primary hover:bg-primary-dark text-slate-800 px-6 py-2 rounded-full"
              >
                Try Again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-slate-600 mb-4">No products found in this category.</p>
              <button 
                onClick={() => setActiveCategory('all')}
                className="bg-primary hover:bg-primary-dark text-slate-800 px-6 py-2 rounded-full"
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div key={product._id}>
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 h-full flex flex-col relative overflow-hidden group">
                    {product.popular && (
                      <div className="absolute -right-10 top-6 bg-secondary text-white px-10 py-1 transform rotate-45 z-10 text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="h-64 overflow-hidden">
                      <img
                        src={product.featuredImage}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="mb-2">
                        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                          product.type === 'ebook' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {product.type === 'ebook' ? 'E-Book' : 'Masterclass'}
                        </span>
                      </div>
                      
                      <Link to={`/products/${product._id}`} className="block">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 hover:text-primary transition-colors">
                          {product.title}
                        </h3>
                      </Link>
                      
                      <p className="text-slate-600 text-sm mb-4 flex-grow">
                        {product.description.length > 120 
                          ? product.description.substring(0, 120) + '...' 
                          : product.description
                        }
                      </p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          {product.discountPrice ? (
                            <div className="flex items-center">
                              <span className="text-primary font-bold text-lg">${product.discountPrice}</span>
                              <span className="text-slate-400 line-through ml-2">${product.price}</span>
                            </div>
                          ) : (
                            <span className="text-primary font-bold text-lg">${product.price}</span>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleAddToCart(product)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2 rounded-full transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                      </div>
                      
                      <Link 
                        to={`/products/${product._id}`}
                        className="bg-gradient-to-r from-primary to-primary-light text-slate-800 font-semibold rounded-full py-2 w-full text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductsPage;