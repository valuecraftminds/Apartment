// // EmployeeDashboard.jsx - UPDATED
// import React, { useState } from 'react'
// import Navbar from '../components/Navbar'
// import Sidebar from '../components/Sidebar'
// import { 
//   Home, 
//   ClipboardCheck, 
//   Wrench, 
//   MessageSquare, 
//   Calendar, 
//   Clock,
//   CheckCircle,
//   AlertCircle,
//   ArrowUpRight, 
//   ArrowDownRight, 
//   Building2,
//   FileText,
//   Users
// } from 'lucide-react';

// export default function EmployeeDashboard() {
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

//   // Sample data for employee dashboard
//   const recentActivities = [
//     { id: 1, type: 'task', action: 'Maintenance task completed', time: '30 minutes ago', icon: ClipboardCheck, trend: 'up' },
//     { id: 2, type: 'maintenance', action: 'New maintenance request assigned', time: '1 hour ago', icon: Wrench, trend: 'up' },
//     { id: 3, type: 'message', action: 'New message from tenant', time: '2 hours ago', icon: MessageSquare, trend: 'up' },
//     { id: 4, type: 'inspection', action: 'Apartment inspection scheduled', time: '3 hours ago', icon: Building2, trend: 'down' }
//   ];

//   const upcomingTasks = [
//     { id: 1, title: 'Apartment Inspection - Building A', due: 'Today, 2:00 PM', priority: 'high', type: 'inspection' },
//     { id: 2, title: 'Follow up Maintenance #245', due: 'Tomorrow, 10:00 AM', priority: 'medium', type: 'maintenance' },
//     { id: 3, title: 'Monthly Report Submission', due: 'Jan 20, 2024', priority: 'medium', type: 'report' },
//     { id: 4, title: 'Tenant Meeting', due: 'Jan 22, 2024', priority: 'low', type: 'meeting' }
//   ];

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
//       case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
//       case 'low': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
//       default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
//     }
//   };

//   const getTypeIcon = (type) => {
//     switch (type) {
//       case 'inspection': return Building2;
//       case 'maintenance': return Wrench;
//       case 'report': return FileText;
//       case 'meeting': return Users;
//       default: return ClipboardCheck;
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
//       {/* Sidebar - The component handles its own mobile state */}
//       <Sidebar />
      
//       {/* Main Content Area - Dynamic margin based on sidebar state */}
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
//         isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
//         }`}>
//         {/* Navbar */}
//         <Navbar />
        
//         {/* Page Content */}
//         <div className="flex-1 overflow-y-auto p-4 lg:p-6">
//           <div className="mx-auto max-w-7xl">
//             {/* Your existing dashboard content remains the same */}
//             <div className='flex items-center bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 mb-6'>
//               {/* <Home size={32} className='text-purple-600 dark:text-purple-400 mr-3'/> */}
//               <div>
//                 <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
//                 <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your overview for today.</p>
//               </div>
//             </div>      
            
//             {/* Stats Cards Grid - Responsive */}
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
//               {/* Pending Tasks Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 lg:p-6 transition-colors duration-200 col-span-2 lg:col-span-1">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-sm lg:text-lg font-semibold text-gray-700 dark:text-gray-300">Pending Tasks</h3>
//                     <p className="text-xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">12</p>
//                   </div>
//                   <div className="p-2 lg:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
//                     <ClipboardCheck size={20} className="text-purple-600 dark:text-purple-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-1 lg:mt-2">
//                   <ArrowUpRight size={14} className="text-green-500 mr-1" />
//                   <span className="text-xs lg:text-sm text-green-500">+2 today</span>
//                 </div>
//               </div>
              
//               {/* Completed Tasks Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 lg:p-6 transition-colors duration-200 col-span-2 lg:col-span-1">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-sm lg:text-lg font-semibold text-gray-700 dark:text-gray-300">Completed Tasks</h3>
//                     <p className="text-xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">45</p>
//                   </div>
//                   <div className="p-2 lg:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
//                     <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-1 lg:mt-2">
//                   <ArrowUpRight size={14} className="text-green-500 mr-1" />
//                   <span className="text-xs lg:text-sm text-green-500">+5 this week</span>
//                 </div>
//               </div>

//               {/* Maintenance Requests Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 lg:p-6 transition-colors duration-200 col-span-2 lg:col-span-1">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-sm lg:text-lg font-semibold text-gray-700 dark:text-gray-300">Maintenance</h3>
//                     <p className="text-xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">8</p>
//                   </div>
//                   <div className="p-2 lg:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
//                     <Wrench size={20} className="text-blue-600 dark:text-blue-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-1 lg:mt-2">
//                   <ArrowUpRight size={14} className="text-green-500 mr-1" />
//                   <span className="text-xs lg:text-sm text-green-500">+1 today</span>
//                 </div>
//               </div>

