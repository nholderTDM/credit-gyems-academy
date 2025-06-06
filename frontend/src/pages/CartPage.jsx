import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Button from '../components/common/Button';
import { FaTrash, FaArrowRight, FaCreditCard, FaShoppingBag, FaLongArrowAltLeft } from 'react-icons/fa';

const CartPage = () => {
  const { items, subtotal, total, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  // Handle quantity change
  const handleQuantityChange = (productId, quantity) => {
    updateQuantity(productId, quantity);
  };

  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Your Cart</h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-slate-100">
          <div className="w-20 h-20 mx-auto mb-6 text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Your cart is empty</h2>
          <p className="text-slate-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          
          <Link to="/products">
            <Button variant="primary" icon={<FaShoppingBag />}>
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Your Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            {/* Cart Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 hidden sm:grid sm:grid-cols-12 gap-4 text-sm font-medium text-slate-500">
              <div className="sm:col-span-6">Product</div>
              <div className="sm:col-span-2 text-center">Price</div>
              <div className="sm:col-span-2 text-center">Quantity</div>
              <div className="sm:col-span-2 text-right">Total</div>
            </div>
            
            {/* Cart Items */}
            <div className="divide-y divide-slate-200">
              {items.map((item) => (
                <div key={item.product._id} className="p-4 sm:grid sm:grid-cols-12 sm:gap-4 items-center">
                  {/* Product */}
                  <div className="sm:col-span-6 flex items-center">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="ml-4">
                      <Link
                        to={`/products/${item.product._id}`}
                        className="font-medium text-slate-800 hover:text-yellow-500 transition-colors"
                      >
                        {item.product.title}
                      </Link>
                      
                      <div className="mt-1 text-sm text-slate-500 capitalize">
                        {item.product.type}
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="mt-2 text-sm text-red-500 hover:text-red-600 transition-colors flex items-center sm:hidden"
                      >
                        <FaTrash className="mr-1" size={12} />
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="sm:col-span-2 text-center mt-4 sm:mt-0">
                    <div className="sm:hidden text-sm text-slate-500 mb-1">Price:</div>
                    <div className="font-medium text-slate-800">
                      {formatCurrency(item.product.discountPrice || item.product.price)}
                    </div>
                  </div>
                  
                  {/* Quantity */}
                  <div className="sm:col-span-2 flex justify-center mt-4 sm:mt-0">
                    <div className="sm:hidden text-sm text-slate-500 mb-1 mr-2">Quantity:</div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleQuantityChange(item.product._id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-l-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.product._id, Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-12 h-8 border-t border-b border-slate-300 text-center focus:outline-none focus:ring-0 focus:border-slate-300"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                        className="w-8 h-8 rounded-r-lg border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="sm:col-span-2 text-right mt-4 sm:mt-0 flex items-center justify-between sm:justify-end">
                    <div className="sm:hidden text-sm text-slate-500">Total:</div>
                    <div className="font-medium text-slate-800 mr-4 sm:mr-0">
                      {formatCurrency((item.product.discountPrice || item.product.price) * item.quantity)}
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="text-red-500 hover:text-red-600 transition-colors hidden sm:block"
                      aria-label="Remove item"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Cart Actions */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap justify-between gap-4">
              <button
                onClick={clearCart}
                className="text-red-500 font-medium hover:text-red-600 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Clear Cart
              </button>
              
              <Link
                to="/products"
                className="text-yellow-500 font-medium hover:text-yellow-600 transition-colors flex items-center"
              >
                <FaLongArrowAltLeft className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-800">{formatCurrency(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-medium text-slate-800">$0.00</span>
                </div>
                
                <div className="border-t border-slate-200 pt-4 flex justify-between">
                  <span className="font-medium text-slate-800">Total</span>
                  <span className="font-bold text-slate-800">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between bg-yellow-50 rounded-lg p-3 border border-yellow-200 mb-4">
                  <div className="flex items-center text-yellow-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-medium">Secure Checkout</span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <div className="w-6 h-4 bg-slate-800 rounded"></div>
                    <div className="w-6 h-4 bg-slate-800 rounded"></div>
                    <div className="w-6 h-4 bg-slate-800 rounded"></div>
                    <div className="w-6 h-4 bg-slate-800 rounded"></div>
                  </div>
                </div>
                
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<FaCreditCard />}
                  onClick={() => navigate('/checkout')}
                >
                  Proceed to Checkout
                </Button>
              </div>
              
              <div className="text-center text-sm text-slate-500">
                <p>We accept:</p>
                <div className="flex justify-center space-x-2 mt-2">
                  <div className="w-10 h-6 bg-slate-300 rounded"></div>
                  <div className="w-10 h-6 bg-slate-300 rounded"></div>
                  <div className="w-10 h-6 bg-slate-300 rounded"></div>
                  <div className="w-10 h-6 bg-slate-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;