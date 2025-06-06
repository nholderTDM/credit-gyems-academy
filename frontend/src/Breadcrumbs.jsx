import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  
  // Don't show breadcrumbs on home page
  if (pathnames.length === 0) return null;
  
  // Create breadcrumb items
  const breadcrumbItems = pathnames.map((value, index) => {
    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
    const isLast = index === pathnames.length - 1;
    
    // Format the display name
    let displayName = value.charAt(0).toUpperCase() + value.slice(1);
    displayName = displayName.replace(/-/g, ' ');
    
    // Special cases for better display names
    const nameMap = {
      'account': 'My Account',
      'credit-repair': 'Credit Repair',
      'credit-coaching': 'Credit Coaching',
      'financial-planning': 'Financial Planning',
    };
    
    if (nameMap[value]) {
      displayName = nameMap[value];
    }
    
    return { displayName, to, isLast };
  });
  
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/"
            className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-primary"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </Link>
        </li>
        {breadcrumbItems.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {item.isLast ? (
                <span className="ml-1 text-sm font-medium text-slate-500 md:ml-2">
                  {item.displayName}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="ml-1 text-sm font-medium text-slate-700 hover:text-primary md:ml-2"
                >
                  {item.displayName}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;