//               {/* Response Time Card */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 lg:p-6 transition-colors duration-200 col-span-2 lg:col-span-1">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-sm lg:text-lg font-semibold text-gray-700 dark:text-gray-300">Response Time</h3>
//                     <p className="text-xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">24h</p>
//                   </div>
//                   <div className="p-2 lg:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
//                     <Clock size={20} className="text-orange-600 dark:text-orange-400" />
//                   </div>
//                 </div>
//                 <div className="flex items-center mt-1 lg:mt-2">
//                   <ArrowDownRight size={14} className="text-green-500 mr-1" />
//                   <span className="text-xs lg:text-sm text-green-500">-2h</span>
//                 </div>
//               </div>
//             </div>

//             {/* Main Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
//               {/* Recent Activity Section */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between mb-4 lg:mb-6">
//                   <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
//                   <button className="text-xs lg:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
//                     View all
//                   </button>
//                 </div>
                
//                 <div className="space-y-3 lg:space-y-4">
//                   {recentActivities.map((activity) => {
//                     const Icon = activity.icon;
//                     const TrendIcon = activity.trend === 'up' ? ArrowUpRight : ArrowDownRight;
//                     const trendColor = activity.trend === 'up' ? 'text-green-500' : 'text-red-500';
                    
//                     return (
//                       <div key={activity.id} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
//                         <div className="flex items-center flex-1 min-w-0">
//                           <div className="p-1 lg:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-2 lg:mr-3 flex-shrink-0">
//                             <Icon size={16} className="text-purple-600 dark:text-purple-400" />
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
//                               {activity.action}
//                             </p>
//                             <p className="text-xs text-gray-500 dark:text-gray-400">
//                               {activity.time}
//                             </p>
//                           </div>
//                         </div>
//                         <TrendIcon size={14} className={`${trendColor} flex-shrink-0 ml-2`} />
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* Upcoming Tasks Section */}
//               <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 transition-colors duration-200">
//                 <div className="flex items-center justify-between mb-4 lg:mb-6">
//                   <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white">Upcoming Tasks</h2>
//                   <button className="text-xs lg:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
//                     View all
//                   </button>
//                 </div>
                
//                 <div className="space-y-3 lg:space-y-4">
//                   {upcomingTasks.map((task) => {
//                     const TypeIcon = getTypeIcon(task.type);
                    
//                     return (
//                       <div key={task.id} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
//                         <div className="flex items-center flex-1 min-w-0">
//                           <div className="p-1 lg:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-2 lg:mr-3 flex-shrink-0">
//                             <TypeIcon size={16} className="text-blue-600 dark:text-blue-400" />
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
//                               {task.title}
//                             </p>
//                             <p className="text-xs text-gray-500 dark:text-gray-400">
//                               Due: {task.due}
//                             </p>
//                           </div>
//                         </div>
//                         <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 ml-2`}>
//                           {task.priority}
//                         </span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* Performance Overview - Stack on mobile */}
//             <div className="mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 transition-colors duration-200">
//               <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-4 lg:mb-6">Performance Overview</h2>
//               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
//                 <div className="text-center">
//                   <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">92%</div>
//                   <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Completion Rate</div>
//                   <div className="flex items-center justify-center mt-1 lg:mt-2">
//                     <ArrowUpRight size={12} className="text-green-500 mr-1" />
//                     <span className="text-xs text-green-500">+5%</span>
//                   </div>
//                 </div>
                
//                 <div className="text-center">
//                   <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">4.8/5</div>
//                   <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Satisfaction</div>
//                   <div className="flex items-center justify-center mt-1 lg:mt-2">
//                     <ArrowUpRight size={12} className="text-green-500 mr-1" />
//                     <span className="text-xs text-green-500">+0.2</span>
//                   </div>
//                 </div>
                
//                 <div className="text-center">
//                   <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">15</div>
//                   <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">This Week</div>
//                   <div className="flex items-center justify-center mt-1 lg:mt-2">
//                     <ArrowUpRight size={12} className="text-green-500 mr-1" />
//                     <span className="text-xs text-green-500">+3</span>
//                   </div>
//                 </div>
                
//                 <div className="text-center">
//                   <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">98%</div>
//                   <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">On-Time</div>
//                   <div className="flex items-center justify-center mt-1 lg:mt-2">
//                     <ArrowUpRight size={12} className="text-green-500 mr-1" />
//                     <span className="text-xs text-green-500">+2%</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Today's Schedule Section */}
//             <div className="mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 transition-colors duration-200">
//               <div className="flex items-center justify-between mb-4 lg:mb-6">
//                 <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white">Today's Schedule</h2>
//                 <button className="text-xs lg:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
//                   View Calendar
//                 </button>
//               </div>
              
