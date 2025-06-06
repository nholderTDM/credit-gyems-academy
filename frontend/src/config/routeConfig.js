// Route configuration for Credit Gyems Academy
export const ROUTES = {
    // Public routes
    HOME: '/',
    ABOUT: '/about',
    SERVICES: '/services',
    CREDIT_REPAIR: '/services/credit-repair',
    CREDIT_COACHING: '/services/credit-coaching',
    FINANCIAL_PLANNING: '/services/financial-planning',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: '/products/:id',
    BLOG: '/blog',
    BLOG_POST: '/blog/:slug',
    CONTACT: '/contact',
    
    // Auth routes
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    
    // Booking routes
    BOOKING: '/booking',
    BOOKING_CONFIRMATION: '/booking/confirmation/:id',
    
    // Shopping routes
    CART: '/cart',
    CHECKOUT: '/checkout',
    ORDER_CONFIRMATION: '/order-confirmation/:id',
    
    // Account routes (protected)
    ACCOUNT: '/account',
    ACCOUNT_PROFILE: '/account/profile',
    ACCOUNT_ORDERS: '/account/orders',
    ACCOUNT_ORDER_DETAIL: '/account/orders/:id',
    ACCOUNT_BOOKINGS: '/account/bookings',
    ACCOUNT_DOWNLOADS: '/account/downloads',
    ACCOUNT_COMMUNITY: '/account/community',
    
    // Legal routes
    PRIVACY: '/privacy',
    TERMS: '/terms',
  };
  
  // Helper function to generate dynamic routes
  export const generateRoute = (route, params = {}) => {
    let path = route;
    Object.keys(params).forEach(key => {
      path = path.replace(`:${key}`, params[key]);
    });
    return path;
  };
  
  // Navigation items for different sections
  export const NAV_ITEMS = {
    main: [
      { label: 'Home', path: ROUTES.HOME },
      { label: 'About', path: ROUTES.ABOUT },
      { label: 'Services', path: ROUTES.SERVICES },
      { label: 'Products', path: ROUTES.PRODUCTS },
      { label: 'Blog', path: ROUTES.BLOG },
      { label: 'Contact', path: ROUTES.CONTACT },
    ],
    
    services: [
      { label: 'Credit Repair', path: ROUTES.CREDIT_REPAIR },
      { label: 'Credit Coaching', path: ROUTES.CREDIT_COACHING },
      { label: 'Financial Planning', path: ROUTES.FINANCIAL_PLANNING },
    ],
    
    account: [
      { label: 'Dashboard', path: ROUTES.ACCOUNT, icon: 'home' },
      { label: 'Profile', path: ROUTES.ACCOUNT_PROFILE, icon: 'user' },
      { label: 'Orders', path: ROUTES.ACCOUNT_ORDERS, icon: 'shopping-bag' },
      { label: 'Bookings', path: ROUTES.ACCOUNT_BOOKINGS, icon: 'calendar' },
      { label: 'Downloads', path: ROUTES.ACCOUNT_DOWNLOADS, icon: 'download' },
      { label: 'Community', path: ROUTES.ACCOUNT_COMMUNITY, icon: 'users' },
    ],
    
    footer: [
      { label: 'Privacy Policy', path: ROUTES.PRIVACY },
      { label: 'Terms of Service', path: ROUTES.TERMS },
    ],
  };