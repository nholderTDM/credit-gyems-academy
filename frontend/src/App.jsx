import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layouts
import AccountLayout from './layouts/AccountLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages (Core)
import HomePage from './pages/Homepage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

// Booking
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';

// E-Commerce
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

// Legal
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import DisclaimerPage from './pages/DisclaimerPage';

// Services
import CreditRepairPage from './pages/services/CreditRepairPage';
import CreditCoachingPage from './pages/services/CreditCoachingPage';
import FinancialPlanningPage from './pages/services/FinancialPlanningPage';

// Account
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import ProfilePage from './pages/account/ProfilePage';
import OrdersPage from './pages/account/OrdersPage';
import OrderDetailPage from './pages/account/OrderDetailPage';
import BookingsPage from './pages/account/BookingsPage';
import DownloadsPage from './pages/account/DownloadsPage';
import CommunityPage from './pages/account/CommunityPage';
import MyOrdersPage from './pages/MyOrdersPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AccountPage from './pages/AccountPage';

// Community / Discussions
import DiscussionPage from './pages/DiscussionPage';
import DiscussionListPage from './pages/DiscussionListPage';
import DiscussionFormPage from './pages/DiscussionFormPage';
import NewDiscussionPage from './pages/NewDiscussionPage';

// Utility
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />

        <Route path="/services/credit-repair" element={<CreditRepairPage />} />
        <Route path="/services/credit-coaching" element={<CreditCoachingPage />} />
        <Route path="/services/financial-planning" element={<FinancialPlanningPage />} />

        <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
          <Route index element={<DashboardHomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="downloads" element={<DownloadsPage />} />
          <Route path="community" element={<CommunityPage />} />
        </Route>

        <Route path="/account-page" element={<AccountPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />

        <Route path="/discussions" element={<DiscussionListPage />} />
        <Route path="/discussions/:id" element={<DiscussionPage />} />
        <Route path="/discussions/new" element={<NewDiscussionPage />} />
        <Route path="/discussions/:id/edit" element={<DiscussionFormPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

export default App;