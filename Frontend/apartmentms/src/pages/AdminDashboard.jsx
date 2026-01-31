// import React, { useState, useEffect } from 'react'
// import Navbar from '../components/Navbar'
// import Sidebar from '../components/sidebar'
// import { 
//   Home, Users, Activity, Calendar, ArrowUpRight, ArrowDownRight, 
//   Building2, Shield, UserPlus, Key, Mail, UserCheck, UserX, 
//   Edit, Trash2, Smartphone, Laptop, RefreshCw, AlertCircle
// } from 'lucide-react';
// import api from '../api/axios';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

// export default function AdminDashboard() {
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const navigate = useNavigate();

//   // State for real data
//   const [apartments, setApartments] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // Check mobile screen
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
    
//     checkMobile();
//     window.addEventListener('resize', checkMobile);
    
//     return () => window.removeEventListener('resize', checkMobile);
//   }, []);

//   // Activity types with icons and colors
//   const activityTypes = {
//     USER_REGISTERED: { 
//       icon: UserPlus, 
//       color: 'text-green-600', 
//       bgColor: 'bg-green-100 dark:bg-green-900/30',
//       trend: 'up'
//     },
//     USER_UPDATED: { 
//       icon: Edit, 
//       color: 'text-blue-600', 
//       bgColor: 'bg-blue-100 dark:bg-blue-900/30',
//       trend: 'up'
//     },
//     USER_DELETED: { 
//       icon: Trash2, 
//       color: 'text-red-600', 
//       bgColor: 'bg-red-100 dark:bg-red-900/30',
//       trend: 'down'
//     },
//     USER_VERIFIED: { 
//       icon: UserCheck, 
//       color: 'text-green-600', 
//       bgColor: 'bg-green-100 dark:bg-green-900/30',
//       trend: 'up'
//     },
//     USER_DEACTIVATED: { 
//       icon: UserX, 
//       color: 'text-red-600', 
//       bgColor: 'bg-red-100 dark:bg-red-900/30',
//       trend: 'down'
//     },
//     APARTMENT_CREATED: { 
//       icon: Building2, 
//       color: 'text-purple-600', 
//       bgColor: 'bg-purple-100 dark:bg-purple-900/30',
//       trend: 'up'
//     },
//     APARTMENT_UPDATED: { 
//       icon: Building2, 
//       color: 'text-blue-600', 
//       bgColor: 'bg-blue-100 dark:bg-blue-900/30',
//       trend: 'up'
//     },
//     APARTMENT_DELETED: { 
//       icon: Building2, 
//       color: 'text-red-600', 
//       bgColor: 'bg-red-100 dark:bg-red-900/30',
//       trend: 'down'
//     },
//     PASSWORD_RESET: { 
//       icon: Key, 
//       color: 'text-orange-600', 
//       bgColor: 'bg-orange-100 dark:bg-orange-900/30',
//       trend: 'up'
//     },
//     EMAIL_SENT: { 
//       icon: Mail, 
//       color: 'text-indigo-600', 
//       bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
//       trend: 'up'
//     }
//   };

//   // Generate activity message based on type and data
//   const generateActivityMessage = (type, data) => {
//     const messages = {
//       USER_REGISTERED: `New user: ${data.email || 'Unknown'}`,
//       USER_UPDATED: `User updated: ${data.email || 'Unknown'}`,
//       USER_DELETED: `User deleted: ${data.email || 'Unknown'}`,
//       USER_VERIFIED: `User verified: ${data.email || 'Unknown'}`,
//       USER_DEACTIVATED: `User deactivated: ${data.email || 'Unknown'}`,
//       APARTMENT_CREATED: `New apartment: ${data.name || 'Unknown'}`,
//       APARTMENT_UPDATED: `Apartment updated: ${data.name || 'Unknown'}`,
//       APARTMENT_DELETED: `Apartment deleted: ${data.name || 'Unknown'}`,
//       PASSWORD_RESET: `Password reset: ${data.email || 'Unknown'}`,
//       EMAIL_SENT: `Email sent: ${data.email || 'Unknown'}`
//     };
//     return messages[type] || 'Activity recorded';
//   };

//   // Add new activity to the recent activities list
//   const addActivity = (type, data) => {
//     const activity = {
//       id: Date.now(),
//       type,
//       action: generateActivityMessage(type, data),
//       time: 'Just now',
//       timestamp: new Date(),
//       ...activityTypes[type]
//     };

