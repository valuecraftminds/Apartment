import { Building, Building2 } from 'lucide-react'
import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar';

export default function ApartmentView() {
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
              <div className="mx-auto flex">
                <Building2 size={50} className='text-purple-600 mr-1.5'/>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Apartments</h1>                
              </div>
            </div>
          </div>
        </div>
  )
}
