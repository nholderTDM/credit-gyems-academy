import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Failed to logout', err);
    }
  };

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: 'home' },
    { name: 'My Products', path: '/dashboard/products', icon: 'book' },
    { name: 'My Courses', path: '/dashboard/courses', icon: 'academic-cap' },
    { name: 'Consultations', path: '/dashboard/consultations', icon: 'calendar' },
    { name: 'Community', path: '/dashboard/community', icon: 'users' },
    { name: 'Profile', path: '/dashboard/profile', icon: 'user' },
  ];

  const renderIcon = (icon) => {
    switch (icon) {
      case 'home':
        return <span>🏠</span>;
      case 'book':
        return <span>📘</span>;
      case 'academic-cap':
        return <span>🎓</span>;
      case 'calendar':
        return <span>📅</span>;
      case 'users':
        return <span>👥</span>;
      case 'user':
        return <span>👤</span>;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
        </button>
        <nav>
          {navigation.map((item) => (
            <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'active' : ''}>
              {renderIcon(item.icon)} {item.name}
            </Link>
          ))}
        </nav>
        <button onClick={handleLogout}>Logout</button>
        <div className="user-info">
          {currentUser && (
            <>
              <p>{currentUser.firstName} {currentUser.lastName}</p>
              <p>{currentUser.email}</p>
            </>
          )}
        </div>
      </aside>
      <main className="content">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;