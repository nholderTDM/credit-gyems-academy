import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const MobileMenu = ({
  isOpen,
  onClose,
  user = null,
  variant = 'default',
  position = 'bottom',
  className = ''
}) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('menu');
  const [expandedItems, setExpandedItems] = useState({});

  // Close menu on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname, isOpen, onClose]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Navigation items
  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'services',
      label: 'Services',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      subItems: [
        { id: 'credit-repair', label: 'Credit Repair', path: '/services/credit-repair' },
        { id: 'credit-coaching', label: 'Credit Coaching', path: '/services/credit-coaching' },
        { id: 'financial-planning', label: 'Financial Planning', path: '/services/financial-planning' }
      ]
    },
    {
      id: 'products',
      label: 'Products',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      subItems: [
        { id: 'ebooks', label: 'E-Books', path: '/products/ebooks' },
        { id: 'masterclasses', label: 'Masterclasses', path: '/products/masterclasses' }
      ]
    },
    {
      id: 'resources',
      label: 'Resources',
      path: '/resources',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    }
  ];

  // Quick actions for bottom sheet
  const quickActions = [
    {
      id: 'book-consultation',
      label: 'Book Consultation',
      path: '/book-consultation',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'free-assessment',
      label: 'Free Assessment',
      path: '/free-assessment',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'contact',
      label: 'Contact Us',
      path: '/contact',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-teal-500 to-teal-600'
    }
  ];

  // Handle submenu toggle
  const toggleSubmenu = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Check if path is active
  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Variant styles
  const variantStyles = {
    default: 'bg-white',
    dark: 'bg-gray-900 text-white',
    glass: 'backdrop-blur-xl bg-white/95',
    gradient: 'bg-gradient-to-b from-blue-900 to-blue-950 text-white'
  };

  // Position styles
  const positionStyles = {
    bottom: 'bottom-0 rounded-t-3xl',
    top: 'top-0 rounded-b-3xl',
    fullscreen: 'inset-0'
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Mobile Menu Container */}
      <div className={`
        fixed left-0 right-0 z-50
        ${positionStyles[position]}
        ${variantStyles[variant]}
        ${position === 'fullscreen' ? '' : 'max-h-[90vh]'}
        shadow-2xl
        transition-all duration-300 ease-out
        ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        ${className}
      `}>
        {/* Handle Bar (for bottom sheet) */}
        {position === 'bottom' && (
          <div className="flex justify-center pt-3 pb-2">
            <div className={`w-12 h-1 rounded-full ${variant === 'default' ? 'bg-gray-300' : 'bg-white/30'}`} />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/20">
          <h2 className={`text-xl font-bold ${variant === 'default' ? 'text-gray-900' : ''}`}>
            Menu
          </h2>
          <button
            onClick={onClose}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200
              ${variant === 'default' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/10 hover:bg-white/20'}
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200/20">
          {['menu', 'quick-actions', user && 'account'].filter(Boolean).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex-1 px-4 py-3 text-sm font-medium
                transition-all duration-200
                ${activeTab === tab ? 
                  'border-b-2 border-yellow-400 text-yellow-500' : 
                  variant === 'default' ? 'text-gray-500' : 'text-white/60'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Menu Tab */}
          {activeTab === 'menu' && (
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        className={`
                          w-full flex items-center justify-between px-4 py-4 rounded-xl
                          transition-all duration-200
                          ${variant === 'default' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}
                        `}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`
                            p-2 rounded-lg
                            ${variant === 'default' ? 'bg-gray-100' : 'bg-white/10'}
                          `}>
                            {item.icon}
                          </div>
                          <span className="font-medium text-lg">{item.label}</span>
                        </div>
                        <svg 
                          className={`w-5 h-5 transition-transform duration-200 ${expandedItems[item.id] ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Submenu */}
                      <div className={`
                        overflow-hidden transition-all duration-300
                        ${expandedItems[item.id] ? 'max-h-48' : 'max-h-0'}
                      `}>
                        <div className="pl-16 pr-4 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.id}
                              to={subItem.path}
                              className={`
                                block px-4 py-3 rounded-lg
                                transition-all duration-200
                                ${isActivePath(subItem.path) ? 
                                  'bg-gradient-to-r from-yellow-400 to-red-500 text-white' : 
                                  variant === 'default' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                                }
                              `}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`
                        flex items-center space-x-4 px-4 py-4 rounded-xl
                        transition-all duration-200
                        ${isActivePath(item.path) ? 
                          'bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-lg' : 
                          variant === 'default' ? 'hover:bg-gray-100' : 'hover:bg-white/10'
                        }
                      `}
                    >
                      <div className={`
                        p-2 rounded-lg
                        ${isActivePath(item.path) ? 
                          'bg-white/20' : 
                          variant === 'default' ? 'bg-gray-100' : 'bg-white/10'
                        }
                      `}>
                        {item.icon}
                      </div>
                      <span className="font-medium text-lg">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions Tab */}
          {activeTab === 'quick-actions' && (
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.id}
                    to={action.path}
                    className="group"
                  >
                    <div className={`
                      aspect-square rounded-2xl p-4
                      bg-gradient-to-br ${action.color}
                      text-white shadow-lg
                      transition-all duration-200
                      group-hover:shadow-xl group-hover:scale-105
                      flex flex-col items-center justify-center
                    `}>
                      {action.icon}
                      <span className="text-xs font-medium mt-2 text-center">
                        {action.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Call to Action */}
              <div className={`
                mt-6 p-6 rounded-2xl
                ${variant === 'default' ? 'bg-gray-50' : 'bg-white/5'}
              `}>
                <h3 className={`text-lg font-bold mb-2 ${variant === 'default' ? 'text-gray-900' : ''}`}>
                  Ready to Transform Your Credit?
                </h3>
                <p className={`text-sm mb-4 ${variant === 'default' ? 'text-gray-600' : 'text-white/80'}`}>
                  Get your free credit assessment today and start your journey to financial freedom.
                </p>
                <Link
                  to="/get-started"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg
                    bg-gradient-to-r from-yellow-400 to-red-500 text-white
                    hover:from-yellow-500 hover:to-red-600
                    transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="font-medium">Get Started</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && user && (
            <div className="p-6">
              {/* User Profile */}
              <div className={`
                p-6 rounded-2xl mb-6
                ${variant === 'default' ? 'bg-gray-50' : 'bg-white/5'}
              `}>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${variant === 'default' ? 'text-gray-900' : ''}`}>
                      {user.name || 'User'}
                    </h3>
                    <p className={`text-sm ${variant === 'default' ? 'text-gray-500' : 'text-white/60'}`}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/dashboard"
                    className={`
                      text-center px-4 py-2 rounded-lg font-medium
                      transition-all duration-200
                      ${variant === 'default' ? 
                        'bg-white hover:bg-gray-100' : 
                        'bg-white/10 hover:bg-white/20'
                      }
                    `}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/settings"
                    className={`
                      text-center px-4 py-2 rounded-lg font-medium
                      transition-all duration-200
                      ${variant === 'default' ? 
                        'bg-white hover:bg-gray-100' : 
                        'bg-white/10 hover:bg-white/20'
                      }
                    `}
                  >
                    Settings
                  </Link>
                </div>
              </div>

              {/* Account Actions */}
              <div className="space-y-3">
                <Link
                  to="/my-courses"
                  className={`
                    flex items-center justify-between px-4 py-4 rounded-xl
                    transition-all duration-200
                    ${variant === 'default' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}
                  `}
                >
                  <span className="font-medium">My Courses</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  to="/community"
                  className={`
                    flex items-center justify-between px-4 py-4 rounded-xl
                    transition-all duration-200
                    ${variant === 'default' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}
                  `}
                >
                  <span className="font-medium">Community</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <button
                  onClick={() => {/* Handle logout */}}
                  className={`
                    w-full flex items-center justify-center space-x-2 px-4 py-4 rounded-xl
                    transition-all duration-200
                    ${variant === 'default' ? 
                      'bg-red-50 hover:bg-red-100 text-red-600' : 
                      'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                    }
                  `}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Safe Area */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </>
  );
};

MobileMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired, // Should be wrapped in useCallback in parent component
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  }),
  variant: PropTypes.oneOf(['default', 'dark', 'glass', 'gradient']),
  position: PropTypes.oneOf(['bottom', 'top', 'fullscreen']),
  className: PropTypes.string
};

export default MobileMenu;