import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [elevated, setElevated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart();

  // Calculate total items in cart
  const totalItems = cartItems?.length || 0;

  useEffect(() => {
    const handleScroll = () => {
      setElevated(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        elevated ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-white/90 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="h-10 w-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">CG</span>
              </div>
              <span className="font-bold text-lg text-slate-800 group-hover:text-primary transition-colors">
                Credit Gyems Academy
              </span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex space-x-8">
            <Link to="/" className={`font-medium ${location.pathname === '/' ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
              Home
            </Link>
            <Link to="/services" className={`font-medium ${location.pathname.startsWith('/services') ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
              Services
            </Link>
            <Link to="/products" className={`font-medium ${location.pathname.startsWith('/products') ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
              Products
            </Link>
            <Link to="/about" className={`font-medium ${location.pathname.startsWith('/about') ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
              About
            </Link>
            <Link to="/blog" className={`font-medium ${location.pathname.startsWith('/blog') ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
              Resources
            </Link>
            {currentUser && (
              <Link to="/community" className={`font-medium ${location.pathname.startsWith('/community') ? 'text-primary' : 'text-slate-700 hover:text-primary'} transition-colors`}>
                Community
              </Link>
            )}
          </div>
          
          {/* Right Side - Auth, Cart, CTA */}
          <div className="flex items-center space-x-4">
            {/* Development Testing Navigation - Visible for easy access */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
              <span className="text-xs text-yellow-600 font-medium">Testing:</span>
              {!currentUser ? (
                <>
                  <Link 
                    to="/login" 
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 hover:bg-blue-50 rounded"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-xs text-green-600 hover:text-green-800 font-medium px-2 py-1 hover:bg-green-50 rounded"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <span className="text-xs text-green-600 font-medium">
                  ✓ Logged in as {currentUser.firstName}
                </span>
              )}
            </div>

            {/* Cart Icon */}
            {currentUser && (
              <Link to="/checkout" className="relative group">
                <div className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
            )}
            
            {/* User Menu */}
            {currentUser ? (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
                    </span>
                  </div>
                  <span className="hidden md:block text-slate-700 font-medium">{currentUser.firstName}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-slate-200">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-sm text-slate-500">{currentUser.email}</p>
                    </div>
                    <Link to="/account" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      My Account
                    </Link>
                    <Link to="/account/orders" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      My Orders
                    </Link>
                    <Link to="/community" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      Community Forum
                    </Link>
                    <Link to="/booking" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                      Book Consultation
                    </Link>
                    <div className="border-t border-slate-100 mt-2">
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Link 
                  to="/login" 
                  className="text-slate-700 hover:text-primary transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-50"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-primary to-yellow-400 text-slate-800 font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* CTA Button */}
            <Link 
              to="/booking" 
              className="hidden sm:flex bg-gradient-to-r from-secondary to-red-600 text-white rounded-lg px-4 py-2 font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Free Assessment
            </Link>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden flex flex-col space-y-1.5 p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className={`block w-6 h-0.5 bg-slate-800 transition-transform duration-300 ${mobileMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-slate-800 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-slate-800 transition-transform duration-300 ${mobileMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-screen opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="flex flex-col space-y-3 py-4 border-t border-slate-200">
            <Link to="/" className={`font-medium py-2 ${location.pathname === '/' ? 'text-primary' : 'text-slate-700'}`}>
              Home
            </Link>
            <Link to="/services" className={`font-medium py-2 ${location.pathname.startsWith('/services') ? 'text-primary' : 'text-slate-700'}`}>
              Services
            </Link>
            <Link to="/products" className={`font-medium py-2 ${location.pathname.startsWith('/products') ? 'text-primary' : 'text-slate-700'}`}>
              Products
            </Link>
            <Link to="/about" className={`font-medium py-2 ${location.pathname.startsWith('/about') ? 'text-primary' : 'text-slate-700'}`}>
              About
            </Link>
            <Link to="/blog" className={`font-medium py-2 ${location.pathname.startsWith('/blog') ? 'text-primary' : 'text-slate-700'}`}>
              Resources
            </Link>
            
            {currentUser ? (
              <>
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <p className="text-sm font-medium text-slate-900 mb-2">Hi, {currentUser.firstName}!</p>
                </div>
                <Link to="/account" className="font-medium text-slate-700 py-2">
                  My Account
                </Link>
                <Link to="/community" className="font-medium text-slate-700 py-2">
                  Community Forum
                </Link>
                <Link to="/checkout" className="font-medium text-slate-700 py-2">
                  Cart ({totalItems})
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-left font-medium text-red-600 py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="border-t border-slate-200 pt-3 mt-3 space-y-3">
                <Link 
                  to="/login" 
                  className="block bg-slate-100 text-slate-700 font-medium py-3 px-4 rounded-lg text-center"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="block bg-gradient-to-r from-primary to-yellow-400 text-slate-800 font-semibold py-3 px-4 rounded-lg text-center"
                >
                  Sign Up
                </Link>
              </div>
            )}
            
            <Link 
              to="/booking" 
              className="bg-gradient-to-r from-secondary to-red-600 text-white rounded-lg py-3 px-4 font-semibold text-center mt-4"
            >
              Free Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;