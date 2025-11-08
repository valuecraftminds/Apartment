import React, { useState } from 'react'
import { Home, Wrench, Clock, CheckCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function TechDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Sample data for technician
  const currentTasks = [
    { id: 1, task: 'Fix AC Unit - A-101', priority: 'High', timeEstimate: '2 hours', status: 'In Progress' },
    { id: 2, task: 'Plumbing Repair - B-205', priority: 'Medium', timeEstimate: '1 hour', status: 'Assigned' },
    { id: 3, task: 'Electrical Check - C-302', priority: 'Low', timeEstimate: '30 mins', status: 'Pending' },
  ];

  const completedTasks = [
    { id: 1, task: 'Light Fixture Replacement', apartment: 'A-101', completed: '2 hours ago' },
    { id: 2, task: 'Lock Repair', apartment: 'B-105', completed: '1 day ago' },
    { id: 3, task: 'Appliance Installation', apartment: 'C-201', completed: '2 days ago' },
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Technician Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage maintenance tasks and work orders</p>
              </div>
            </div>
            
            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Active Tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Tasks</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">5</p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                    <Wrench size={24} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">3 in progress</span>
                </div>
              </div>
              
              {/* Completed Today */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Completed Today</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">8</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+2 from yesterday</span>
                </div>
              </div>

              {/* High Priority */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">High Priority</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">3</p>
                  </div>
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-red-500">Urgent attention needed</span>
                </div>
              </div>

              {/* Avg. Completion Time */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Avg. Time</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">1.5h</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Clock size={24} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight size={16} className="text-green-500 mr-1" />
                  <span className="text-sm text-green-500">Faster than last week</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Tasks */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Current Tasks</h2>
                  <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {currentTasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {task.task}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'High' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : task.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Est: {task.timeEstimate}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'In Progress' 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recently Completed */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recently Completed</h2>
                  <button className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                    View all
                  </button>
                </div>
                
                <div className="space-y-4">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {task.task}
                        </p>
                        <CheckCircle size={16} className="text-green-500" />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {task.apartment}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {task.completed}
                        </p>
                      </div>
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