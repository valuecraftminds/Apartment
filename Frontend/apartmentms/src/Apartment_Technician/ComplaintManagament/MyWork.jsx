import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/navbar';
import Sidebar from '../../components/Sidebar';
import { ChevronLeft, Workflow } from 'lucide-react';
import StartWork from './StartWork';

export default function MyWork() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Go back to My Complaints
    const handleBackToComplaints = () => {
        navigate('/my-complaints');
    };

  return (
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
            <Sidebar onCollapse={setIsSidebarCollapsed}/>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
            <div 
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                onClick={() => setIsMobileSidebarOpen(false)}
            />
        )}

        {/* Mobile Sidebar */}
        <div className={`
            lg:hidden fixed left-0 top-0 h-full z-50
            transform transition-transform duration-300 ease-in-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <Sidebar onCollapse={setIsSidebarCollapsed} />
        </div>

        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
            <Navbar/>

            {/* Mobile Header with Menu Button */}
            <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={handleBackToComplaints} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                            <ChevronLeft size={16} />
                        </button>
                        <Workflow size={28} className="text-purple-600 dark:text-purple-400 mr-2" />
                        <div>
                            <h1 className="text-lg font-bold text-gray-800 dark:text-white">My Service</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                <div className='mx-auto max-w-7xl'>
                    {/* Desktop Header */}
                    <div className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
                        <div className='flex flex-col'>
                            <div className='flex items-center'>
                                <button onClick={handleBackToComplaints} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                                    <ChevronLeft size={16} />
                                </button>
                                <Workflow size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Service Management</h1>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6">
                        <StartWork/>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
