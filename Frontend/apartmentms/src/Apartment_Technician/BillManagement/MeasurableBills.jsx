import React, { useState, useEffect, useContext } from 'react';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function MeasurableBills() {
    const [loadingBills, setLoadingBills] = useState(false);
    const [error, setError] = useState(null);
    const [bills, setBills] = useState([]);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    // Load all bills
    const loadBills = async () => {
        try {
            setLoadingBills(true);
            setError(null);
            const result = await api.get('/bills');
            
            // Corrected data structure based on your backend
            if (result.data.success && Array.isArray(result.data.data)) {
                setBills(result.data.data);
            } else {
                setBills([]);
            }
        } catch (err) {
            console.error('Error loading bills:', err);
            setError('Failed to load bills. Please try again.');
        } finally {
            setLoadingBills(false);
        }
    };

    useEffect(() => {
        loadBills();
    }, []);

    // Filter bills - Only show Measurable bills
    const measurableBills = bills.filter(bill => bill.billtype === 'Measurable');

    // Loading state
    if (loadingBills) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
                <Sidebar />
                <div className="flex-1 flex flex-col lg:ml-0">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bills...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
                <Sidebar />
                <div className="flex-1 flex flex-col lg:ml-0">
                    <Navbar />
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="text-center">
                            <div className="text-red-500 text-lg mb-2">⚠️</div>
                            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                            <button
                                onClick={loadBills}
                                className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-0">
                {/* Navbar */}
                <Navbar />
                
                {/* Page Content */}
                <main className="flex-1 p-6 ml-16">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Measurable Bills</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {measurableBills.length} bill{measurableBills.length !== 1 ? 's' : ''} found
                        </p>
                    </div>

                    {/* Bills List */}
                    {measurableBills.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-4">📄</div>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">No measurable bills found</p>
                            <p className="text-gray-400 dark:text-gray-500 mt-1">
                                {bills.length > 0 
                                    ? `${bills.length} bills loaded but none are marked as measurable.` 
                                    : 'No bills available.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {measurableBills.map((bill) => (
                                <div
                                    key={bill.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                                >
                                    {/* Bill Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                {bill.bill_name || 'Unnamed Bill'}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Bill Details */}
                                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Company ID</p>
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {bill.company_id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 dark:text-gray-400">Type</p>
                                            <p className="font-medium text-blue-600 dark:text-blue-400">
                                                {bill.billtype}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>Metered: {bill.is_metered ? 'Yes' : 'No'}</span>
                                            <span>
                                                Created: {bill.created_at ? new Date(bill.created_at).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex space-x-2">
                                        <button 
                                            className="flex-1 bg-purple-700 dark:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                                            onClick={() => navigate(`/calculate-measurable-bill/${bill.id}`)}
                                        >
                                            Calculate
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Refresh Button */}
                    <div className="fixed bottom-6 right-6 z-40">
                        <button
                            onClick={loadBills}
                            className="bg-blue-600 dark:bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
}