import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/useCart';

// Components
import Loader from '../components/common/Loader';
import ErrorDisplay from '../components/common/ErrorDisplay';
import Button from '../components/common/Button';
import { 
  FaShoppingCart, 
  FaCheck, 
  FaBookOpen, 
  FaClock, 
  FaFilePdf,
  FaVideo,
  FaCalendarAlt,
  FaArrowLeft,
  FaStar,
  FaFileDownload,
  FaUserGraduate
} from 'react-icons/fa';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const { addItem, isInCart } = useCart();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        
        setProduct(response.data.data);
        
        // Fetch related products
        const relatedResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/products`,
          {
            params: {
              type: response.data.data.type,
              exclude: id,
              limit: 4
            },
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        );
        
        setRelatedProducts(relatedResponse.data.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchProduct();
    }
  }, [id, token]);

  // Handle adding product to cart
  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      
      // Reset quantity after adding to cart
      setQuantity(1);
    }
  };

  // Handle buy now button
  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !product) {
    return (
      <ErrorDisplay 
        message={error || 'Product not found.'}
        actionText="Back to Products"
        onAction={() => navigate('/products')}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center text-yellow-500 hover:text-yellow-600 font-medium mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Products
      </Link>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="p-6 md:p-8">
            <div className="relative rounded-lg overflow-hidden shadow-md aspect-[4/3]">
              <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
                onLoad={(e) => {
                  const loader = e.target.parentElement?.querySelector('.animate-pulse');
                  if (loader) loader.classList.add('hidden');
                }}
              />
              
              {/* Type badge */}
              <div 
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium uppercase"
                style={{ 
                  backgroundColor: product.type === 'ebook' 
                    ? '#FFD70020' 
                    : product.type === 'masterclass' 
                      ? '#FF000020' 
                      : '#26A69A20',
                  color: product.type === 'ebook' 
                    ? '#FFD700' 
                    : product.type === 'masterclass' 
                      ? '#FF0000' 
                      : '#26A69A',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {product.type === 'ebook' && (
                  <span className="flex items-center">
                    <FaBookOpen className="mr-1" /> E-Book
                  </span>
                )}
                
                {product.type === 'masterclass' && (
                  <span className="flex items-center">
                    <FaVideo className="mr-1" /> Masterclass
                  </span>
                )}
                
                {product.type === 'consultation' && (
                  <span className="flex items-center">
                    <FaCalendarAlt className="mr-1" /> Consultation
                  </span>
                )}
              </div>
              
              {/* Popular tag */}
              {product.popular && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
              )}
            </div>
            
            {/* Product details bullets */}
            <div className="mt-6 bg-slate-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-800 mb-3">Product Details</h3>
              
              <ul className="space-y-2">
                {product.type === 'ebook' && (
                  <>
                    <li className="flex items-center text-slate-600">
                      <FaFilePdf className="mr-2 text-yellow-500" />
                      Format: {product.details?.format || 'PDF'}
                    </li>
                    
                    {product.details?.pages && (
                      <li className="flex items-center text-slate-600">
                        <FaBookOpen className="mr-2 text-yellow-500" />
                        Pages: {product.details.pages}
                      </li>
                    )}
                    
                    <li className="flex items-center text-slate-600">
                      <FaFileDownload className="mr-2 text-yellow-500" />
                      Instant download after purchase
                    </li>
                  </>
                )}
                
                {product.type === 'masterclass' && (
                  <>
                    {product.details?.duration && (
                      <li className="flex items-center text-slate-600">
                        <FaClock className="mr-2 text-red-500" />
                        Duration: {product.details.duration} minutes
                      </li>
                    )}
                    
                    <li className="flex items-center text-slate-600">
                      <FaVideo className="mr-2 text-red-500" />
                      Format: Online Video
                    </li>
                    
                    <li className="flex items-center text-slate-600">
                      <FaUserGraduate className="mr-2 text-red-500" />
                      Expert Instruction by DorTae Freeman
                    </li>
                  </>
                )}
                
                {product.type === 'consultation' && (
                  <>
                    {product.details?.duration && (
                      <li className="flex items-center text-slate-600">
                        <FaClock className="mr-2 text-teal-500" />
                        Duration: {product.details.duration} minutes
                      </li>
                    )}
                    
                    <li className="flex items-center text-slate-600">
                      <FaCalendarAlt className="mr-2 text-teal-500" />
                      Schedule at your convenience
                    </li>
                    
                    <li className="flex items-center text-slate-600">
                      <FaUserGraduate className="mr-2 text-teal-500" />
                      One-on-one session with DorTae Freeman
                    </li>
                  </>
                )}
                
                {/* Display features if available */}
                {product.details?.features && product.details.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-slate-600">
                    <FaStar className="mr-2 mt-1 text-yellow-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
              {product.title}
            </h1>
            
            <div className="flex items-center mb-4">
              <div className="flex">
                {Array(5).fill(0).map((_, index) => (
                  <FaStar 
                    key={index}
                    className={`${index < 5 ? 'text-yellow-400' : 'text-slate-300'} mr-1`}
                  />
                ))}
              </div>
              <span className="text-slate-600 ml-2">5.0 (12 reviews)</span>
            </div>
            
            <div className="mb-6">
              {product.discountPrice ? (
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-slate-800">${product.discountPrice.toFixed(2)}</span>
                  <span className="text-xl text-slate-500 line-through ml-3">${product.price.toFixed(2)}</span>
                  <span className="ml-3 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm font-medium">
                    Save ${(product.price - product.discountPrice).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-slate-800">${product.price.toFixed(2)}</span>
              )}
            </div>
            
            <div className="prose max-w-none text-slate-600 mb-8">
              <p>{product.description}</p>
            </div>
            
            {/* Quantity selector (only for e-books) */}
            {product.type === 'ebook' && (
              <div className="mb-6">
                <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-l-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 h-10 border-t border-b border-slate-300 text-center focus:outline-none focus:ring-0 focus:border-slate-300"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-r-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {isInCart(product._id) ? (
                <Button
                  variant="success"
                  size="lg"
                  fullWidth
                  icon={<FaCheck />}
                  onClick={() => navigate('/cart')}
                >
                  Added to Cart - View Cart
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    icon={<FaShoppingCart />}
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                </>
              )}
            </div>
            
            {/* Guarantee notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
              <h3 className="font-bold flex items-center text-sm uppercase tracking-wide mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                30-Day Money-Back Guarantee
              </h3>
              <p className="text-sm">
                If you're not completely satisfied with your purchase, simply let us know within 30 days for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-6">You May Also Like</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <div 
                key={relatedProduct._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg border border-slate-100 overflow-hidden transition-all duration-300 flex flex-col"
              >
                <Link to={`/products/${relatedProduct._id}`} className="block overflow-hidden h-40">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </Link>
                
                <div className="p-4 flex-grow flex flex-col">
                  <Link to={`/products/${relatedProduct._id}`} className="block">
                    <h3 className="font-bold text-slate-800 hover:text-yellow-500 transition-colors line-clamp-1">
                      {relatedProduct.title}
                    </h3>
                  </Link>
                  
                  <div className="mt-2 mb-4">
                    {relatedProduct.discountPrice ? (
                      <div className="flex items-center">
                        <span className="font-bold text-slate-800">${relatedProduct.discountPrice.toFixed(2)}</span>
                        <span className="text-sm text-slate-500 line-through ml-2">${relatedProduct.price.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-800">${relatedProduct.price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  <Button
                    variant={isInCart(relatedProduct._id) ? "success" : "primary"}
                    size="sm"
                    fullWidth
                    icon={isInCart(relatedProduct._id) ? <FaCheck /> : <FaShoppingCart />}
                    onClick={() => isInCart(relatedProduct._id) ? navigate('/cart') : addItem(relatedProduct)}
                  >
                    {isInCart(relatedProduct._id) ? "Added" : "Add to Cart"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;