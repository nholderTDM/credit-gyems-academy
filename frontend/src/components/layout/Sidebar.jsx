import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const Sidebar = ({
  isOpen = true,
  onClose,
  user = null,
  variant = 'default',
  position = 'left',
  className = ''
}) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});
  const [hoveredItem, setHoveredItem] = useState(null);

  // Navigation items configuration
  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'services',
      label: 'Services',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'about',
      label: 'About',
      path: '/about',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'blog',
      label: 'Blog',
      path: '/blog',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    }
  ];

  // User menu items (shown when logged in)
  const userMenuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'community',
      label: 'Community',
      path: '/community',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      id: 'my-courses',
      label: 'My Courses',
      path: '/my-courses',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      )
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
    default: 'bg-white border-r border-gray-200',
    dark: 'bg-gray-900 text-white',
    glass: 'backdrop-blur-xl bg-white/90 border-r border-white/20',
    gradient: 'bg-gradient-to-b from-blue-900 to-blue-950 text-white'
  };

  // Sidebar width and position
  const sidebarWidth = isOpen ? 'w-64' : 'w-0';
  const positionClasses = position === 'left' ? 'left-0' : 'right-0';

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && onClose && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 ${positionClasses} h-full z-50
        ${sidebarWidth}
        ${variantStyles[variant]}
        transition-all duration-300 ease-in-out
        overflow-hidden
        shadow-2xl
        ${className}
      `}>
        <div className="h-full w-64 overflow-y-auto">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200/20">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">CG</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
                  Credit Gyems
                </h1>
                <p className={`text-xs ${variant === 'default' ? 'text-gray-500' : 'text-white/60'}`}>
                  Academy
                </p>
              </div>
            </Link>
          </div>

          {/* User Profile Section */}
          {user && (
            <div className="p-4 border-b border-gray-200/20">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${variant === 'default' ? 'text-gray-900' : 'text-white'}`}>
                    {user.name || 'User'}
                  </p>
                  <p className={`text-sm ${variant === 'default' ? 'text-gray-500' : 'text-white/60'}`}>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="p-4">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`
                          w-full flex items-center justify-between px-4 py-3 rounded-lg
                          transition-all duration-200
                          ${hoveredItem === item.id ? 'bg-yellow-400/10' : ''}
                          ${variant === 'default' ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10'}
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <svg 
                          className={`w-4 h-4 transition-transform duration-200 ${expandedItems[item.id] ? 'rotate-180' : ''}`}
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
                        ${expandedItems[item.id] ? 'max-h-40' : 'max-h-0'}
                      `}>
                        <div className="ml-12 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.id}
                              to={subItem.path}
                              className={`
                                block px-4 py-2 rounded-lg text-sm
                                transition-all duration-200
                                ${isActivePath(subItem.path) ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-white' : ''}
                                ${!isActivePath(subItem.path) && variant === 'default' ? 'hover:bg-gray-100 text-gray-600' : ''}
                                ${!isActivePath(subItem.path) && variant !== 'default' ? 'hover:bg-white/10 text-white/80' : ''}
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
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg
                        transition-all duration-200
                        ${isActivePath(item.path) ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-lg' : ''}
                        ${!isActivePath(item.path) && hoveredItem === item.id ? 'bg-yellow-400/10' : ''}
                        ${!isActivePath(item.path) && variant === 'default' ? 'hover:bg-gray-100 text-gray-700' : ''}
                        ${!isActivePath(item.path) && variant !== 'default' ? 'hover:bg-white/10 text-white/80' : ''}
                      `}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* User Menu (if logged in) */}
            {user && (
              <>
                <div className={`my-6 border-t ${variant === 'default' ? 'border-gray-200' : 'border-white/20'}`} />
                <div className="space-y-1">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg
                        transition-all duration-200
                        ${isActivePath(item.path) ? 'bg-gradient-to-r from-yellow-400 to-red-500 text-white shadow-lg' : ''}
                        ${!isActivePath(item.path) && hoveredItem === item.id ? 'bg-yellow-400/10' : ''}
                        ${!isActivePath(item.path) && variant === 'default' ? 'hover:bg-gray-100 text-gray-700' : ''}
                        ${!isActivePath(item.path) && variant !== 'default' ? 'hover:bg-white/10 text-white/80' : ''}
                      `}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/20">
            {user ? (
              <button
                onClick={() => {/* Handle logout */}}
                className={`
                  w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg
                  transition-all duration-200
                  ${variant === 'default' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-white/10 hover:bg-white/20 text-white'}
                `}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg
                  bg-gradient-to-r from-yellow-400 to-red-500 text-white
                  hover:from-yellow-500 hover:to-red-600
                  transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span className="font-medium">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

Sidebar.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  }),
  variant: PropTypes.oneOf(['default', 'dark', 'glass', 'gradient']),
  position: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string
};

export default Sidebar;