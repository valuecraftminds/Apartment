// import React, { useState } from 'react'
// import Navbar from '../components/Navbar'
// import Sidebar from '../components/Sidebar'
// import { Home, Users, Activity, Calendar, ArrowUpRight, ArrowDownRight, Building2 } from 'lucide-react';
// import { useEffect } from 'react';

// export default function AdminDashboard() {
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

//   // Sample data for demonstration
//   const recentActivities = [
//     { id: 1, type: 'user', action: 'New user registered', time: '2 minutes ago', icon: Users, trend: 'up' },
//     { id: 2, type: 'apartment', action: 'New apartment added', time: '5 minutes ago', icon: Building2, trend: 'up' },
//     { id: 3, type: 'payment', action: 'Monthly revenue processed', time: '1 hour ago', icon: Activity, trend: 'up' },
//     { id: 4, type: 'maintenance', action: 'Maintenance request completed', time: '2 hours ago', icon: Building2, trend: 'down' }
//   ];

//    const [apartments, setApartments] = useState([]);
//    const [loading, setLoading] = useState(true);
//    const [error, setError] = useState(null);

//    const loadApartments = async () => {
//     try {
//         setLoading(true);
//         setError(null);
//         const result = await api.get('/apartments')
//         console.log('API Response:', result.data);

//         if (result.data.success && Array.isArray(result.data.data)) {
//             setApartments(result.data.data);
//         } else if (Array.isArray(result.data)) {
//             setApartments(result.data);
//         } else {
//             console.warn('Unexpected response format:', result.data);
//             setApartments([]);
//         }
//     } catch (err) {
//         console.error('Error loading apartments:', err);
//         if (err.response?.status === 401) {
//             setError('Unauthorized. Please login again.');
//             navigate('/login');
//         } else if (err.response?.status === 400) {
//             setError('Company information missing. Please contact support.');
//         } else {
//             setError('Failed to load apartments. Please try again.');
//         }
//     } finally {
//         setLoading(false);
//     }
// };

//     useEffect(() => {
//         loadApartments();
//     }, []);
    
//      const [users, setUsers] = useState([]);
//      const [roles, setRoles] = useState([]);
//      const [loadingUsers, setLoadingUsers] = useState(true);
//      const [loadingRoles, setLoadingRoles] = useState(true);

//      const loadUsers = async () => {
//     try {
//       setLoadingUsers(true);
//       setError(null);
//       const result = await api.get('/auth/users');
//       console.log('API Response:', result.data);

//       if (result.data.success && Array.isArray(result.data.data)) {
//         setUsers(result.data.data);
//       } else {
//         console.warn('Unexpected response format:', result.data);
//         setUsers([]);
//       }
//     } catch (err) {
//       console.error('Error in fetching users:', err);
//       setError('Failed to load users. Please try again.');
//       toast.error('Failed to fetch users');
//     } finally {
//       setLoadingUsers(false);
//     }
//   };

//   // Load roles from the roles API
//   const loadRoles = async () => {
//     try {
//       setLoadingRoles(true);
//       const result = await api.get('/roles');
//       if (result.data.success && Array.isArray(result.data.data)) {
//         setRoles(result.data.data);
//       } else {
//         setRoles([]);
//       }
//     } catch (err) {
//       console.error('Error loading roles:', err);
//       toast.error('Failed to load roles');
//     } finally {
//       setLoadingRoles(false);
//     }
//   };

//   useEffect(() => {
//     loadUsers();
//     loadRoles(); // Load roles when component mounts
//   }, []);

//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
//       {/* Sidebar */}
//       <Sidebar onCollapse={setIsSidebarCollapsed} />
      
//       {/* Main Content Area - Dynamic margin based on sidebar state */}
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
//         {/* Navbar */}
//         <Navbar />
        
//         {/* Page Content */}
//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="mx-auto max-w-7xl">
//             {/* Header */}
//             <div className='flex items-center bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
//               <Home size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
//               <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
//             </div>
            
//             {/* Stats Cards Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//               {/* Total Users Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Users</h3>
//                     <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">1,234</p>
//                   </div>
//                   <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
//                     <Users size={24} className="text-purple-600 dark:text-purple-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={16} className="text-green-500 mr-1" />
//                   <span className="text-sm text-green-500">+12% this month</span>
//                 </div>
//               </div>
              
