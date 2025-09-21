import React, { useState } from 'react'
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Floors() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  return (    
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
        <Sidebar onCollapse={setIsSidebarCollapsed}/>
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <Navbar/>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl">
                    <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                        <div className='flex items-center'>
                            <Building2 size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Apartments</h1>
                        </div>
                        <button onClick={handleAddNew} className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                           <Plus size={20}/>
                            <span>Add New</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
  )
}