//     setRecentActivities(prev => [activity, ...prev.slice(0, 7)]); // Keep only last 8 activities
//   };

//   // Format time ago for mobile (shorter)
//   const formatTimeAgo = (timestamp, isMobile = false) => {
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    
//     if (isMobile) {
//       if (diffInSeconds < 60) return 'Now';
//       if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
//       if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
//       return `${Math.floor(diffInSeconds / 86400)}d`;
//     }
    
//     if (diffInSeconds < 60) return 'Just now';
//     if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
//     if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
//     return `${Math.floor(diffInSeconds / 86400)} days ago`;
//   };

//   // Update activity times periodically
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setRecentActivities(prev => 
//         prev.map(activity => ({
//           ...activity,
//           time: formatTimeAgo(activity.timestamp, isMobile)
//         }))
//       );
//     }, 60000);

//     return () => clearInterval(interval);
//   }, [isMobile]);

//   // Load apartments
//   const loadApartments = async () => {
//     try {
//       const result = await api.get('/apartments');

//       if (result.data.success && Array.isArray(result.data.data)) {
//         setApartments(result.data.data);
        
//         if (result.data.data.length > 0) {
//           addActivity('APARTMENT_CREATED', { 
//             name: `${result.data.data.length} apartments` 
//           });
//         }
//       } else if (Array.isArray(result.data)) {
//         setApartments(result.data);
//       } else {
//         setApartments([]);
//       }
//     } catch (err) {
//       console.error('Error loading apartments:', err);
//       if (err.response?.status === 401) {
//         setError('Unauthorized. Please login.');
//         navigate('/login');
//       } else if (err.response?.status === 400) {
//         setError('Company info missing.');
//       } else {
//         setError('Failed to load apartments.');
//       }
//     }
//   };

//   // Load users
//   const loadUsers = async () => {
//     try {
//       const result = await api.get('/auth/users');

//       if (result.data.success && Array.isArray(result.data.data)) {
//         const usersData = result.data.data;
//         setUsers(usersData);
        
//         if (usersData.length > 0) {
//           addActivity('USER_REGISTERED', { 
//             email: `${usersData.length} users` 
//           });
//         }
//       } else {
//         setUsers([]);
//       }
//     } catch (err) {
//       console.error('Error in fetching users:', err);
//       setError('Failed to load users.');
//     }
//   };

//   // Load roles
//   const loadRoles = async () => {
//     try {
//       const result = await api.get('/roles');
//       if (result.data.success && Array.isArray(result.data.data)) {
//         setRoles(result.data.data);
//       } else {
//         setRoles([]);
//       }
//     } catch (err) {
//       console.error('Error loading roles:', err);
//     }
//   };

//   // Load recent activities from localStorage
//   const loadRecentActivities = () => {
//     try {
//       const savedActivities = localStorage.getItem('recentActivities');
//       if (savedActivities) {
//         const activities = JSON.parse(savedActivities);
//         const updatedActivities = activities.map(activity => ({
//           ...activity,
//           time: formatTimeAgo(activity.timestamp, isMobile),
//           ...activityTypes[activity.type]
//         }));
//         setRecentActivities(updatedActivities.slice(0, 8));
//       }
//     } catch (err) {
//       console.error('Error loading recent activities:', err);
//     }
//   };

//   // Save recent activities to localStorage
//   useEffect(() => {
//     if (recentActivities.length > 0) {
//       localStorage.setItem('recentActivities', JSON.stringify(recentActivities.slice(0, 20)));
//     }
//   }, [recentActivities]);

//   // Load all data
//   const loadAllData = async (showToast = false) => {
//     try {
//       setRefreshing(true);
//       setError(null);
      
//       // Load saved activities first
//       loadRecentActivities();
      
//       // Load all data
//       await Promise.all([
//         loadApartments(),
//         loadUsers(),
//         loadRoles()
//       ]);
      
//       if (showToast) {
//         toast.success('Dashboard refreshed successfully');
//       }
      
//     } catch (err) {
//       console.error('Error loading dashboard data:', err);
//       setError('Failed to load dashboard data');
//       toast.error('Failed to refresh dashboard');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Simulate real-time activities
//   useEffect(() => {
//     if (!loading) {
//       const demoActivities = [
//         { type: 'USER_REGISTERED', data: { email: 'demo@example.com' } },
//         { type: 'APARTMENT_CREATED', data: { name: 'Demo Apartment' } },
//         { type: 'EMAIL_SENT', data: { email: 'user@example.com' } }
//       ];

//       demoActivities.forEach((activity, index) => {
//         setTimeout(() => {
//           addActivity(activity.type, activity.data);
//         }, (index + 1) * 5000);
//       });
//     }
//   }, [loading]);

//   useEffect(() => {
//     loadAllData();
//   }, []);

//   // Calculate statistics
//   const totalUsers = users.length;
//   const totalApartments = apartments.length;
//   const totalRoles = roles.length;
  
//   const activeUsers = users.filter(user => user.is_active).length;
//   const verifiedUsers = users.filter(user => user.is_verified).length;
//   const activeApartments = apartments.filter(apt => apt.is_active).length;

//   // Format numbers with commas
//   const formatNumber = (num) => {
//     return num.toLocaleString('en-US');
//   };

//   // Clear all activities
//   const clearActivities = () => {
//     setRecentActivities([]);
//     localStorage.removeItem('recentActivities');
//     toast.success('Activities cleared');
//   };

//   // Refresh handler
//   const handleRefresh = () => {
//     loadAllData(true);
//   };

//   // Loading state
//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
//         <Sidebar onCollapse={setIsSidebarCollapsed} />
//         <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
//           isSidebarCollapsed ? 'ml-16 lg:ml-20' : 'ml-0 lg:ml-64'
//         }`}>
//           <Navbar />
//           <div className="flex-1 overflow-y-auto p-4 lg:p-6">
//             <div className="max-w-7xl mx-auto">
//               {/* Mobile-friendly loading */}
//               <div className="flex flex-col items-center justify-center h-64 space-y-4">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
//                 <div className="text-center">
//                   <p className="text-gray-600 dark:text-gray-300 font-medium">Loading Dashboard...</p>
//                   <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     {isMobile ? 'Please wait' : 'Fetching latest data'}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
//       {/* Sidebar */}
//       <Sidebar onCollapse={setIsSidebarCollapsed} />
      
//       {/* Main Content Area - Responsive margins */}
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
//         isSidebarCollapsed ? 'ml-16 lg:ml-20' : 'ml-0 lg:ml-64'
//       }`}>
//         {/* Navbar */}
//         <Navbar />
        
//         {/* Page Content */}
//         <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
//           <div className="max-w-7xl mx-auto">
//             {/* Header - Mobile Optimized */}
//             <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6 shadow-sm">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                 <div className="flex items-center">
//                   <Home size={isMobile ? 28 : 32} className="text-purple-600 dark:text-purple-400 mr-2 md:mr-3" />
//                   <div>
//                     <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
//                       Admin Dashboard
//                     </h1>
//                     {/* <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
//                       {isMobile ? (
//                         <span className="flex items-center">
//                           <Smartphone size={12} className="mr-1" /> Mobile view
//                         </span>
//                       ) : (
//                         <span className="flex items-center">
//                           <Laptop size={14} className="mr-1" /> Desktop view
//                         </span>
//                       )}
//                     </p> */}
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                     className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs md:text-sm disabled:opacity-50"
//                   >
//                     <RefreshCw size={isMobile ? 14 : 16} className={refreshing ? 'animate-spin' : ''} />
//                     <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
//                   </button>
                  
//                   {isMobile && (
//                     <div className="text-xs text-gray-500">
//                       {new Date().toLocaleDateString('en-US', { 
//                         month: 'short', 
//                         day: 'numeric' 
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Error Alert - Mobile Friendly */}
//             {error && (
//               <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                 <div className="flex items-start gap-3">
//                   <AlertCircle size={isMobile ? 18 : 20} className="text-red-500 mt-0.5 flex-shrink-0" />
//                   <div className="flex-1">
//                     <p className="text-sm md:text-base text-red-700 dark:text-red-300">{error}</p>
//                     <button 
//                       onClick={handleRefresh}
//                       className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs md:text-sm"
//                     >
//                       Retry
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}
            
