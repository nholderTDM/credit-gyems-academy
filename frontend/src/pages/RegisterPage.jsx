import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Validation schema
const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

const RegisterPage = () => {
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      await register(values.email, values.password, values.firstName, values.lastName);
      navigate('/account');
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Failed to create account';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-slate-100">
            <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Create Your Account
            </h1>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                agreeToTerms: false
              }}
              validationSchema={RegisterSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, touched, errors }) => (
                <Form>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
                        First Name *
                      </label>
                      <Field
                        type="text"
                        id="firstName"
                        name="firstName"
                        className={`w-full px-4 py-2 border ${
                          touched.firstName && errors.firstName ? 'border-red-500' : 'border-slate-300'
                        } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                        placeholder="First Name"
                      />
                      <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
                        Last Name *
                      </label>
                      <Field
                        type="text"
                        id="lastName"
                        name="lastName"
                        className={`w-full px-4 py-2 border ${
                          touched.lastName && errors.lastName ? 'border-red-500' : 'border-slate-300'
                        } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                        placeholder="Last Name"
                      />
                      <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={`w-full px-4 py-2 border ${
                        touched.email && errors.email ? 'border-red-500' : 'border-slate-300'
                      } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                      placeholder="you@example.com"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                      Password *
                    </label>
                    <Field
                      type="password"
                      id="password"
                      name="password"
                      className={`w-full px-4 py-2 border ${
                        touched.password && errors.password ? 'border-red-500' : 'border-slate-300'
                      } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                      placeholder="Create a strong password"
                    />
                    <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <Field
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`w-full px-4 py-2 border ${
                        touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                      } rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent`}
                      placeholder="Confirm your password"
                    />
                    <ErrorMessage name="confirmPassword" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <div className="mb-6">
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="agreeToTerms"
                        className={`h-5 w-5 text-primary border-2 ${
                          touched.agreeToTerms && errors.agreeToTerms ? 'border-red-500' : 'border-slate-300'
                        } rounded focus:ring-primary`}
                      />
                      <span className="ml-2 text-sm text-slate-600">
                        I agree to the{' '}
                        <Link to="/terms-of-service" className="text-primary">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy-policy" className="text-primary">
                          Privacy Policy
                        </Link>
                      </span>
                    </label>
                    <ErrorMessage name="agreeToTerms" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-primary to-primary-light text-slate-800 rounded-lg py-3 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex justify-center"
                  >
                    {isSubmitting ? (
                      <div className="h-6 w-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </Form>
              )}
            </Formik>
            
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-medium hover:text-primary-dark">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;