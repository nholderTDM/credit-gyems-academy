import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [elevated, setElevated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { totalItems } = useCart();

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
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        elevated ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img src="/logo.png" alt="Credit Gyems Academy Logo" className="h-10 w-auto mr-3" />
              <span className="font-bold text-lg text-slate-800">Credit Gyems Academy</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
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
          </div>
          
          {/* CTA Button, Cart, User Menu & Mobile Menu Toggle */}
          <div className="flex items-center">
            {currentUser ? (
              <>
                <Link to="/checkout" className="mr-4 relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700 hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                
                <div className="relative hidden md:block mr-4">
                  <button className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center mr-2">
                      {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                    </div>
                    <span className="text-slate-700">{currentUser.firstName}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link to="/account" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      My Account
                    </Link>
                    <Link to="/account/orders" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      My Orders
                    </Link>
                    <Link to="/community" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
                      Community Forum
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex space-x-4 mr-4">
                <Link to="/login" className="text-slate-700 hover:text-primary transition-colors font-medium">
                  Log In
                </Link>
                <Link to="/register" className="text-slate-700 hover:text-primary transition-colors font-medium">
                  Sign Up
                </Link>
              </div>
            )}

            <Link to="/booking" className="hidden sm:flex text-slate-800 bg-gradient-to-r from-primary to-primary-light hover:from-primary-light hover:to-primary rounded-full px-6 py-2 font-semibold transition-all shadow-md hover:shadow-lg mr-4">
              Free Assessment
            </Link>
            
            <button 
              className="md:hidden flex flex-col space-y-1.5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className={`block w-6 h-0.5 bg-slate-800 transition-transform duration-300 ${mobileMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-slate-800 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-slate-800 transition-transform duration-300 ${mobileMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'}`}>
          <div className="flex flex-col space-y-4 py-4">
            <Link to="/" className={`font-medium ${location.pathname === '/' ? 'text-primary' : 'text-slate-700'}`}>
              Home
            </Link>
            <Link to="/services" className={`font-medium ${location.pathname.startsWith('/services') ? 'text-primary' : 'text-slate-700'}`}>
              Services
            </Link>
            <Link to="/products" className={`font-medium ${location.pathname.startsWith('/products') ? 'text-primary' : 'text-slate-700'}`}>
              Products
            </Link>
            <Link to="/about" className={`font-medium ${location.pathname.startsWith('/about') ? 'text-primary' : 'text-slate-700'}`}>
              About
            </Link>
            <Link to="/blog" className={`font-medium ${location.pathname.startsWith('/blog') ? 'text-primary' : 'text-slate-700'}`}>
              Resources
            </Link>
            
            {currentUser ? (
              <>
                <Link to="/account" className="font-medium text-slate-700">
                  My Account
                </Link>
                <Link to="/community" className="font-medium text-slate-700">
                  Community Forum
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-left font-medium text-slate-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium text-slate-700">
                  Log In
                </Link>
                <Link to="/register" className="font-medium text-slate-700">
                  Sign Up
                </Link>
              </>
            )}
            
            <Link to="/booking" className="text-slate-800 bg-gradient-to-r from-primary to-primary-light rounded-full px-6 py-2 font-semibold transition-all shadow-md w-full text-center mt-2">
              Free Assessment
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;