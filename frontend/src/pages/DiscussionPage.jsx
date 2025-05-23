import React from 'react';
import { useParams } from 'react-router-dom';

const DiscussionPage = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <button className="text-primary hover:text-yellow-600 font-medium">
            ← Back to Community
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Discussion #{id || 'Loading...'}
          </h1>
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Posted by User Name</span>
            <span className="mx-2">•</span>
            <span>2 hours ago</span>
            <span className="mx-2">•</span>
            <span>Credit Repair</span>
          </div>

          <div className="prose max-w-none text-gray-700">
            <p>This is a placeholder for discussion ID: {id}. The actual discussion content will be loaded from the database.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Replies (0)</h3>
          <div className="text-center py-8 text-gray-500">
            No replies yet. Be the first to respond!
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Post a Reply</h3>
          <textarea 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            rows="4"
            placeholder="Share your thoughts or questions..."
          ></textarea>
          <div className="mt-4 flex justify-end">
            <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-yellow-600">
              Post Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionPage;