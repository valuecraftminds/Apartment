// pages/HouseOwnerDashboard.jsx
import React, { useState, useEffect, useContext } from 'react'
import { Home, Users, ArrowUpRight, Building2, Shield, Mail, Phone, Bell, User, ChevronRight, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';
import HouseOwnerSidebar from '../components/HouseOwnerSidebar';
import HouseOwnerNavbar from '../components/HouseOwnerNavbar';

export default function HouseOwnerDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [houseData, setHouseData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [bills, setBills] = useState([]);
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
    fetchHouseOwnerData();
  }, []);

  const fetchHouseOwnerData = async () => {
    try {
      if (auth.user?.apartment_id) {
        const res = await api.get(`/houses/owner/${auth.user.id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        setHouseData(res.data.data);
        
        // Simulate fetching notifications and bills
        setTimeout(() => {
          setNotifications([
            { id: 1, message: 'Maintenance scheduled for tomorrow', time: '2 hours ago', type: 'info' },
            { id: 2, message: 'Bill payment due in 3 days', time: '1 day ago', type: 'warning' },
            { id: 3, message: 'New community notice posted', time: '2 days ago', type: 'info' }
          ]);
          
          setBills([
            { id: 1, title: 'Maintenance Fee', amount: '$150', dueDate: '2024-01-15', status: 'paid' },
            { id: 2, title: 'Electricity Bill', amount: '$85', dueDate: '2024-01-20', status: 'pending' },
            { id: 3, title: 'Water Bill', amount: '$45', dueDate: '2024-01-18', status: 'paid' }
          ]);
        }, 1000);
      }
    } catch (err) {
      console.error('Failed to fetch house data:', err);
      setError('Failed to load house data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
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
            <div className='flex items-center bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6'>
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

            {error && (
              <div className="mb-4 md:mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                    <button 
                      onClick={fetchHouseOwnerData}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Stats Cards Grid - Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Profile Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300">Profile</h3>
                  <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <User size={mobileView ? 18 : 24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div>
                  <p className={`${mobileView ? 'text-lg' : 'text-2xl'} font-bold text-purple-600 dark:text-purple-400 truncate`}>
                    {auth.user?.name || 'House Owner'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {auth.user?.email}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail size={mobileView ? 14 : 16} className="text-gray-500 flex-shrink-0" />
                    <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300 truncate">
                      {auth.user?.email}
                    </span>
                  </div>
                  {auth.user?.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone size={mobileView ? 14 : 16} className="text-gray-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                        {auth.user.mobile}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Apartment Card */}
              {houseData && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300">My Apartment</h3>
                    <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Building2 size={mobileView ? 18 : 24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <p className={`${mobileView ? 'text-lg' : 'text-2xl'} font-bold text-purple-600 dark:text-purple-400`}>
                      {houseData.house_id || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {houseData.house_type || 'N/A'}
                    </p>
                  </div>
                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      houseData.status === 'occupied' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {houseData.status?.charAt(0).toUpperCase() + houseData.status?.slice(1)}
                    </span>
                  </div>
                </div>
              )}

              {/* Notifications Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300">Notifications</h3>
                  <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Bell size={mobileView ? 18 : 24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div>
                  <p className={`${mobileView ? 'text-xl' : 'text-3xl'} font-bold text-purple-600 dark:text-purple-400`}>
                    {notifications.length}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Unread notifications
                  </p>
                </div>
                <div className="flex items-center mt-4">
                  <ArrowUpRight size={mobileView ? 14 : 16} className="text-green-500 mr-1 flex-shrink-0" />
                  <span className="text-xs md:text-sm text-green-500">
                    Stay updated
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quick Actions - Mobile friendly */}
            <div className="mb-6 md:mb-8">
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
                <button className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 text-center border border-gray-200 dark:border-gray-700">
                  <DollarSign className="mx-auto text-purple-600 dark:text-purple-400 mb-2" size={mobileView ? 20 : 24} />
                  <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">Pay Bills</span>
                </button>
                <button className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 text-center border border-gray-200 dark:border-gray-700">
                  <Calendar className="mx-auto text-blue-600 dark:text-blue-400 mb-2" size={mobileView ? 20 : 24} />
                  <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">Maintenance</span>
                </button>
                <button className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 text-center border border-gray-200 dark:border-gray-700">
                  <Bell className="mx-auto text-green-600 dark:text-green-400 mb-2" size={mobileView ? 20 : 24} />
                  <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">Alerts</span>
                </button>
                <button className="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-lg shadow hover:shadow-md transition-all duration-200 text-center border border-gray-200 dark:border-gray-700">
                  <User className="mx-auto text-orange-600 dark:text-orange-400 mb-2" size={mobileView ? 20 : 24} />
                  <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200">Profile</span>
                </button>
              </div>
            </div>

            {/* Apartment Details Section */}
            {houseData && (
              <div className="mt-6 md:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200 mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Apartment Details</h3>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      House Number
                    </label>
                    <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                      {houseData.house_id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      House Type
                    </label>
                    <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                      {houseData.house_type || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Floor
                    </label>
                    <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                      {houseData.floor_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      houseData.status === 'occupied' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {houseData.status?.charAt(0).toUpperCase() + houseData.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Bills Overview - Mobile friendly */}
            {bills.length > 0 && (
              <div className="mt-6 md:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200 mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Bills Overview</h3>
                  <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {bills.slice(0, mobileView ? 2 : 3).map((bill) => (
                    <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-3">
                          <DollarSign size={mobileView ? 14 : 16} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{bill.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Due: {bill.dueDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{bill.amount}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(bill.status)}`}>
                          {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Section - Mobile optimized */}
            <div className="mt-6 md:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                  Recent Notifications
                </h3>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                  View all
                </button>
              </div>
              
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start">
                        <div className={`p-2 rounded-full mr-3 flex-shrink-0 ${
                          notification.type === 'warning' 
                            ? 'bg-yellow-100 dark:bg-yellow-900/30' 
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {notification.type === 'warning' ? (
                            <AlertCircle size={mobileView ? 14 : 16} className="text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <Bell size={mobileView ? 14 : 16} className="text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <Bell size={mobileView ? 36 : 48} className="mx-auto text-gray-400 dark:text-gray-500 mb-3 md:mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Notifications will appear here
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Footer Spacer */}
            {mobileView && <div className="h-16"></div>}
          </div>
        </div>
      </div>
    </div>
  );
}