//             {/* Stats Cards Grid - Responsive */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
//               {/* Total Users Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow p-4 md:p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
//                       Total Users
//                     </h3>
//                     <p className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
//                       {formatNumber(totalUsers)}
//                     </p>
//                     <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       {activeUsers} active • {verifiedUsers} verified
//                     </p>
//                   </div>
//                   <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
//                     <Users size={isMobile ? 20 : 24} className="text-purple-600 dark:text-purple-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={14} className="text-green-500 mr-1" />
//                   <span className="text-xs md:text-sm text-green-500">
//                     {totalUsers > 0 ? 'Active system' : 'No users yet'}
//                   </span>
//                 </div>
//               </div>
              
//               {/* Total Apartments Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow p-4 md:p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
//                       Total Apartments
//                     </h3>
//                     <p className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
//                       {formatNumber(totalApartments)}
//                     </p>
//                     <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       {activeApartments} active
//                     </p>
//                   </div>
//                   <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//                     <Building2 size={isMobile ? 20 : 24} className="text-blue-600 dark:text-blue-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={14} className="text-green-500 mr-1" />
//                   <span className="text-xs md:text-sm text-green-500">
//                     {totalApartments > 0 ? 'Properties managed' : 'No apartments yet'}
//                   </span>
//                 </div>
//               </div>

