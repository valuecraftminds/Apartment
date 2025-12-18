import React, { useState } from 'react';
import { ChevronLeft, Receipt } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import MeasurableBills from './MeasurableBills';
import ManualBillMeter from './ManualBillMeter';

export default function HouseBillMeter() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("manual");
    const navigate = useNavigate();
    const { bill_id } = useParams();

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleBack = () => {
        navigate('/my-bills');
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
                            <button onClick={handleBack} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                                <ChevronLeft size={16} />
                            </button>
                            <Receipt size={28} className="text-purple-600 dark:text-purple-400 mr-2" />
                            <div>
                                <h1 className="text-lg font-bold text-gray-800 dark:text-white">Bill Meter</h1>
                                {/* <p className="text-xs text-gray-600 dark:text-gray-300">
                                    Bill ID: {bill_id?.substring(0, 8)}...
                                </p> */}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="mx-auto max-w-7xl">
                        {/* Desktop Header - Hidden on mobile */}
                        <div className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
                            <div className='flex flex-col'>
                                <div className='flex items-center'>
                                    <button onClick={handleBack} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                                        <ChevronLeft size={16} />
                                    </button>
                                    <Receipt size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bill Management for Apartments</h1>
                                </div>
                            </div>
                        </div>

                        {/* Tabs - Mobile optimized */}
                        <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-4 lg:mb-6 px-1 lg:px-0">
                            {/* <button
                                onClick={() => setActiveTab("manual")}
                                className={`px-3 lg:px-4 py-2 lg:py-2 text-sm lg:text-base font-semibold transition-colors duration-200 
                                    ${activeTab === "manual"
                                        ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}>
                                Manual
                            </button> */}
                            {/* <button
                                onClick={() => setActiveTab("scanQR")}
                                className={`px-3 lg:px-4 py-2 lg:py-2 text-sm lg:text-base font-semibold 
                                    ${activeTab === "scanQR"
                                        ? "text-purple-600 border-b-2 border-purple-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                            >
                                Scan QR
                            </button> */}
                        </div>

                        {/* Content Area */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6">                            
                            <MeasurableBills/>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-center" autoClose={3000}/>
        </div>
    );
}