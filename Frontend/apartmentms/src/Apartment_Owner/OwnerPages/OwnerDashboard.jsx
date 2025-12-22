import React, { useState } from 'react'
import { Home, Building2, CreditCard, Calendar, ArrowUpRight, ArrowDownRight, FileText, Shield } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

export default function OwnerDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sample data for owner
  const recentPayments = [
    { id: 1, apartment: 'A-101', amount: '$1,200', date: 'Jan 15, 2024', status: 'Paid' },
    { id: 2, apartment: 'B-205', amount: '$1,500', date: 'Jan 14, 2024', status: 'Paid' },
    { id: 3, apartment: 'C-302', amount: '$1,800', date: 'Jan 10, 2024', status: 'Pending' },
  ];

  const maintenanceRequests = [
    { id: 1, apartment: 'A-101', issue: 'Plumbing Leak', priority: 'High', date: '2 days ago' },
    { id: 2, apartment: 'B-205', issue: 'AC Not Working', priority: 'Medium', date: '5 days ago' },
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Owner Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your apartment portfolio</p>
              </div>
            </div>
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Apartments */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">My Apartments</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">12</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Building2 size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+2 this year</span>
                </div>
              </div>
              
              {/* Monthly Revenue */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Monthly Revenue</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">$15,200</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CreditCard size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+8% from last month</span>
                </div>
              </div>

              {/* Occupancy Rate */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Occupancy Rate</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">92%</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Calendar size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+5% this quarter</span>
                </div>
              </div>

              {/* Pending Maintenance */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Pending Issues</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">3</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                    <Shield size={24} className="text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowDownRight size={16} className="text-red-500 mr-1" />
                  <span className="text-sm text-red-500">2 high priority</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Payments */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Payments</h2>
                  <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {payment.apartment}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {payment.amount}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          payment.status === 'Paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Maintenance Requests */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Maintenance Requests</h2>
                  <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {maintenanceRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {request.apartment}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.priority === 'High' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {request.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {request.issue}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {request.date}
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