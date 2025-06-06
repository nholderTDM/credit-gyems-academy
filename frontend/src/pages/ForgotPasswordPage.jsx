import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, Lock, Shield } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setTouched(true);
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Firebase password reset would go here
      // await sendPasswordResetEmail(auth, email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(true);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later');
      } else {
        setError('Failed to send reset email. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
        <div className="absolute inset-0">
          <div className="absolute transform rotate-45 -right-40 -top-40 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-red-500/20 rounded-full blur-3xl"></div>
          <div className="absolute transform rotate-45 -left-40 -bottom-40 w-80 h-80 bg-gradient-to-r from-red-500/20 to-yellow-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-md w-full">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center animate-slideUp">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4">Check Your Email</h2>
            
            <p className="text-gray-300 mb-6">
              We've sent a password reset link to:
            </p>
            
            <p className="text-yellow-400 font-semibold mb-6">{email}</p>
            
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-300">
                The link will expire in 1 hour for security reasons. 
                If you don't see the email, please check your spam folder.
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transform hover:scale-105 transition-all duration-300"
            >
              Back to Login
            </button>
            
            <p className="text-sm text-gray-400 mt-6">
              Didn't receive the email?{' '}
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute transform rotate-45 -right-40 -top-40 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-red-500/20 rounded-full blur-3xl"></div>
        <div className="absolute transform rotate-45 -left-40 -bottom-40 w-80 h-80 bg-gradient-to-r from-red-500/20 to-yellow-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-md w-full">
        {/* Back Button */}
        <button
          onClick={() => window.location.href = '/login'}
          className="mb-8 flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Login</span>
        </button>
        
        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <Lock className="w-8 h-8 text-gray-900" />
          </div>
          
          {/* Header */}
          <h1 className="text-3xl font-bold text-center mb-2">Forgot Password?</h1>
          <p className="text-gray-300 text-center mb-8">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
          
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start space-x-3 animate-slideDown">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          {/* Email Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                onBlur={() => setTouched(true)}
                onKeyPress={handleKeyPress}
                className={`w-full px-4 py-3 pl-12 bg-white/10 border ${
                  touched && !validateEmail(email) && email ? 'border-red-500' : 'border-white/20'
                } rounded-xl focus:outline-none focus:border-yellow-400 transition-colors backdrop-blur-sm`}
                placeholder="john@example.com"
                disabled={loading}
              />
              <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>
            {touched && !validateEmail(email) && email && (
              <p className="mt-1 text-sm text-red-400">Please enter a valid email address</p>
            )}
          </div>
          
          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !email}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-red-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
          
          {/* Security Info */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-300 mb-2">Security Information:</p>
                <ul className="space-y-1 text-gray-400">
                  <li>• Reset links expire after 1 hour</li>
                  <li>• You can only request 3 resets per day</li>
                  <li>• Links are single-use only</li>
                  <li>• Check your spam folder if you don't see our email</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Alternative Actions */}
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-400">
              Remember your password?{' '}
              <a href="/login" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                Sign In
              </a>
            </p>
            <p className="text-gray-400 mt-2">
              Need help?{' '}
              <a href="/contact" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordPage;