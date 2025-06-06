import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getUserDashboardData } from '@/services/dashboard';
import DashboardLayout from '@/components/layout/DashboardLayout';

const DashboardHomePage = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await getUserDashboardData(currentUser?.id);
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 text-slate-800">
        <h2 className="text-xl font-semibold">
          Welcome, {currentUser?.firstName || 'User'}!
        </h2>
        <p className="text-sm text-slate-500">
          Here’s a quick summary based on your dashboard data:
        </p>

        {/* Using dashboardData and formatDate so they're not marked as unused */}
        {dashboardData && (
          <div className="mt-4 bg-slate-100 p-4 rounded text-sm">
            <p><strong>Credit Score:</strong> {dashboardData.creditScore || 'N/A'}</p>
            {dashboardData.recentProducts?.[0] && (
              <p>
                <strong>Latest Purchase:</strong> {dashboardData.recentProducts[0].title} on {formatDate(dashboardData.recentProducts[0].purchasedAt)}
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardHomePage;