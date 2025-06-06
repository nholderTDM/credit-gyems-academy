import React, { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const AuthLayout = ({ variant = 'default' }) => {
  const location = useLocation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Use location to track route changes (prevents linter error)
  useEffect(() => {
    console.log('User navigated to:', location.pathname);
  }, [location]);

  useEffect(() => {
    if (variant === 'gradient') {
      const handleMouseMove = (e) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [variant]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content: 'Credit Gyems helped me increase my score by 127 points in just 3 months!',
      rating: 5
    },
    {
      id: 2,
      name: 'Marcus Williams',
      role: 'Real Estate Investor',
      content: 'The personalized coaching was exactly what I needed to qualify for my investment property.',
      rating: 5
    },
    {
      id: 3,
      name: 'Emily Chen',
      role: 'Healthcare Professional',
      content: 'Finally got approved for my dream car loan thanks to their credit repair strategies!',
      rating: 5
    }
  ];

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Secure & Confidential',
      description: 'Your data is protected with bank-level encryption'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Fast Results',
      description: 'See improvements in as little as 30 days'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Expert Support',
      description: 'Dedicated credit specialists ready to help'
    }
  ];

  const backgroundStyles = {
    default: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-blue-900 via-blue-950 to-black',
    split: 'bg-white lg:bg-gray-50',
    minimal: 'bg-white'
  };

  return (
    <div className={`min-h-screen ${backgroundStyles[variant]} relative overflow-hidden`}>
      {variant === 'gradient' && (
        <>
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 215, 0, 0.15), transparent 80%)`
            }}
          />
          <div className="absolute top-20 left-20 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float-delayed" />
        </>
      )}

      <div className="relative z-10 flex min-h-screen">
        {/* LEFT PANEL */}
        <div className={`${variant === 'minimal' ? 'hidden' : 'hidden lg:flex'} lg:w-1/2 xl:w-5/12 flex-col justify-between p-12 ${variant === 'gradient' ? 'text-white' : 'bg-gradient-to-br from-blue-900 to-blue-950 text-white'}`}>
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">CG</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Credit Gyems</h1>
              <p className="text-sm opacity-80">Academy</p>
            </div>
          </Link>

          {/* HEADLINE + FEATURES */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold">
              Transform Your{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
                Credit Journey
              </span>
            </h2>
            <p className="text-lg opacity-90">
              Join thousands who've improved their credit scores and achieved their financial dreams.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-white/20 flex items-center justify-center rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold">{feature.title}</h4>
                    <p className="text-sm opacity-80">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur p-4 rounded-xl mt-6">
              <p className="italic text-sm">"{testimonials[currentTestimonial].content}"</p>
              <p className="text-xs mt-2">
                — <strong>{testimonials[currentTestimonial].name}</strong>, {testimonials[currentTestimonial].role}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className={`${variant === 'minimal' ? 'lg:w-full' : 'lg:w-1/2 xl:w-7/12'} w-full flex items-center justify-center p-8 lg:p-12`}>
          <div className="w-full max-w-md">
            <div className={`${variant === 'minimal' ? 'block' : 'block lg:hidden'} mb-8 text-center`}>
              <Link to="/" className="inline-flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">CG</span>
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-gray-900">Credit Gyems</h1>
                  <p className="text-sm text-gray-500">Academy</p>
                </div>
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10">
              <Outlet />
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
              <p>
                Need help?{' '}
                <Link to="/contact" className="text-yellow-500 hover:text-yellow-600 font-medium">
                  Contact Support
                </Link>
              </p>
              <div className="mt-4 flex items-center justify-center space-x-4">
                <Link to="/privacy" className="hover:text-gray-900">Privacy</Link>
                <span className="text-gray-300">•</span>
                <Link to="/terms" className="hover:text-gray-900">Terms</Link>
                <span className="text-gray-300">•</span>
                <Link to="/" className="hover:text-gray-900">Home</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-30px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

AuthLayout.propTypes = {
  variant: PropTypes.oneOf(['default', 'gradient', 'split', 'minimal'])
};

export default AuthLayout;