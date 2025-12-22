import React, { useState } from 'react'
import { Home, Users, Building2, CreditCard, Calendar, ArrowUpRight, FileText, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

export default function ManagerDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sample data for manager
  const recentTenants = [
    { id: 1, name: 'John Smith', apartment: 'A-101', moveIn: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', apartment: 'B-205', moveIn: '2024-01-10', status: 'Active' },
    { id: 3, name: 'Mike Wilson', apartment: 'C-302', moveIn: '2024-01-20', status: 'Pending' },
  ];

  const upcomingTasks = [
    { id: 1, task: 'Unit Inspection - A-101', date: 'Today', priority: 'High' },
    { id: 2, task: 'Lease Renewal - B-205', date: 'Tomorrow', priority: 'Medium' },
    { id: 3, task: 'Maintenance Follow-up', date: 'In 2 days', priority: 'Medium' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className='flex items-center bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
              <Home size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manager Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage properties and tenants</p>
              </div>
            </div>
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Tenants */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Tenants</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">45</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Users size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+5 this month</span>
                </div>
              </div>
              
              {/* Occupied Units */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Occupied Units</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">42</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <Building2 size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">93% occupancy</span>
                </div>
              </div>

              {/* Monthly Collections */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Monthly Collections</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">$42,500</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <CreditCard size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">98% collected</span>
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Pending Tasks</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">8</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <AlertCircle size={24} className="text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-orange-500">3 high priority</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Tenants */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Tenants</h2>
                  <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentTenants.map((tenant) => (
                    <div key={tenant.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {tenant.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tenant.apartment} • Move-in: {tenant.moveIn}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        tenant.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {tenant.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Upcoming Tasks</h2>
                  <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {task.task}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'High' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {task.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}