//               {/* Total Apartments Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Apartments</h3>
//                     <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">567</p>
//                   </div>
//                   <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//                     <Building2 size={24} className="text-blue-600 dark:text-blue-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={16} className="text-green-500 mr-1" />
//                   <span className="text-sm text-green-500">+8% this month</span>
//                 </div>
//               </div>

//               {/* Revenue Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Revenue</h3>
//                     <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">$45,678</p>
//                   </div>
//                   <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
//                     <Activity size={24} className="text-green-600 dark:text-green-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={16} className="text-green-500 mr-1" />
//                   <span className="text-sm text-green-500">+15% this month</span>
//                 </div>
//               </div>

//               {/* Occupancy Rate Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Occupancy Rate</h3>
//                     <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">92%</p>
//                   </div>
//                   <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
//                     <Calendar size={24} className="text-orange-600 dark:text-orange-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={16} className="text-green-500 mr-1" />
//                   <span className="text-sm text-green-500">+3% this month</span>
//                 </div>
//               </div>
//             </div>
            
//             {/* Recent Activity Section */}
//             <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
//                 <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
//                   View all
//                 </button>
//               </div>
              
//               <div className="space-y-4">
//                 {recentActivities.map((activity) => {
//                   const Icon = activity.icon;
//                   const TrendIcon = activity.trend === 'up' ? ArrowUpRight : ArrowDownRight;
//                   const trendColor = activity.trend === 'up' ? 'text-green-500' : 'text-red-500';
                  
//                   return (
//                     <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
//                       <div className="flex items-center">
//                         <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-3">
//                           <Icon size={18} className="text-purple-600 dark:text-purple-400" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
//                             {activity.action}
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">
//                             {activity.time}
//                           </p>
//                         </div>
//                       </div>
//                       <TrendIcon size={16} className={trendColor} />
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Quick Actions Section */}
//             {/* <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//               <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <button className="p-4 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg text-center transition-colors duration-200">
//                   <Users size={24} className="mx-auto text-purple-600 dark:text-purple-400 mb-2" />
//                   <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Add User</span>
//                 </button>
                
//                 <button className="p-4 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-center transition-colors duration-200">
//                   <Building size={24} className="mx-auto text-blue-600 dark:text-blue-400 mb-2" />
//                   <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Apartment</span>
//                 </button>
                
//                 <button className="p-4 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg text-center transition-colors duration-200">
//                   <Activity size={24} className="mx-auto text-green-600 dark:text-green-400 mb-2" />
//                   <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Generate Report</span>
//                 </button>
                
//                 <button className="p-4 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg text-center transition-colors duration-200">
//                   <Calendar size={24} className="mx-auto text-orange-600 dark:text-orange-400 mb-2" />
//                   <span className="text-sm font-medium text-gray-800 dark:text-gray-200">View Calendar</span>
//                 </button>
//               </div>
//             </div> */}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// import React, { useState, useEffect } from 'react'
// import Navbar from '../components/Navbar'
// import Sidebar from '../components/Sidebar'
// import { Home, Users, Activity, Calendar, ArrowUpRight, ArrowDownRight, Building2, Shield } from 'lucide-react';
// import api from '../api/axios';
// import { toast } from 'react-toastify';
// import { useNavigate } from 'react-router-dom';

// export default function AdminDashboard() {
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const navigate = useNavigate();

//   // State for real data
//   const [apartments, setApartments] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Sample data for demonstration
//   const recentActivities = [
//     { id: 1, type: 'user', action: 'New user registered', time: '2 minutes ago', icon: Users, trend: 'up' },
//     { id: 2, type: 'apartment', action: 'New apartment added', time: '5 minutes ago', icon: Building2, trend: 'up' },
//     { id: 3, type: 'payment', action: 'Monthly revenue processed', time: '1 hour ago', icon: Activity, trend: 'up' },
//     { id: 4, type: 'maintenance', action: 'Maintenance request completed', time: '2 hours ago', icon: Building2, trend: 'down' }
//   ];

