import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Home } from 'lucide-react';

export default function AdminDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 w-screen">
      {/* Sidebar */}
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      
      {/* Main Content Area - Dynamic margin based on sidebar state */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto">
            <div className='flex bg-gray-100 rounded-2xl h-fit'>
            <Home size={50} className='text-purple-600 mr-1.5'/>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
            </div>
            
            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                <p className="text-3xl font-bold text-purple-600">1,234</p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700">Total Apartments</h3>
                <p className="text-3xl font-bold text-purple-600">567</p>
              </div>
            </div>
            
            {/* Additional Dashboard Content */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
              {/* Add your recent activity content here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}