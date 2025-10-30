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

export default function BillsAndCalculations() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("bills"); // NEW: tab state
    const navigate = useNavigate();
    const { apartment_id } = useParams();
    const [apartment, setApartment] = useState(null);

    // useEffect(() => {
    //     const fetchApartment = async () => {
    //         try {
    //             const res = await api.get(`/apartments/${apartment_id}`);
    //             if (res.data.success) {
    //                 setApartment(res.data.data); // set the apartment object
    //             }
    //         } catch (err) {
    //             console.error('Error fetching apartment:', err);
    //         }
    //     };
    //     if (apartment_id) fetchApartment();
    // }, [apartment_id]);

    // const handleBack = () => {
    //     navigate('/manage-bills');
    // };



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
                            {/* <button onClick={handleAddNew} className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                                <Plus size={20}/>
                                <span>Add New</span>
                            </button> */}
                            {/* {apartment && (
                                <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                    Apartment: {apartment.name}
                                </div>
                            )} */}
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
                        {/* <button
                            onClick={() => setActiveTab("calculateBill")}
                            className={`px-4 py-2 font-semibold 
                                ${activeTab === "calculateBill"
                                    ? "text-purple-600 border-b-2 border-purple-600"
                                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                        >
                            Manage Bills For Each House
                        </button> */}
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
                    {activeTab === "calculateBill" && (
                        <CalculateBill/>
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
