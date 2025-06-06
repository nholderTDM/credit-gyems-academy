import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaHome, 
  FaUsers, 
  FaBook, 
  FaShoppingCart, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const MainLayout = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation links
  const navLinks = [
    { to: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { to: '/community', icon: <FaUsers />, label: 'Community' },
    { to: '/products', icon: <FaBook />, label: 'Products' },
    { to: '/cart', icon: <FaShoppingCart />, label: 'Cart' },
    { to: '/account/profile', icon: <FaUser />, label: 'Profile' }
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if a path is active
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-20">
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center text-white font-bold mr-3">
              CG
            </div>
            <span className="text-xl font-bold text-slate-800">Credit Gyems</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center text-sm font-medium ${
                  isActive(link.to) 
                    ? 'text-yellow-500' 
                    : 'text-slate-600 hover:text-yellow-500'
                } transition-colors`}
              >
                <span className="mr-1.5">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            
            <button
              onClick={handleLogout}
              className="flex items-center text-sm font-medium text-slate-600 hover:text-red-500 transition-colors"
            >
              <FaSignOutAlt className="mr-1.5" />
              Logout
            </button>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex flex-col space-y-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div 
        className={`md:hidden fixed top-16 right-0 left-0 z-10 bg-white shadow-lg transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="container mx-auto py-4 px-4">
          <nav className="flex flex-col space-y-4">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center py-2 px-4 rounded-lg ${
                  isActive(link.to) 
                    ? 'bg-yellow-50 text-yellow-500' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-yellow-500'
                } transition-colors`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center py-2 px-4 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-red-500 transition-colors"
            >
              <FaSignOutAlt className="mr-3" />
              Logout
            </button>
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-white py-6 mt-auto border-t border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Credit Gyems Academy. All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-slate-500 hover:text-yellow-500 transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-500 hover:text-yellow-500 transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-slate-500 hover:text-yellow-500 transition-colors text-sm">
                Help
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;