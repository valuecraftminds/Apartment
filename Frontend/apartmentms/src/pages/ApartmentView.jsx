import { Building, Building2, Plus } from 'lucide-react'
import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar';

export default function ApartmentView() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
                <div className='flex items-center bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
              <Building2 size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Apartments</h1>
              <div className='loginButtonGroup flex'>
                <Plus size={20}/>
                <button className='loginButton p-52 ml-80'>Add New</button>
              </div>
            </div>               
              </div>
            </div>
          </div>
        </div>
  )
}