//               <div className="space-y-3 lg:space-y-4">
//                 <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <div className="flex items-center flex-1 min-w-0">
//                     <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 lg:mr-3 flex-shrink-0"></div>
//                     <div className="min-w-0 flex-1">
//                       <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">Team Meeting</p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">10:00 AM - 11:00 AM</p>
//                     </div>
//                   </div>
//                   <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded flex-shrink-0 ml-2">Meeting</span>
//                 </div>
                
//                 <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <div className="flex items-center flex-1 min-w-0">
//                     <div className="w-2 h-2 bg-green-500 rounded-full mr-2 lg:mr-3 flex-shrink-0"></div>
//                     <div className="min-w-0 flex-1">
//                       <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">Property Inspection - Building B</p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">2:00 PM - 4:00 PM</p>
//                     </div>
//                   </div>
//                   <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded flex-shrink-0 ml-2">Inspection</span>
//                 </div>
                
//                 <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//                   <div className="flex items-center flex-1 min-w-0">
//                     <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 lg:mr-3 flex-shrink-0"></div>
//                     <div className="min-w-0 flex-1">
//                       <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">Follow-up: Maintenance #245</p>
//                       <p className="text-xs text-gray-500 dark:text-gray-400">4:30 PM - 5:00 PM</p>
//                     </div>
//                   </div>
//                   <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded flex-shrink-0 ml-2">Maintenance</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }


import React, { useState, useEffect, useContext } from 'react'
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { 
  Home, 
  Building2,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Loader
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EmployeeDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [assignedApartments, setAssignedApartments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    assignedApartments: 0,
    pendingTasks: 0,
    completedTasks: 0,
    maintenanceRequests: 0
  });
  const { auth } = useContext(AuthContext);

  // Fetch assigned apartments count on component mount
  useEffect(() => {
    if (auth?.user?.id) {
      fetchAssignedApartments();
      fetchDashboardStats();
    }
  }, [auth?.user?.id]);

  // Fetch assigned apartments count
  const fetchAssignedApartments = async () => {
    try {
      setLoading(true);
      // Assuming you have an API endpoint to get employee's assigned apartments
      const response = await api.get(`/user-apartments/users/${auth.user.id}/apartments`);
      
      if (response.data.success) {
        const apartments = response.data.data || [];
        setAssignedApartments(apartments.length);
        setDashboardStats(prev => ({
          ...prev,
          assignedApartments: apartments.length
        }));
      } else {
        toast.error('Failed to load assigned apartments');
      }
    } catch (error) {
      console.error('Error fetching assigned apartments:', error);
      toast.error('Error loading assigned apartments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch other dashboard stats
  const fetchDashboardStats = async () => {
    try {
      // You would replace these with actual API calls
      // For now, using mock data
      const mockStats = {
        pendingTasks: 12,
        completedTasks: 45,
        maintenanceRequests: 8
      };
      
      setDashboardStats(prev => ({
        ...prev,
        ...mockStats
      }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // Get apartments text
  const getApartmentsText = () => {
    if (assignedApartments === 1) return '1 Apartment Assigned';
    return `${assignedApartments} Apartments Assigned`;
  };

  // Skeleton loader
  const StatSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Dashboard Header */}
            <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 gap-4'>
              <div className='flex items-center'>
                <Home size={32} className='text-purple-600 dark:text-purple-400 mr-3'/>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Welcome back! Here's your overview for today.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Active Apartments Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Apartments</h3>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(assignedApartments)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All apartments are active</p>
                </div>
                <div className="flex items-center mt-4">
                  <ArrowUpRight size={14} className="text-green-500 mr-1" />
                  <span className="text-xs lg:text-sm text-green-500">All well maintained</span>
                </div>
              </div>
            </div>

            {/* Assigned Apartments Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Assigned Apartments Summary</h2>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                  View Details
                </button>
              </div>
              
              {assignedApartments === 0 ? (
                <div className="text-center py-8">
                  <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Apartments Assigned
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You haven't been assigned to any apartments yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatNumber(assignedApartments)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Apartments</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatNumber(assignedApartments)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Active Status</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {formatNumber(dashboardStats.pendingTasks)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Pending Tasks</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatNumber(dashboardStats.maintenanceRequests)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Maintenance</div>
                    </div>
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mt-6">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Quick Tips</h4>
                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                      <li className="flex items-start">
                        <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>You are responsible for {assignedApartments} apartments</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>Regular inspections ensure tenant satisfaction</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>Keep track of pending tasks and maintenance requests</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity - Simplified */}
            <div className="mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {assignedApartments === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent activity. Start by getting assigned to apartments.
                  </p>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                          <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            Assigned to {assignedApartments} apartments
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Today • All apartments active
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-green-500" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                          <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {dashboardStats.pendingTasks} pending tasks
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Requires your attention
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-yellow-500" />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Users size={16} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {dashboardStats.maintenanceRequests} maintenance requests
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Scheduled for this week
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="text-blue-500" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}