import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

// Validation schema
const ProfileSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    phone: Yup.string(),
    creditScore: Yup.number()
      .min(300, 'Score must be at least 300')
      .max(850, 'Score must be at most 850')
      .nullable(),
    targetCreditScore: Yup.number()
      .min(300, 'Target score must be at least 300')
      .max(850, 'Target score must be at most 850')
      .nullable(),
    creditGoals: Yup.array().of(Yup.string()),
    communicationPreferences: Yup.object().shape({
      productUpdates: Yup.boolean(),
      creditTips: Yup.boolean(),
      promotions: Yup.boolean()
    })
  });
  
const ProfilePage = () => {
  // Keep currentUser for future use in user profile management
  const { token, currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    creditScore: null,
    targetCreditScore: null,
    creditGoals: [],
    communicationPreferences: {
      productUpdates: true,
      creditTips: true,
      promotions: true
    }
  });
  
  // Will use currentUser in future implementation to pre-populate fields or check permissions
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        // Could use currentUser to validate or supplement API response data
        setUserData({
          firstName: response.data.user.firstName || '',
          lastName: response.data.user.lastName || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || '',
          creditScore: response.data.user.creditScore || null,
          targetCreditScore: response.data.user.targetCreditScore || null,
          creditGoals: response.data.user.creditGoals || [],
          communicationPreferences: response.data.user.communicationPreferences || {
            productUpdates: true,
            creditTips: true,
            promotions: true
          }
        });
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [token, currentUser]); // Include currentUser in dependencies for future changes

  
  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    if (!token) return;
    
    try {
      setError('');
      setSuccess(false);
      
      await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess(true);
      
      // Update local state
      setUserData(values);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">Your Profile</h2>
        <p className="text-slate-600">Manage your personal information and preferences</p>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
            Profile updated successfully!
          </div>
        )}
        
        <Formik
          initialValues={userData}
          validationSchema={ProfileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue, touched, errors }) => (
            <Form>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                      />
                      <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={userData.email}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-700"
                      disabled
                    />
                    <p className="text-sm text-slate-500 mt-1">Email address cannot be changed</p>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <Field
                      type="tel"
                      id="phone"
                      name="phone"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Credit Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="creditScore" className="block text-sm font-medium text-slate-700 mb-1">
                        Current Credit Score
                      </label>
                      <Field
                        type="number"
                        id="creditScore"
                        name="creditScore"
                        min="300"
                        max="850"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your current score (300-850)"
                      />
                      <ErrorMessage name="creditScore" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    
                    <div>
                      <label htmlFor="targetCreditScore" className="block text-sm font-medium text-slate-700 mb-1">
                        Target Credit Score
                      </label>
                      <Field
                        type="number"
                        id="targetCreditScore"
                        name="targetCreditScore"
                        min="300"
                        max="850"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your target score (300-850)"
                      />
                      <ErrorMessage name="targetCreditScore" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Credit Goals
                    </label>
                    
                    <div className="space-y-2">
                      {[
                        { value: 'improve_score', label: 'Improve Credit Score' },
                        { value: 'repair_credit', label: 'Credit Repair / Dispute Errors' },
                        { value: 'buy_home', label: 'Buy a Home' },
                        { value: 'refinance', label: 'Refinance Existing Loans' },
                        { value: 'debt_freedom', label: 'Achieve Debt Freedom' },
                        { value: 'build_credit', label: 'Build Credit History' }
                      ].map((goal) => (
                        <label key={goal.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={values.creditGoals.includes(goal.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFieldValue('creditGoals', [...values.creditGoals, goal.value]);
                              } else {
                                setFieldValue(
                                  'creditGoals',
                                  values.creditGoals.filter(value => value !== goal.value)
                                );
                              }
                            }}
                            className="h-5 w-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                          />
                          <span className="ml-2 text-slate-700">{goal.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Communication Preferences</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="communicationPreferences.productUpdates"
                        className="h-5 w-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                      />
                      <span className="ml-2 text-slate-700">Product Updates & New Releases</span>
                    </label>
                    
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="communicationPreferences.creditTips"
                        className="h-5 w-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                      />
                      <span className="ml-2 text-slate-700">Credit Tips & Educational Content</span>
                    </label>
                    
                    <label className="flex items-center">
                      <Field
                        type="checkbox"
                        name="communicationPreferences.promotions"
                        className="h-5 w-5 text-primary border-2 border-slate-300 rounded focus:ring-primary"
                      />
                      <span className="ml-2 text-slate-700">Special Offers & Promotions</span>
                    </label>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-primary-light text-slate-800 rounded-lg px-6 py-2 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : null}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ProfilePage;