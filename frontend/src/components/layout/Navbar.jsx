import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useCart } from '@contexts/useCart';

const Navbar = () => {
  const [elevated, setElevated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { items } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setElevated(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'Products', href: '/products' },
    { name: 'About', href: '/about' },
    { name: 'Blog', href: '/blog' },
    { name: 'Community', href: '/community' }
  ];

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        elevated ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-3">
              <span className="text-slate-800 font-bold text-lg">CG</span>
            </div>
            <span className="font-bold text-lg text-slate-800">Credit Gyems Academy</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                to={item.href} 
                className={`font-medium transition-colors ${
                  location.pathname === item.href 
                    ? 'text-primary' 
                    : 'text-slate-700 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-slate-700 hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Account or Login */}
            {currentUser ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 text-slate-700 hover:text-primary transition-colors">
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-sm font-semibold">
                    {currentUser.firstName?.charAt(0)}{currentUser.lastName?.charAt(0)}
                  </div>
                  <span className="hidden sm:block font-medium">{currentUser.firstName}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link to="/account" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors">
                      My Account
                    </Link>
                    <Link to="/account/orders" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors">
                      Orders
                    </Link>
                    <Link to="/account/bookings" className="block px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors">
                      Bookings
                    </Link>
                    <hr className="my-2" />
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-4">
                <Link to="/login" className="font-medium text-slate-700 hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link to="/booking" className="bg-gradient-to-r from-primary to-yellow-400 hover:from-yellow-400 hover:to-primary text-slate-800 rounded-full px-6 py-2 font-semibold transition-all shadow-md hover:shadow-lg">
                  Free Assessment
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden flex flex-col space-y-1.5 p-2"
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
          <div className="flex flex-col space-y-4 py-4 bg-white rounded-lg shadow-lg border border-slate-200">
            {navigation.map((item) => (
              <Link 
                key={item.name} 
                to={item.href} 
                className={`font-medium px-4 py-2 transition-colors ${
                  location.pathname === item.href 
                    ? 'text-primary bg-yellow-50' 
                    : 'text-slate-700 hover:text-primary hover:bg-slate-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {!currentUser && (
              <>
                <hr className="mx-4" />
                <Link 
                  to="/login" 
                  className="font-medium text-slate-700 hover:text-primary transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/booking" 
                  className="bg-gradient-to-r from-primary to-yellow-400 text-slate-800 rounded-full px-6 py-2 font-semibold transition-all shadow-md mx-4"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Free Assessment
                </Link>
              </>
            )}
            
            {currentUser && (
              <>
                <hr className="mx-4" />
                <Link 
                  to="/account" 
                  className="font-medium text-slate-700 hover:text-primary transition-colors px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-left font-medium text-slate-700 hover:text-primary transition-colors px-4 py-2"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;