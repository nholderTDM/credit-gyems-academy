import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/useCart';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Payment Form Component
const PaymentForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  
  const stripe = useStripe();
  const elements = useElements();
  const { currentUser, token } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  // Get payment intent from the server
  useEffect(() => {
    const getPaymentIntent = async () => {
      if (items.length === 0) return;
      
      try {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/orders/payment-intent`,
          { 
            cartItems: items,
            paymentMethod
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setClientSecret(response.data.data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
        setError('Could not initialize payment. Please try again.');
      }
    };
    
    getPaymentIntent();
  }, [items, token, paymentMethod]);
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Payment form not properly loaded. Please refresh and try again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Confirm payment
      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${currentUser?.firstName} ${currentUser?.lastName}`,
              email: currentUser?.email
            }
          }
        }
      );
      
      if (paymentError) {
        setError(paymentError.message || 'Payment failed. Please try again.');
      } else if (paymentIntent?.status === 'succeeded') {
        clearCart();
        navigate(`/orders/${paymentIntent.id}`);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="mb-6">
        <div className="flex flex-col space-y-2 mb-4">
          <label className="font-medium text-slate-700">Payment Method</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              className={`border rounded-lg p-4 cursor-pointer flex items-center ${
                paymentMethod === 'credit_card' 
                  ? 'border-primary bg-primary-light/10' 
                  : 'border-slate-200 hover:border-primary-light'
              }`}
              onClick={() => setPaymentMethod('credit_card')}
            >
              <input 
                type="radio" 
                name="paymentMethod" 
                value="credit_card"
                checked={paymentMethod === 'credit_card'}
                onChange={() => setPaymentMethod('credit_card')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Credit Card</div>
                <div className="text-sm text-slate-500">Pay with Visa, Mastercard, etc.</div>
              </div>
            </div>
            
            <div 
              className={`border rounded-lg p-4 cursor-pointer flex items-center ${
                paymentMethod === 'klarna' 
                  ? 'border-primary bg-primary-light/10' 
                  : 'border-slate-200 hover:border-primary-light'
              }`}
              onClick={() => setPaymentMethod('klarna')}
            >
              <input 
                type="radio" 
                name="paymentMethod" 
                value="klarna"
                checked={paymentMethod === 'klarna'}
                onChange={() => setPaymentMethod('klarna')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">Klarna</div>
                <div className="text-sm text-slate-500">Pay over time</div>
              </div>
            </div>
            
            <div 
              className={`border rounded-lg p-4 cursor-pointer flex items-center ${
                paymentMethod === 'afterpay' 
                  ? 'border-primary bg-primary-light/10' 
                  : 'border-slate-200 hover:border-primary-light'
              }`}
              onClick={() => setPaymentMethod('afterpay')}
            >
              <input 
                type="radio" 
                name="paymentMethod" 
                value="afterpay"
                checked={paymentMethod === 'afterpay'}
                onChange={() => setPaymentMethod('afterpay')}
                className="mr-3"
              />
              <div>
                <div className="font-medium">AfterPay</div>
                <div className="text-sm text-slate-500">Buy now, pay later</div>
              </div>
            </div>
          </div>
        </div>
        
        {paymentMethod === 'credit_card' && (
          <div className="border rounded-lg p-4">
            <label className="font-medium text-slate-700 block mb-2">Card Details</label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-red-600 text-sm">
            {error}
          </div>
        )}
      </div>
      
      <div className="border-t border-slate-200 pt-4 mt-6">
        <button
          type="submit"
          disabled={!stripe || loading || items.length === 0}
          className="w-full bg-gradient-to-r from-primary to-primary-light text-slate-800 font-semibold rounded-full py-3 shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? (
            <div className="h-6 w-6 border-2 border-slate-800 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            `Pay $${subtotal.toFixed(2)}`
          )}
        </button>
        
        <p className="mt-4 text-center text-sm text-slate-500">
          Your payment is secure. We don't store your card details.
        </p>
      </div>
    </form>
  );
};

const CheckoutPage = () => {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const navigate = useNavigate();
  
  // If cart is empty, redirect to products page
  useEffect(() => {
    if (items.length === 0) {
      navigate('/products');
    }
  }, [items, navigate]);
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="py-20 flex-grow">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-slate-800">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-slate-800">Your Cart</h2>
                  
                  {items.length === 0 ? (
                    <p className="text-slate-600">Your cart is empty.</p>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {items.map((item) => (
                        <div key={item.productId} className="py-4 flex items-center">
                          <div className="w-20 h-20 rounded-lg overflow-hidden mr-4">
                            <img
                              src={item.image || '/placeholder.jpg'}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="font-medium text-slate-800">{item.title}</h3>
                            <div className="text-primary font-medium">${item.price.toFixed(2)}</div>
                          </div>
                          
                          <div className="flex items-center">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1 rounded-full hover:bg-slate-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            
                            <span className="mx-3 min-w-[30px] text-center">{item.quantity}</span>
                            
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 rounded-full hover:bg-slate-100"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                            
                            <button
                              onClick={() => removeItem(item.productId)}
                              className="ml-4 p-1 rounded-full hover:bg-slate-100 text-red-500"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 sticky top-24">
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4 text-slate-800">Order Summary</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium text-slate-800">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="pt-3 border-t border-slate-200">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-xl text-primary">${subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Elements stripe={stripePromise}>
                    <PaymentForm />
                  </Elements>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;