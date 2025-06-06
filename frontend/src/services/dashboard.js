// Dashboard service for fetching user dashboard data

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get user dashboard data
export const getUserDashboardData = async (userId) => {
  try {
    // For now, return mock data since backend might not be set up
    // In production, this would make an actual API call
    
    // TODO: Uncomment this when backend is ready:
    // const response = await axios.get(`${API_URL}/users/${userId}/dashboard`, {
    //   headers: {
    //     Authorization: `Bearer ${getAuthToken()}`
    //   }
    // });
    // return response.data;
    
    // Mock data for development
    // Using userId to avoid ESLint warning (will be used in actual API call)
    console.log(`Fetching dashboard data for user: ${userId}`);
    
    return {
      creditScore: 680,
      targetCreditScore: 750,
      creditGoals: ['improve_score', 'buy_home'],
      membershipStatus: 'basic',
      
      // Recent activity
      recentProducts: [
        {
          id: '1',
          title: 'Credit Repair Mastery Guide',
          purchasedAt: new Date().toISOString(),
          price: 47
        }
      ],
      
      // Bookings
      upcomingBookings: [
        {
          id: '1',
          serviceName: 'Credit Coaching Session',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 60
        }
      ],
      
      // Stats
      stats: {
        totalOrders: 3,
        completedCourses: 1,
        creditScoreIncrease: 45,
        daysActive: 30
      },
      
      // Progress
      creditJourneyProgress: 65,
      
      // Notifications
      notifications: [
        {
          id: '1',
          type: 'info',
          message: 'Your next coaching session is in 7 days',
          read: false
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

// Get user's recent activity
export const getUserActivity = async (userId) => {
  try {
    // Mock data for development
    console.log(`Fetching activity for user: ${userId}`);
    
    return {
      activities: [
        {
          id: '1',
          type: 'purchase',
          description: 'Purchased Credit Repair Mastery Guide',
          date: new Date().toISOString()
        },
        {
          id: '2',
          type: 'booking',
          description: 'Booked Credit Coaching Session',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching user activity:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    // In production:
    // const response = await axios.put(`${API_URL}/users/${userId}/profile`, profileData, {
    //   headers: {
    //     Authorization: `Bearer ${getAuthToken()}`
    //   }
    // });
    // return response.data;
    
    console.log(`Updating profile for user: ${userId}`, profileData);
    
    // Mock response
    return {
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...profileData,
        id: userId
      }
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Get user's orders
export const getUserOrders = async (userId) => {
  try {
    // Mock data
    console.log(`Fetching orders for user: ${userId}`);
    
    return {
      orders: [
        {
          id: '1',
          orderNumber: 'CG-2024-001',
          date: new Date().toISOString(),
          total: 47,
          status: 'completed',
          items: [
            {
              productId: '1',
              title: 'Credit Repair Mastery Guide',
              price: 47,
              type: 'ebook'
            }
          ]
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

// Get user's bookings
export const getUserBookings = async (userId) => {
  try {
    // Mock data
    console.log(`Fetching bookings for user: ${userId}`);
    
    return {
      bookings: [
        {
          id: '1',
          serviceId: '1',
          serviceName: 'Credit Coaching Session',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          status: 'scheduled',
          meetingLink: null
        }
      ]
    };
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Helper function to get auth token (implement based on your auth setup)
// Commented out until needed for actual API calls
// const getAuthToken = () => {
//   // This should get the token from your auth context or localStorage
//   return localStorage.getItem('authToken') || '';
// };