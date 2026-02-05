// pages/HouseOwnerDashboard.jsx
import React, { useState, useEffect, useContext } from 'react'
import { Home, Users, ArrowUpRight, Building2, Shield, Mail, Phone, Bell, User, ChevronRight, AlertCircle, Calendar, DollarSign, FileText, Clock, CheckCircle, Plus } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';
import HouseOwnerSidebar from '../components/HouseOwnerSidebar';
import HouseOwnerNavbar from '../components/HouseOwnerNavbar';

export default function HouseOwnerDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [complaintStats, setComplaintStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [mobileView, setMobileView] = useState(false);
  const { auth } = useContext(AuthContext);

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setMobileView(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [auth.accessToken]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch complaint statistics
      await fetchComplaintStats();
      
      // Fetch recent complaints
      // await fetchRecentComplaints();
      
      // Simulate fetching notifications
      setNotifications([
        { id: 1, message: 'Maintenance scheduled for tomorrow', time: '2 hours ago', type: 'info' },
        { id: 2, message: 'New community notice posted', time: '1 day ago', type: 'info' }
      ]);
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintStats = async () => {
    try {
      if (auth.accessToken) {
        const res = await api.get('/complaints/my-complaints', {
          headers: { 
            Authorization: `Bearer ${auth.accessToken}`
          }
        });
        
        if (res.data.success) {
          // If the API returns statistics
          if (res.data.statistics) {
            setComplaintStats({
              total: res.data.statistics.total || 0,
              pending: res.data.statistics.pending || 0,
              resolved: res.data.statistics.resolved || 0
            });
          } else {
            // Calculate from data
            const complaints = res.data.data || [];
            const total = complaints.length;
            const pending = complaints.filter(c => c.status === 'Pending').length;
            const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
            
            setComplaintStats({
              total,
              pending,
              resolved
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch complaint stats:', err);
      // Don't show error for stats
    }
  };

  // const fetchRecentComplaints = async () => {
  //   try {
  //     if (auth.accessToken) {
  //       const res = await api.get('/complaints/recent', {
  //         headers: { 
  //           Authorization: `Bearer ${auth.accessToken}`
  //         }
  //       });
        
  //       if (res.data.success) {
  //         setRecentComplaints(res.data.data || []);
  //       }
  //     }
  //   } catch (err) {
  //     console.error('Failed to fetch recent complaints:', err);
  //     // Don't show error for recent complaints
  //   }
  // };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleViewComplaints = () => {
    window.location.href = '/complaints';
  };

  const handleCreateComplaint = () => {
    window.location.href = '/complaints';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
        <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? (mobileView ? 'ml-0' : 'ml-20') : (mobileView ? 'ml-0' : 'ml-64')
        }`}>
          <HouseOwnerNavbar />
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading Dashboard...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
      
      {/* Main Content Area - Dynamic margin based on sidebar state */}
      <div 
      className={`
        flex-1 flex flex-col overflow-hidden 
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} 
        w-full transition-all duration-300
      `}>
        {/* Navbar */}
        <HouseOwnerNavbar />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6'>
              <div className='flex items-center'>
                <Home size={mobileView ? 32 : 40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                <div>
                  <h1 className={`${mobileView ? 'text-xl' : 'text-2xl'} font-bold text-gray-800 dark:text-white`}>
                    House Owner Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Welcome back, {auth.user?.name || 'House Owner'}!
                  </p>
                </div>
              </div>
              {/* header New Complaint button removed per request */}
            </div>

            {error && (
              <div className="mb-4 md:mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                    <button 
                      onClick={fetchDashboardData}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats Cards Grid - Mobile: 1 column, Tablet: 2 columns, Desktop: 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Total Complaints Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300">Total Complaints</h3>
                  <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <FileText size={mobileView ? 18 : 24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <p className={`${mobileView ? 'text-2xl' : 'text-3xl'} font-bold text-purple-600 dark:text-purple-400`}>
                    {complaintStats.total}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    All time complaints
                  </p>
                </div>
              </div>
              
              {/* Pending Complaints Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300">Pending</h3>
                  <div className="p-2 md:p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <Clock size={mobileView ? 18 : 24} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div>
                  <p className={`${mobileView ? 'text-2xl' : 'text-3xl'} font-bold text-yellow-600 dark:text-yellow-400`}>
                    {complaintStats.pending}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Awaiting resolution
                  </p>
                </div>
              </div>

              {/* Resolved Complaints Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300">Resolved</h3>
                  <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle size={mobileView ? 18 : 24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <p className={`${mobileView ? 'text-2xl' : 'text-3xl'} font-bold text-green-600 dark:text-green-400`}>
                    {complaintStats.resolved}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Issues fixed
                  </p>
                </div>
              </div>

              {/* Notifications card removed per request */}
            </div>
            
            {/* Quick Actions - Mobile friendly */}
            {/* <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <button 
                  onClick={handleCreateComplaint}
                  className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 text-center border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500"
                >
                  <Plus className="mx-auto text-purple-600 dark:text-purple-400 mb-2" size={mobileView ? 20 : 24} />
                  <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">New Complaint</span>
                </button>
                <button 
                  onClick={handleViewComplaints}
                  className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 text-center border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                >
                  <FileText className="mx-auto text-blue-600 dark:text-blue-400 mb-2" size={mobileView ? 20 : 24} />
                  <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">View Complaints</span>
                </button>
                <button 
                  onClick={() => window.location.href = '/profile'}
                  className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 text-center border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500"
                >
                  <User className="mx-auto text-green-600 dark:text-green-400 mb-2" size={mobileView ? 20 : 24} />
                  <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">Profile</span>
                </button>
              </div>
            </div> */}

            {/* Mobile Footer Spacer */}
            {mobileView && <div className="h-16"></div>}
          </div>
        </div>
      </div>
    </div>
  );
}