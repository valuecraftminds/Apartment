// EmployeeDashboard.jsx - UPDATED
import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { 
  Home, 
  ClipboardCheck, 
  Wrench, 
  MessageSquare, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpRight, 
  ArrowDownRight, 
  Building2,
  FileText,
  Users
} from 'lucide-react';

export default function EmployeeDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sample data for employee dashboard
  const recentActivities = [
    { id: 1, type: 'task', action: 'Maintenance task completed', time: '30 minutes ago', icon: ClipboardCheck, trend: 'up' },
    { id: 2, type: 'maintenance', action: 'New maintenance request assigned', time: '1 hour ago', icon: Wrench, trend: 'up' },
    { id: 3, type: 'message', action: 'New message from tenant', time: '2 hours ago', icon: MessageSquare, trend: 'up' },
    { id: 4, type: 'inspection', action: 'Apartment inspection scheduled', time: '3 hours ago', icon: Building2, trend: 'down' }
  ];

  const upcomingTasks = [
    { id: 1, title: 'Apartment Inspection - Building A', due: 'Today, 2:00 PM', priority: 'high', type: 'inspection' },
    { id: 2, title: 'Follow up Maintenance #245', due: 'Tomorrow, 10:00 AM', priority: 'medium', type: 'maintenance' },
    { id: 3, title: 'Monthly Report Submission', due: 'Jan 20, 2024', priority: 'medium', type: 'report' },
    { id: 4, title: 'Tenant Meeting', due: 'Jan 22, 2024', priority: 'low', type: 'meeting' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'inspection': return Building2;
      case 'maintenance': return Wrench;
      case 'report': return FileText;
      case 'meeting': return Users;
      default: return ClipboardCheck;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      {/* Sidebar - The component handles its own mobile state */}
      <Sidebar />
      
      {/* Main Content Area - Dynamic margin based on sidebar state */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Your existing dashboard content remains the same */}
            <div className='flex items-center bg-white dark:bg-gray-800 rounded-2xl p-4 lg:p-6 mb-6'>
              {/* <Home size={32} className='text-purple-600 dark:text-purple-400 mr-3'/> */}
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your overview for today.</p>
              </div>
            </div>      
            
            {/* Stats Cards Grid - Responsive */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
              {/* Pending Tasks Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 lg:p-6 transition-colors duration-200 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700 dark:text-gray-300">Pending Tasks</h3>
                    <p className="text-xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">12</p>
                  </div>
                  <div className="p-2 lg:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <ClipboardCheck size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center mt-1 lg:mt-2">
                  <ArrowUpRight size={14} className="text-green-500 mr-1" />
                  <span className="text-xs lg:text-sm text-green-500">+2 today</span>
                </div>
              </div>
              
              {/* Completed Tasks Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 lg:p-6 transition-colors duration-200 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700 dark:text-gray-300">Completed Tasks</h3>
                    <p className="text-xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">45</p>
                  </div>
                  <div className="p-2 lg:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center mt-1 lg:mt-2">
                  <ArrowUpRight size={14} className="text-green-500 mr-1" />
                  <span className="text-xs lg:text-sm text-green-500">+5 this week</span>
                </div>
              </div>

              {/* Maintenance Requests Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 lg:p-6 transition-colors duration-200 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700 dark:text-gray-300">Maintenance</h3>
                    <p className="text-xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">8</p>
                  </div>
                  <div className="p-2 lg:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Wrench size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-1 lg:mt-2">
                  <ArrowUpRight size={14} className="text-green-500 mr-1" />
                  <span className="text-xs lg:text-sm text-green-500">+1 today</span>
                </div>
              </div>

              {/* Response Time Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 lg:p-6 transition-colors duration-200 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm lg:text-lg font-semibold text-gray-700 dark:text-gray-300">Response Time</h3>
                    <p className="text-xl lg:text-3xl font-bold text-purple-600 dark:text-purple-400">24h</p>
                  </div>
                  <div className="p-2 lg:p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Clock size={20} className="text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex items-center mt-1 lg:mt-2">
                  <ArrowDownRight size={14} className="text-green-500 mr-1" />
                  <span className="text-xs lg:text-sm text-green-500">-2h</span>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
              {/* Recent Activity Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
                  <button className="text-xs lg:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
                
                <div className="space-y-3 lg:space-y-4">
                  {recentActivities.map((activity) => {
                    const Icon = activity.icon;
                    const TrendIcon = activity.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                    const trendColor = activity.trend === 'up' ? 'text-green-500' : 'text-red-500';
                    
                    return (
                      <div key={activity.id} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="p-1 lg:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-2 lg:mr-3 flex-shrink-0">
                            <Icon size={16} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                        <TrendIcon size={14} className={`${trendColor} flex-shrink-0 ml-2`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Tasks Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white">Upcoming Tasks</h2>
                  <button className="text-xs lg:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
                
                <div className="space-y-3 lg:space-y-4">
                  {upcomingTasks.map((task) => {
                    const TypeIcon = getTypeIcon(task.type);
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                        <div className="flex items-center flex-1 min-w-0">
                          <div className="p-1 lg:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-2 lg:mr-3 flex-shrink-0">
                            <TypeIcon size={16} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {task.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Due: {task.due}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)} flex-shrink-0 ml-2`}>
                          {task.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Performance Overview - Stack on mobile */}
            <div className="mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 transition-colors duration-200">
              <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-4 lg:mb-6">Performance Overview</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">92%</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Completion Rate</div>
                  <div className="flex items-center justify-center mt-1 lg:mt-2">
                    <ArrowUpRight size={12} className="text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+5%</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">4.8/5</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">Satisfaction</div>
                  <div className="flex items-center justify-center mt-1 lg:mt-2">
                    <ArrowUpRight size={12} className="text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+0.2</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">15</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">This Week</div>
                  <div className="flex items-center justify-center mt-1 lg:mt-2">
                    <ArrowUpRight size={12} className="text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+3</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-purple-600 dark:text-purple-400">98%</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">On-Time</div>
                  <div className="flex items-center justify-center mt-1 lg:mt-2">
                    <ArrowUpRight size={12} className="text-green-500 mr-1" />
                    <span className="text-xs text-green-500">+2%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Schedule Section */}
            <div className="mt-6 lg:mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-4 lg:p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white">Today's Schedule</h2>
                <button className="text-xs lg:text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                  View Calendar
                </button>
              </div>
              
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 lg:mr-3 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">Team Meeting</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">10:00 AM - 11:00 AM</p>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded flex-shrink-0 ml-2">Meeting</span>
                </div>
                
                <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 lg:mr-3 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">Property Inspection - Building B</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">2:00 PM - 4:00 PM</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded flex-shrink-0 ml-2">Inspection</span>
                </div>
                
                <div className="flex items-center justify-between p-2 lg:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2 lg:mr-3 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-gray-800 dark:text-gray-200 truncate">Follow-up: Maintenance #245</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">4:30 PM - 5:00 PM</p>
                    </div>
                  </div>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded flex-shrink-0 ml-2">Maintenance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}