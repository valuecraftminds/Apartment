import React, { useState, useEffect } from 'react'
import api from '../api/axios';

export default function GenerateSharedValueBill({ onClose, onCreated }) {
    const [loadingBills, setLoadingBills] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [assignedHousesCount, setAssignedHousesCount] = useState(0);
    const [unitPrice, setUnitPrice] = useState(0);
    const [loadingHouses, setLoadingHouses] = useState(false);

    // Load only Shared bills
    const loadBills = async () => {
        try {
            setLoadingBills(true);
            setError(null);
            const result = await api.get('/bills');
            if (result.data.success && Array.isArray(result.data.data)) {
                // Filter only Shared bills
                const sharedBills = result.data.data.filter(bill => bill.billtype === 'Shared');
                setBills(sharedBills);
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

    // Fetch assigned houses count when bill is selected
    const fetchAssignedHousesCount = async (billId) => {
        if (!billId) return;
        
        try {
            setLoadingHouses(true);
            // Assuming you have an endpoint to get assigned houses count for a bill
            const response = await api.get(`/bill-assignments/bill/${billId}/count`);
            if (response.data.success) {
                const count = response.data.data.count || 0;
                setAssignedHousesCount(count);
                
                // Calculate unit price if total amount is set
                if (totalAmount && count > 0) {
                    const calculatedUnitPrice = parseFloat(totalAmount) / count;
                    setUnitPrice(calculatedUnitPrice);
                } else {
                    setUnitPrice(0);
                }
            }
        } catch (error) {
            console.error('Error fetching assigned houses count:', error);
            setAssignedHousesCount(0);
            setUnitPrice(0);
        } finally {
            setLoadingHouses(false);
        }
    };

    // Handle bill selection
    const handleBillChange = (billId) => {
        setSelectedBill(billId);
        if (billId) {
            fetchAssignedHousesCount(billId);
        } else {
            setAssignedHousesCount(0);
            setUnitPrice(0);
        }
    };

    // ADD THIS MISSING FUNCTION - Handle total amount change and recalculate unit price
    const handleTotalAmountChange = (amount) => {
        setTotalAmount(amount);
        
        if (amount && assignedHousesCount > 0) {
            const calculatedUnitPrice = parseFloat(amount) / assignedHousesCount;
            setUnitPrice(calculatedUnitPrice);
        } else {
            setUnitPrice(0);
        }
    };

    const handleGenerateBill = async () => {
        if (!selectedBill) {
            setError('Please select a bill.');
            return;
        }

        if (!totalAmount || parseFloat(totalAmount) <= 0) {
            setError('Please enter a valid total amount.');
            return;
        }

        if (assignedHousesCount === 0) {
            setError('No houses assigned to this bill. Cannot generate bill.');
            return;
        }

        try {
            setGenerating(true);
            setError(null);

            const billData = {
                bill_id: selectedBill,
                year: year,
                month: month,
                totalAmount: parseFloat(totalAmount),
                assignedHouses: assignedHousesCount,
                unitPrice: unitPrice // Send just the numeric value
            };

            const response = await api.post('/generate-bills', billData);
            
            if (response.data.success) {
                onCreated([response.data.data]);
                // You need to import toast or use a different notification method
                // toast.success('Bill generated successfully!');
            } else {
                setError(response.data.message || 'Failed to generate bill');
            }

        } catch (err) {
            console.error('Error generating bill:', err);
            setError(err.response?.data?.message || 'Failed to generate bill. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    // Get selected bill name for display
    const getSelectedBillName = () => {
        const bill = bills.find(b => b.id === selectedBill);
        return bill ? bill.bill_name : '';
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Year and Month Selection */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Year *
                    </label>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                        {[2023, 2024, 2025].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Month *
                    </label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                        {['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bill Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Shared Bill *
                </label>
                <select
                    value={selectedBill}
                    onChange={(e) => handleBillChange(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700  border-purple-600 dark:bg-gray-800 border dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500  dark:text-white"
                    disabled={loadingBills}
                >
                    <option value="">Select a Shared Bill</option>
                    {bills.map(bill => (
                        <option key={bill.id} value={bill.id}>{bill.bill_name}</option>
                    ))}
                </select>
                {loadingBills && (
                    <p className="text-xs text-gray-500 mt-1">Loading bills...</p>
                )}
            </div>

            {/* Total Amount Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Amount ($) *
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalAmount}
                    onChange={(e) => handleTotalAmountChange(e.target.value)} 
                    placeholder="Enter total amount"
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Calculation Summary */}
            {(selectedBill && assignedHousesCount > 0) && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                        Calculation Summary
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Selected Bill:</span>
                            <p className="font-medium text-gray-800 dark:text-white">{getSelectedBillName()}</p>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Assigned Houses:</span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {loadingHouses ? (
                                    <span className="text-xs text-gray-500">Loading...</span>
                                ) : (
                                    assignedHousesCount
                                )}
                            </p>
                        </div>
                    </div>

                    {totalAmount && assignedHousesCount > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                                    <p className="font-medium text-green-600 dark:text-green-400">${parseFloat(totalAmount).toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
                                    <p className="font-medium text-purple-600 dark:text-purple-400">${unitPrice.toFixed(2)}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Calculation: ${totalAmount} ÷ {assignedHousesCount} houses = ${unitPrice.toFixed(2)} per house
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* No assigned houses warning */}
            {selectedBill && !loadingHouses && assignedHousesCount === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        ⚠️ No houses are assigned to this bill. Please assign houses before generating.
                    </p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                    disabled={generating}
                >
                    Cancel
                </button>
                <button
                    onClick={handleGenerateBill}
                    disabled={!selectedBill || !totalAmount || assignedHousesCount === 0 || generating}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                    {generating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Generating...</span>
                        </>
                    ) : (
                        <span>Generate Bill</span>
                    )}
                </button>
            </div>
        </div>
    );
}