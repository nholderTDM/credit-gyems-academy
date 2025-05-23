import React from 'react';

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Community Forum</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Credit Gyems Community</h2>
          <p className="text-gray-600 mb-4">
            Connect with fellow members, share your credit journey, and get expert advice from our community.
          </p>
          <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-yellow-600">
            Start New Discussion
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Credit Repair</h3>
            <p className="text-gray-600 text-sm mb-4">Discussions about credit repair strategies and tips.</p>
            <div className="text-sm text-gray-500">0 discussions</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Credit Coaching</h3>
            <p className="text-gray-600 text-sm mb-4">Get guidance from our expert coaches.</p>
            <div className="text-sm text-gray-500">0 discussions</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-2">Success Stories</h3>
            <p className="text-gray-600 text-sm mb-4">Share your credit improvement success stories.</p>
            <div className="text-sm text-gray-500">0 discussions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;