//               {/* Total Roles Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow p-4 md:p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-sm md:text-base font-semibold text-gray-700 dark:text-gray-300">
//                       User Roles
//                     </h3>
//                     <p className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
//                       {formatNumber(totalRoles)}
//                     </p>
//                     <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       Role types in system
//                     </p>
//                   </div>
//                   <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
//                     <Shield size={isMobile ? 20 : 24} className="text-green-600 dark:text-green-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={14} className="text-green-500 mr-1" />
//                   <span className="text-xs md:text-sm text-green-500">
//                     {totalRoles > 0 ? 'Role system active' : 'No roles defined'}
//                   </span>
//                 </div>
//               </div>
//             </div>
            
//             {/* Recent Activity Section - Mobile Optimized */}
//             <div className="mt-6 md:mt-8 bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow p-4 md:p-6 transition-colors duration-200">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6">
//                 <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
//                   Recent Activity
//                 </h2>
//                 <div className="flex gap-2">
//                   <button 
//                     onClick={clearActivities}
//                     className="text-xs md:text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1"
//                   >
//                     Clear All
//                   </button>
//                   <button className="text-xs md:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 px-2 py-1">
//                     View all
//                   </button>
//                 </div>
//               </div>
              
//               <div className="space-y-3 md:space-y-4">
//                 {recentActivities.length === 0 ? (
//                   <div className="text-center py-6 md:py-8 text-gray-500 dark:text-gray-400">
//                     <Activity size={isMobile ? 32 : 48} className="mx-auto mb-3 opacity-50" />
//                     <p className="text-sm md:text-base">No recent activities</p>
//                     <p className="text-xs md:text-sm mt-1">Activities will appear here as they happen</p>
//                   </div>
//                 ) : (
//                   recentActivities.map((activity) => {
//                     const Icon = activity.icon;
//                     const TrendIcon = activity.trend === 'up' ? ArrowUpRight : ArrowDownRight;
//                     const trendColor = activity.trend === 'up' ? 'text-green-500' : 'text-red-500';
                    
//                     return (
//                       <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
//                         <div className="flex items-center flex-1 min-w-0">
//                           <div className={`p-2 ${activity.bgColor} rounded-full mr-3 flex-shrink-0`}>
//                             <Icon size={isMobile ? 16 : 18} className={activity.color} />
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <p className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
//                               {isMobile ? activity.action.substring(0, 40) + (activity.action.length > 40 ? '...' : '') : activity.action}
//                             </p>
//                             <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
//                               {activity.time}
//                             </p>
//                           </div>
//                         </div>
//                         <TrendIcon size={isMobile ? 14 : 16} className={`${trendColor} flex-shrink-0 ml-2`} />
//                       </div>
//                     );
//                   })
//                 )}
//               </div>
//             </div>