//   // Load apartments
//   const loadApartments = async () => {
//     try {
//       const result = await api.get('/apartments');
//       console.log('Apartments API Response:', result.data);

//       if (result.data.success && Array.isArray(result.data.data)) {
//         setApartments(result.data.data);
//       } else if (Array.isArray(result.data)) {
//         setApartments(result.data);
//       } else {
//         console.warn('Unexpected apartments response format:', result.data);
//         setApartments([]);
//       }
//     } catch (err) {
//       console.error('Error loading apartments:', err);
//       if (err.response?.status === 401) {
//         setError('Unauthorized. Please login again.');
//         navigate('/login');
//       } else if (err.response?.status === 400) {
//         setError('Company information missing. Please contact support.');
//       } else {
//         setError('Failed to load apartments. Please try again.');
//       }
//     }
//   };

//   // Load users
//   const loadUsers = async () => {
//     try {
//       const result = await api.get('/auth/users');
//       console.log('Users API Response:', result.data);

//       if (result.data.success && Array.isArray(result.data.data)) {
//         setUsers(result.data.data);
//       } else {
//         console.warn('Unexpected users response format:', result.data);
//         setUsers([]);
//       }
//     } catch (err) {
//       console.error('Error in fetching users:', err);
//       setError('Failed to load users. Please try again.');
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

//   // Load all data
//   const loadAllData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       // Load all data in parallel
//       await Promise.all([
//         loadApartments(),
//         loadUsers(),
//         loadRoles()
//       ]);
      
//     } catch (err) {
//       console.error('Error loading dashboard data:', err);
//       setError('Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAllData();
//   }, []);

//   // Calculate statistics
//   const totalUsers = users.length;
//   const totalApartments = apartments.length;
//   const totalRoles = roles.length;
  
//   // Calculate active users
//   const activeUsers = users.filter(user => user.is_active).length;
  
//   // Calculate verified users
//   const verifiedUsers = users.filter(user => user.is_verified).length;
  
//   // Calculate active apartments
//   const activeApartments = apartments.filter(apt => apt.is_active).length;

//   // Format numbers with commas
//   const formatNumber = (num) => {
//     return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   };

//   if (loading) {
//     return (
//       <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
//         <Sidebar onCollapse={setIsSidebarCollapsed} />
//         <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
//           <Navbar />
//           <div className="flex-1 overflow-y-auto p-6">
//             <div className="mx-auto max-w-7xl">
//               <div className="flex justify-center items-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
//                 <span className="ml-3 text-gray-600 dark:text-gray-300">Loading Dashboard...</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
//       {/* Sidebar */}
//       <Sidebar onCollapse={setIsSidebarCollapsed} />
      
//       {/* Main Content Area - Dynamic margin based on sidebar state */}
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
//         {/* Navbar */}
//         <Navbar />
        
//         {/* Page Content */}
//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="mx-auto max-w-7xl">
//             {/* Header */}
//             <div className='flex items-center bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
//               <Home size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
//               <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
//             </div>

//             {error && (
//               <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
//                 <p className="text-red-700 dark:text-red-300">{error}</p>
//                 <button 
//                   onClick={loadAllData}
//                   className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   Retry
//                 </button>
//               </div>
//             )}
            
//             {/* Stats Cards Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//               {/* Total Users Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Users</h3>
//                     <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
//                       {formatNumber(totalUsers)}
//                     </p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       {activeUsers} active • {verifiedUsers} verified
//                     </p>
//                   </div>
//                   <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
//                     <Users size={24} className="text-purple-600 dark:text-purple-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={16} className="text-green-500 mr-1" />
//                   <span className="text-sm text-green-500">
//                     {totalUsers > 0 ? 'Active system' : 'No users yet'}
//                   </span>
//                 </div>
//               </div>
              
//               {/* Total Apartments Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Apartments</h3>
//                     <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
//                       {formatNumber(totalApartments)}
//                     </p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       {activeApartments} active apartments
//                     </p>
//                   </div>
//                   <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//                     <Building2 size={24} className="text-blue-600 dark:text-blue-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={16} className="text-green-500 mr-1" />
//                   <span className="text-sm text-green-500">
//                     {totalApartments > 0 ? 'Properties managed' : 'No apartments yet'}
//                   </span>
//                 </div>
//               </div>

