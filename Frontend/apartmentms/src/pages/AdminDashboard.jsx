import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Home, Users, Activity, Calendar, ArrowUpRight, ArrowDownRight, Building2 } from 'lucide-react';

export default function AdminDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sample data for demonstration
  const recentActivities = [
    { id: 1, type: 'user', action: 'New user registered', time: '2 minutes ago', icon: Users, trend: 'up' },
    { id: 2, type: 'apartment', action: 'New apartment added', time: '5 minutes ago', icon: Building2, trend: 'up' },
    { id: 3, type: 'payment', action: 'Monthly revenue processed', time: '1 hour ago', icon: Activity, trend: 'up' },
    { id: 4, type: 'maintenance', action: 'Maintenance request completed', time: '2 hours ago', icon: Building2, trend: 'down' }
  ];

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
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Users</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">1,234</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Users size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+12% this month</span>
                </div>
              </div>
              
              {/* Total Apartments Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Apartments</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">567</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Building2 size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+8% this month</span>
                </div>
              </div>

              {/* Revenue Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Revenue</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">$45,678</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Activity size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+15% this month</span>
                </div>
              </div>

              {/* Occupancy Rate Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Occupancy Rate</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">92%</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Calendar size={24} className="text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+3% this month</span>
                </div>
              </div>
            </div>
            
            {/* Recent Activity Section */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
                <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                  View all
                </button>
              </div>
              
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  const TrendIcon = activity.trend === 'up' ? ArrowUpRight : ArrowDownRight;
                  const trendColor = activity.trend === 'up' ? 'text-green-500' : 'text-red-500';
                  
                  return (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-3">
                          <Icon size={18} className="text-purple-600 dark:text-purple-400" />
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
                })}
              </div>
            </div>

            {/* Quick Actions Section */}
            {/* <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="p-4 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg text-center transition-colors duration-200">
                  <Users size={24} className="mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Add User</span>
                </button>
                
                <button className="p-4 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg text-center transition-colors duration-200">
                  <Building size={24} className="mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Add Apartment</span>
                </button>
                
                <button className="p-4 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg text-center transition-colors duration-200">
                  <Activity size={24} className="mx-auto text-green-600 dark:text-green-400 mb-2" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Generate Report</span>
                </button>
                
                <button className="p-4 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg text-center transition-colors duration-200">
                  <Calendar size={24} className="mx-auto text-orange-600 dark:text-orange-400 mb-2" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">View Calendar</span>
                </button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}