//             {/* Data Summary Section - Responsive Grid */}
//             <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
//               {/* Users Summary */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow p-4 md:p-6 transition-colors duration-200">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-3 md:mb-4">
//                   Users Summary
//                 </h3>
//                 <div className="space-y-2 md:space-y-3">
//                   {[
//                     { label: 'Total Users', value: totalUsers, color: 'text-purple-600 dark:text-purple-400' },
//                     { label: 'Active Users', value: activeUsers, color: 'text-green-600 dark:text-green-400' },
//                     { label: 'Verified Users', value: verifiedUsers, color: 'text-blue-600 dark:text-blue-400' },
//                     { label: 'Pending Verification', value: users.filter(u => !u.is_verified).length, color: 'text-yellow-600 dark:text-yellow-400' }
//                   ].map((item, index) => (
//                     <div key={index} className="flex justify-between items-center py-1.5">
//                       <span className="text-sm md:text-base text-gray-600 dark:text-gray-300">
//                         {isMobile && item.label.length > 15 ? item.label.substring(0, 12) + '...' : item.label}
//                       </span>
//                       <span className={`font-semibold ${item.color} text-sm md:text-base`}>
//                         {formatNumber(item.value)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Apartments Summary */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow p-4 md:p-6 transition-colors duration-200">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-3 md:mb-4">
//                   Apartments Summary
//                 </h3>
//                 <div className="space-y-2 md:space-y-3">
//                   {[
//                     { label: 'Total Apartments', value: totalApartments, color: 'text-purple-600 dark:text-purple-400' },
//                     { label: 'Active Apartments', value: activeApartments, color: 'text-green-600 dark:text-green-400' },
//                     { label: 'Inactive Apartments', value: apartments.filter(a => !a.is_active).length, color: 'text-red-600 dark:text-red-400' }
//                   ].map((item, index) => (
//                     <div key={index} className="flex justify-between items-center py-1.5">
//                       <span className="text-sm md:text-base text-gray-600 dark:text-gray-300">
//                         {isMobile && item.label.length > 15 ? item.label.substring(0, 12) + '...' : item.label}
//                       </span>
//                       <span className={`font-semibold ${item.color} text-sm md:text-base`}>
//                         {formatNumber(item.value)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Roles Summary */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow p-4 md:p-6 transition-colors duration-200">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-3 md:mb-4">
//                   Roles Summary
//                 </h3>
//                 <div className="space-y-2 md:space-y-3">
//                   {[
//                     { label: 'Total Roles', value: totalRoles, color: 'text-purple-600 dark:text-purple-400' },
//                     { label: 'Active Roles', value: roles.filter(r => r.is_active).length, color: 'text-green-600 dark:text-green-400' },
//                     { label: 'Inactive Roles', value: roles.filter(r => !r.is_active).length, color: 'text-red-600 dark:text-red-400' }
//                   ].map((item, index) => (
//                     <div key={index} className="flex justify-between items-center py-1.5">
//                       <span className="text-sm md:text-base text-gray-600 dark:text-gray-300">
//                         {isMobile && item.label.length > 15 ? item.label.substring(0, 12) + '...' : item.label}
//                       </span>
//                       <span className={`font-semibold ${item.color} text-sm md:text-base`}>
//                         {formatNumber(item.value)}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             {/* Mobile Quick Stats Bar */}
//             {isMobile && (
//               <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
//                 <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Quick Stats</h3>
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="text-center">
//                     <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalUsers}</div>
//                     <div className="text-xs text-gray-600 dark:text-gray-400">Users</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalApartments}</div>
//                     <div className="text-xs text-gray-600 dark:text-gray-400">Apartments</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-lg font-bold text-green-600 dark:text-green-400">{activeUsers}</div>
//                     <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-lg font-bold text-red-600 dark:text-red-400">
//                       {users.filter(u => !u.is_verified).length}
//                     </div>
//                     <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Mobile Bottom Navigation Hint */}
//             {isMobile && (
//               <div className="mt-6 text-center">
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   💡 Swipe or scroll to see more content
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/sidebar'
import { 
  Home, Building2, Plus, Edit, Trash2, 
  Users, CheckCircle, XCircle, ChevronRight,
  Square, Maximize2, Minimize2, Filter
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CreateApartment from '../Apartments/CreateApartment';

export default function AdminDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // State for data
  const [apartments, setApartments] = useState([]);
  const [floors, setFloors] = useState({});
  const [houses, setHouses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [showApartmentModal, setShowApartmentModal] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [expandedFloor, setExpandedFloor] = useState(null);

  // New apartment form
  const [showNewApartmentModal, setShowNewApartmentModal] = useState(false);
  const [newApartment, setNewApartment] = useState({
    name: '',
    address: '',
    description: '',
    contact_number: ''
  });

  const handleCloseModal = () => setShowNewApartmentModal(false);

  const handleApartmentCreated = (created) => {
    setShowNewApartmentModal(false);
    if (created) {
      toast.success('Apartment created');
      loadApartments();
    }
  };

  // Check mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load apartments
  const loadApartments = async () => {
    try {
      const result = await api.get('/apartments');

      if (result.data.success && Array.isArray(result.data.data)) {
        setApartments(result.data.data);
        // Prefetch floors and houses for each apartment so counts show in the grid
        await Promise.all(result.data.data.map(a => loadFloors(a.id)));
      } else if (Array.isArray(result.data)) {
        setApartments(result.data);
        await Promise.all(result.data.map(a => loadFloors(a.id)));
      } else {
        setApartments([]);
      }
    } catch (err) {
      console.error('Error loading apartments:', err);
      if (err.response?.status === 401) {
        setError('Unauthorized. Please login.');
        navigate('/login');
      } else if (err.response?.status === 400) {
        setError('Company info missing.');
      } else {
        setError('Failed to load apartments.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load floors for an apartment
  const loadFloors = async (apartmentId) => {
    try {
      const result = await api.get(`/floors?apartment_id=${apartmentId}`);
      if (result.data.success && Array.isArray(result.data.data)) {
        setFloors(prev => ({
          ...prev,
          [apartmentId]: result.data.data
        }));
        
        // Load houses for each floor
        result.data.data.forEach(floor => {
          loadHouses(apartmentId, floor.id);
        });
      }
    } catch (err) {
      console.error('Error loading floors:', err);
      toast.error('Failed to load floors');
    }
  };

  // Load houses for a floor
  const loadHouses = async (apartmentId, floorId) => {
    try {
      const result = await api.get(`/houses?apartment_id=${apartmentId}&floor_id=${floorId}`);
      if (result.data.success && Array.isArray(result.data.data)) {
        setHouses(prev => ({
          ...prev,
          [floorId]: result.data.data
        }));
      }
    } catch (err) {
      console.error('Error loading houses:', err);
    }
  };

  // Handle apartment click
  const handleApartmentClick = async (apartment) => {
    setSelectedApartment(apartment);
    setShowApartmentModal(true);
    
    // Load floors and houses for this apartment
    await loadFloors(apartment.id);
  };

  // Handle floor click
  const handleFloorClick = (floorId) => {
    setSelectedFloor(floorId);
    setExpandedFloor(expandedFloor === floorId ? null : floorId);
  };

  // Get house status color
  const getHouseStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-green-500 hover:bg-green-600';
      case 'vacant':
        return 'bg-gray-400 hover:bg-gray-400 dark:bg-gray-300 dark:hover:bg-gray-600';
      case 'maintenance':
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-gray-300 hover:bg-gray-400';
    }
  };

  // Handle new apartment form
  const handleNewApartmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/apartments', newApartment);
      
      if (response.data.success) {
        toast.success('Apartment created successfully');
        setShowNewApartmentModal(false);
        setNewApartment({
          name: '',
          address: '',
          description: '',
          contact_number: ''
        });
        loadApartments();
      }
    } catch (err) {
      console.error('Error creating apartment:', err);
      toast.error(err.response?.data?.message || 'Failed to create apartment');
    }
  };

  // Load all data
  useEffect(() => {
    loadApartments();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16 lg:ml-20' : 'ml-0 lg:ml-64'
        }`}>
          <Navbar />
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Loading Apartments...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16 lg:ml-20' : 'ml-0 lg:ml-64'
      }`}>
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center">
                  <Building2 size={isMobile ? 28 : 32} className="text-purple-600 dark:text-purple-400 mr-2 md:mr-3" />
                  <div>
                    <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
                      Admin Dashboard
                    </h1>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Apartments Grid */}
            <div className="mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4">
                All Apartments
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
               

                {/* Existing Apartment Cards */}
                {apartments.map((apartment) => {
                  // Calculate stats for this apartment
                  const apartmentFloors = floors[apartment.id] || [];
                  const apartmentHouses = apartmentFloors.flatMap(floor => 
                    houses[floor.id] || []
                  );
                  const occupiedHouses = apartmentHouses.filter(house => house.status === 'occupied').length;
                  const occupiedPercent = apartmentHouses.length ? Math.round((occupiedHouses / apartmentHouses.length) * 100) : 0;
                  
                  return (
                    <div 
                      key={apartment.id}
                      onClick={() => handleApartmentClick(apartment)}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 size={20} className="text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {apartment.name}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                            {apartment.address || 'No address provided'}
                          </p>
                        </div>
                        <ChevronRight size={20} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {apartmentFloors.length}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Floors</div>
                        </div>
                        {/* <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {occupiedHouses}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Occupied</div>
                        </div> */}
                        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {apartmentHouses.length}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Houses</div>
                        </div>
                      </div>
                      
                      {/* Occupancy progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs text-gray-600 dark:text-gray-300">Occupied</div>
                          <div className="text-xs font-medium text-gray-700 dark:text-gray-200">{occupiedPercent}%</div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-green-500 dark:bg-green-400" style={{ width: `${occupiedPercent}%` }}></div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          apartment.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {apartment.is_active ? (
                            <>
                              <CheckCircle size={12} className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} className="mr-1" />
                              Inactive
                            </>
                          )}
                        </div>            
                      </div>
                    </div>
                  );
                })}

                 {/* Add New Apartment Card */}
                <div 
                  onClick={() => setShowNewApartmentModal(true)}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-dashed border-purple-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 dark:hover:border-gray-500 transition-all duration-200 min-h-[200px] group"
                >
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                    <Plus size={32} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
                    Add New Apartment
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400 text-center">
                    Click to create a new apartment complex
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apartment Details Modal */}
      {showApartmentModal && selectedApartment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Building2 size={28} />
                    {selectedApartment.name}
                  </h2>
                  <p className="text-purple-100 mt-1">{selectedApartment.address}</p>
                </div>
                <button
                  onClick={() => setShowApartmentModal(false)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {/* Legend */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 dark:bg-gray-300 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Vacant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Maintenance</span>
                </div>
              </div>

              {/* Floors Layout */}
              <div className="space-y-8">
                {floors[selectedApartment.id]?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No floors added yet</p>
                    <p className="text-sm mt-2">Add floors to start managing houses</p>
                  </div>
                ) : (
                  floors[selectedApartment.id]?.map((floor) => {
                    const floorHouses = houses[floor.id] || [];
                    const occupiedCount = floorHouses.filter(h => h.status === 'occupied').length;
                    
                    return (
                      <div key={floor.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                        {/* Floor Header */}
                        <div 
                          onClick={() => handleFloorClick(floor.id)}
                          className="flex items-center justify-between mb-4 cursor-pointer p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {/* <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {floor.floor_id}
                              </span>
                            </div> */}
                            <div>
                              <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                                Floor {floor.floor_id}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {occupiedCount} occupied • {floorHouses.length} total houses
                              </p>
                            </div>
                          </div>
                          <ChevronRight 
                            size={24} 
                            className={`text-gray-500 transition-transform ${
                              expandedFloor === floor.id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>

                        {/* Houses Grid (Collapsible) */}
                        {expandedFloor === floor.id && (
                          <div className="mt-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1">
                              {floorHouses.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                                  <Square size={32} className="mx-auto mb-2 opacity-50" />
                                  <p>No houses added to this floor</p>
                                </div>
                              ) : (
                                floorHouses.map((house) => (
                                  <div
                                    key={house.id}
                                    className="relative"
                                    title={`${house.house_id || house.house_number} - ${house.status}`}
                                  >
                                    <div
                                      className={`${getHouseStatusColor(house.status)} w-14 h-14 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 transform hover:scale-105 shadow hover:shadow-md`}
                                    >
                                      <span className="font-bold text-white dark:text-gray-900 text-sm">
                                        {house.house_id || house.house_number}
                                      </span>
                                    </div>
                                    {/* occupied badge removed */}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            {/* <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowApartmentModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div> */}
          </div>
        </div>
      )}

      {/* Create Modal - replaced previous form modal with CreateApartment component */}
      {showNewApartmentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Create New Apartment</h2>
                <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors">✖</button>
              </div>
              <CreateApartment onClose={handleCloseModal} onCreated={handleApartmentCreated} />
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}