//               {/* Total Roles Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">User Roles</h3>
//                     <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
//                       {formatNumber(totalRoles)}
//                     </p>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                       Role types in system
//                     </p>
//                   </div>
//                   <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
//                     <Shield size={24} className="text-green-600 dark:text-green-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-2">
//                   <ArrowUpRight size={16} className="text-green-500 mr-1" />
//                   <span className="text-sm text-green-500">
//                     {totalRoles > 0 ? 'Role system active' : 'No roles defined'}
//                   </span>
//                 </div>
//               </div>
//             </div>
            
//             {/* Recent Activity Section */}
//             <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
//                 <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
//                   View all
//                 </button>
//               </div>
              
//               <div className="space-y-4">
//                 {recentActivities.map((activity) => {
//                   const Icon = activity.icon;
//                   const TrendIcon = activity.trend === 'up' ? ArrowUpRight : ArrowDownRight;
//                   const trendColor = activity.trend === 'up' ? 'text-green-500' : 'text-red-500';
                  
//                   return (
//                     <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
//                       <div className="flex items-center">
//                         <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-3">
//                           <Icon size={18} className="text-purple-600 dark:text-purple-400" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
//                             {activity.action}
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400">
//                             {activity.time}
//                           </p>
//                         </div>
//                       </div>
//                       <TrendIcon size={16} className={trendColor} />
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Data Summary Section */}
//             <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//               {/* Users Summary */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Users Summary</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Total Users</span>
//                     <span className="font-semibold text-purple-600 dark:text-purple-400">{totalUsers}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Active Users</span>
//                     <span className="font-semibold text-green-600 dark:text-green-400">{activeUsers}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Verified Users</span>
//                     <span className="font-semibold text-blue-600 dark:text-blue-400">{verifiedUsers}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Pending Verification</span>
//                     <span className="font-semibold text-yellow-600 dark:text-yellow-400">
//                       {users.filter(user => !user.is_verified).length}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Apartments Summary */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Apartments Summary</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Total Apartments</span>
//                     <span className="font-semibold text-purple-600 dark:text-purple-400">{totalApartments}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Active Apartments</span>
//                     <span className="font-semibold text-green-600 dark:text-green-400">
//                       {activeApartments}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Inactive Apartments</span>
//                     <span className="font-semibold text-red-600 dark:text-red-400">
//                       {apartments.filter(apt => !apt.is_active).length}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Roles Summary */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
//                 <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Roles Summary</h3>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Total Roles</span>
//                     <span className="font-semibold text-purple-600 dark:text-purple-400">{totalRoles}</span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Active Roles</span>
//                     <span className="font-semibold text-green-600 dark:text-green-400">
//                       {roles.filter(role => role.is_active).length}
//                     </span>
//                   </div>
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-600 dark:text-gray-300">Inactive Roles</span>
//                     <span className="font-semibold text-red-600 dark:text-red-400">
//                       {roles.filter(role => !role.is_active).length}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Home, Users, Activity, Calendar, ArrowUpRight, ArrowDownRight, Building2, Shield, UserPlus, Key, Mail, UserCheck, UserX, Edit, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  // State for real data
  const [apartments, setApartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Activity types with icons and colors
  const activityTypes = {
    USER_REGISTERED: { 
      icon: UserPlus, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      trend: 'up'
    },
    USER_UPDATED: { 
      icon: Edit, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      trend: 'up'
    },
    USER_DELETED: { 
      icon: Trash2, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      trend: 'down'
    },
    USER_VERIFIED: { 
      icon: UserCheck, 
      color: 'text-green-600', 
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      trend: 'up'
    },
    USER_DEACTIVATED: { 
      icon: UserX, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      trend: 'down'
    },
    APARTMENT_CREATED: { 
      icon: Building2, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      trend: 'up'
    },
    APARTMENT_UPDATED: { 
      icon: Building2, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      trend: 'up'
    },
    APARTMENT_DELETED: { 
      icon: Building2, 
      color: 'text-red-600', 
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      trend: 'down'
    },
    PASSWORD_RESET: { 
      icon: Key, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      trend: 'up'
    },
    EMAIL_SENT: { 
      icon: Mail, 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
      trend: 'up'
    }
  };

  // Generate activity message based on type and data
  const generateActivityMessage = (type, data) => {
    const messages = {
      USER_REGISTERED: `New user registered: ${data.email}`,
      USER_UPDATED: `User updated: ${data.email}`,
      USER_DELETED: `User deleted: ${data.email}`,
      USER_VERIFIED: `User verified: ${data.email}`,
      USER_DEACTIVATED: `User deactivated: ${data.email}`,
      APARTMENT_CREATED: `New apartment created: ${data.name}`,
      APARTMENT_UPDATED: `Apartment updated: ${data.name}`,
      APARTMENT_DELETED: `Apartment deleted: ${data.name}`,
      PASSWORD_RESET: `Password reset requested for: ${data.email}`,
      EMAIL_SENT: `Verification email sent to: ${data.email}`
    };
    return messages[type] || 'Activity recorded';
  };

  // Add new activity to the recent activities list
  const addActivity = (type, data) => {
    const activity = {
      id: Date.now(), // Use timestamp as unique ID
      type,
      action: generateActivityMessage(type, data),
      time: 'Just now',
      timestamp: new Date(),
      ...activityTypes[type]
    };

    setRecentActivities(prev => [activity, ...prev.slice(0, 9)]); // Keep only last 10 activities
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Update activity times periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentActivities(prev => 
        prev.map(activity => ({
          ...activity,
          time: formatTimeAgo(activity.timestamp)
        }))
      );
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Load apartments
  const loadApartments = async () => {
    try {
      const result = await api.get('/apartments');
      console.log('Apartments API Response:', result.data);

      if (result.data.success && Array.isArray(result.data.data)) {
        setApartments(result.data.data);
        
        // Add activity for apartments loaded
        if (result.data.data.length > 0) {
          addActivity('APARTMENT_CREATED', { 
            name: `${result.data.data.length} apartments loaded` 
          });
        }
      } else if (Array.isArray(result.data)) {
        setApartments(result.data);
      } else {
        console.warn('Unexpected apartments response format:', result.data);
        setApartments([]);
      }
    } catch (err) {
      console.error('Error loading apartments:', err);
      if (err.response?.status === 401) {
        setError('Unauthorized. Please login again.');
        navigate('/login');
      } else if (err.response?.status === 400) {
        setError('Company information missing. Please contact support.');
      } else {
        setError('Failed to load apartments. Please try again.');
      }
    }
  };

  // Load users
  const loadUsers = async () => {
    try {
      const result = await api.get('/auth/users');
      console.log('Users API Response:', result.data);

      if (result.data.success && Array.isArray(result.data.data)) {
        const usersData = result.data.data;
        setUsers(usersData);
        
        // Add activity for users loaded
        if (usersData.length > 0) {
          addActivity('USER_REGISTERED', { 
            email: `${usersData.length} users loaded` 
          });
        }

        // Check for newly verified users
        const newlyVerified = usersData.filter(user => 
          user.is_verified && !users.find(u => u.id === user.id && u.is_verified)
        );
        
        newlyVerified.forEach(user => {
          addActivity('USER_VERIFIED', { email: user.email });
        });

      } else {
        console.warn('Unexpected users response format:', result.data);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error in fetching users:', err);
      setError('Failed to load users. Please try again.');
    }
  };

  // Load roles
  const loadRoles = async () => {
    try {
      const result = await api.get('/roles');
      if (result.data.success && Array.isArray(result.data.data)) {
        setRoles(result.data.data);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
    }
  };

  // Load recent activities from localStorage (persist across refreshes)
  const loadRecentActivities = () => {
    try {
      const savedActivities = localStorage.getItem('recentActivities');
      if (savedActivities) {
        const activities = JSON.parse(savedActivities);
        // Update times for saved activities
        const updatedActivities = activities.map(activity => ({
          ...activity,
          time: formatTimeAgo(activity.timestamp),
          // Reconstruct icon components
          ...activityTypes[activity.type]
        }));
        setRecentActivities(updatedActivities);
      }
    } catch (err) {
      console.error('Error loading recent activities:', err);
    }
  };

  // Save recent activities to localStorage
  useEffect(() => {
    if (recentActivities.length > 0) {
      localStorage.setItem('recentActivities', JSON.stringify(recentActivities));
    }
  }, [recentActivities]);

  // Load all data
  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load saved activities first
      loadRecentActivities();
      
      // Then load all data in parallel
      await Promise.all([
        loadApartments(),
        loadUsers(),
        loadRoles()
      ]);
      
      // Add system startup activity
      addActivity('EMAIL_SENT', { email: 'System initialized successfully' });
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Simulate real-time activities (for demo purposes)
  useEffect(() => {
    if (!loading) {
      const demoActivities = [
        { type: 'USER_REGISTERED', data: { email: 'demo@example.com' } },
        { type: 'APARTMENT_CREATED', data: { name: 'Demo Apartment' } },
        { type: 'EMAIL_SENT', data: { email: 'user@example.com' } }
      ];

      // Add demo activities with delays
      demoActivities.forEach((activity, index) => {
        setTimeout(() => {
          addActivity(activity.type, activity.data);
        }, (index + 1) * 5000); // 5s, 10s, 15s delays
      });
    }
  }, [loading]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Calculate statistics
  const totalUsers = users.length;
  const totalApartments = apartments.length;
  const totalRoles = roles.length;
  
  // Calculate active users
  const activeUsers = users.filter(user => user.is_active).length;
  
  // Calculate verified users
  const verifiedUsers = users.filter(user => user.is_verified).length;
  
  // Calculate active apartments
  const activeApartments = apartments.filter(apt => apt.is_active).length;

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Clear all activities
  const clearActivities = () => {
    setRecentActivities([]);
    localStorage.removeItem('recentActivities');
    toast.success('Activities cleared');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <Navbar />
          <div className="flex-1 overflow-y-auto p-6">
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
      {/* Sidebar */}
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      
      {/* Main Content Area - Dynamic margin based on sidebar state */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className='flex items-center bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
              <Home size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <p className="text-red-700 dark:text-red-300">{error}</p>
                <button 
                  onClick={loadAllData}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Total Users Card */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Users</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {formatNumber(totalUsers)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {activeUsers} active • {verifiedUsers} verified
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Users size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">
                    {totalUsers > 0 ? 'Active system' : 'No users yet'}
                  </span>
                </div>
              </div> */}
              
              {/* Total Apartments Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Apartments</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {formatNumber(totalApartments)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {activeApartments} active apartments
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Building2 size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">
                    {totalApartments > 0 ? 'Properties managed' : 'No apartments yet'}
                  </span>
                </div>
              </div>

              {/* Total Roles Card */}
              {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">User Roles</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {formatNumber(totalRoles)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Role types in system
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Shield size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">
                    {totalRoles > 0 ? 'Role system active' : 'No roles defined'}
                  </span>
                </div>
              </div> */}
            </div>
            
            {/* Recent Activity Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={clearActivities}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Clear All
                  </button>
                  <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Activity size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No recent activities</p>
                    <p className="text-sm">Activities will appear here as they happen</p>
                  </div>
                ) : (
                  recentActivities.map((activity) => {
                    const Icon = activity.icon;
                    const TrendIcon = activity.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                    const trendColor = activity.trend === 'up' ? 'text-green-500' : 'text-red-500';
                    
                    return (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                        <div className="flex items-center">
                          <div className={`p-2 ${activity.bgColor} rounded-full mr-3`}>
                            <Icon size={18} className={activity.color} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                        <TrendIcon size={16} className={trendColor} />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Data Summary Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Users Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Users Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Total Users</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Active Users</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">{activeUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Verified Users</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{verifiedUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Pending Verification</span>
                    <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                      {users.filter(user => !user.is_verified).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Apartments Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Apartments Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Total Apartments</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{totalApartments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Active Apartments</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {activeApartments}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Inactive Apartments</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {apartments.filter(apt => !apt.is_active).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Roles Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Roles Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Total Roles</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{totalRoles}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Active Roles</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {roles.filter(role => role.is_active).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Inactive Roles</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {roles.filter(role => !role.is_active).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}