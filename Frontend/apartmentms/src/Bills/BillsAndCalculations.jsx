import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar';
import { ChevronLeft, Receipt } from 'lucide-react';
import Bills from './Bills';
import ManageBills from './ManageBills';
import CalculateBill from './CalculateBill';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { ToastContainer } from 'react-toastify';
import GenerateBills from './GenerateBills';

export default function BillsAndCalculations() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("bills");
    const navigate = useNavigate();
    const { apartment_id } = useParams();
    const [apartment, setApartment] = useState(null);

  return (
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
        <Sidebar onCollapse={setIsSidebarCollapsed}/>
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <Navbar/>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl">
                    <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                        <div className='flex flex-col'>
                            <div className='flex items-center'>
                                {/* <button onClick={handleBack} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                                    <ChevronLeft size={25} />
                                </button> */}
                                <Receipt size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bill Management for Apartments</h1>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-6">
                        <button
                            onClick={() => setActiveTab("bills")}
                            className={`px-4 py-2 font-semibold transition-colors duration-200 
                                ${activeTab === "bills"
                                    ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400"
                                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}>
                            Bill Type
                        </button>
                        <button
                            onClick={() => setActiveTab("generateBill")}
                            className={`px-4 py-2 font-semibold 
                                ${activeTab === "generateBill"
                                    ? "text-purple-600 border-b-2 border-purple-600"
                                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                        >
                            Generate Bills
                        </button>
                        {/* <button
                            onClick={() => setActiveTab("calculateBillApartment")}
                            className={`px-4 py-2 font-semibold 
                                ${activeTab === "calculateBillApartment"
                                    ? "text-purple-600 border-b-2 border-purple-600"
                                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                        >
                            Manage Bills for Whole Apartment 
                        </button> */}
                    </div>

                    {activeTab === "bills" &&  (
                        <Bills/>
                    )}
                    {activeTab === "generateBill" && (
                        <GenerateBills/>
                    )}
                    {activeTab === 'calculateBillApartment' && (
                        <ManageBills/>
                    )}
                </div>
            </div>
        </div>
        <ToastContainer position="top-center" autoClose={3000}/>
    </div>
  )
}
