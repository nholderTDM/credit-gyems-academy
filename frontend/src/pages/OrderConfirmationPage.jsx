import React from 'react';

const OrderConfirmationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Order Confirmation</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Your Order!</h2>
            <p className="text-gray-600">Your order has been confirmed and is being processed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;