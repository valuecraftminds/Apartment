import { Plus, Eye, Edit, Trash2, Download, Search, Filter } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import GenerateSharedValueBill from './GenerateSharedValueBill';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function GenerateBills() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [generatedBills, setGeneratedBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBillType, setFilterBillType] = useState('');

    const loadGeneratedBills = async () => {
        try {
            setLoading(true);
            const response = await api.get('/generate-bills');
            if (response.data.success) {
                setGeneratedBills(response.data.data);
            }
        } catch (error) {
            console.error('Error loading generated bills:', error);
            toast.error('Failed to load generated bills');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGeneratedBills();
    }, []);

    const handleAddNew = () => {
        setShowCreateModal(true);
    }

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleGenerateBill = (newBills) => {
        if (newBills && newBills.length > 0) {
            setGeneratedBills(prev => [...newBills, ...prev]);
        }
        loadGeneratedBills(); // Reload to get all data
        setShowCreateModal(false);
    }

    const handleDeleteBill = async (billId) => {
        if (!window.confirm('Are you sure you want to delete this generated bill?')) {
            return;
        }

        try {
            const response = await api.delete(`/generate-bills/${billId}`);
            if (response.data.success) {
                toast.success('Generated bill deleted successfully');
                loadGeneratedBills(); // Reload the list
            }
        } catch (error) {
            console.error('Error deleting generated bill:', error);
            toast.error('Failed to delete generated bill');
        }
    }

    // const handleViewDetails = (bill) => {
    //     // You can implement a modal or navigate to details page
    //     console.log('View bill details:', bill);
    //     // For now, just show an alert with details
    //     alert(`Bill Details:\n\nName: ${bill.bill_name}\nType: ${bill.billtype}\nPeriod: ${bill.month} ${bill.year}\nTotal Amount: $${bill.totalAmount || 'N/A'}\nAssigned Houses: ${bill.assignedHouses || 'N/A'}`);
    // }

    // Filter bills based on search and bill type
    const filteredBills = generatedBills.filter(bill => {
        const matchesSearch = bill.bill_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            bill.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            bill.year?.toString().includes(searchTerm);
        
        const matchesType = !filterBillType || bill.billtype === filterBillType;
        
        return matchesSearch && matchesType;
    });

    // Get unique bill types for filter
    const billTypes = [...new Set(generatedBills.map(bill => bill.billtype))].filter(Boolean);

    return (
        <div className='flex-1 overflow-y-auto p-6'>
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6'>
                    {/* <div className='flex items-center'>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Generated Bills</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                View and manage all generated bills
                            </p>
                        </div>
                    </div> */}
                    <button 
                        onClick={handleAddNew}
                        className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                        <Plus size={20} />
                        <span>Generate Bills</span>
                    </button>
                </div>

                {/* Filters and Search */}
                {/* <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4"> */}
                        {/* Search */}
                        {/* <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by bill name, month, or year..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div> */}
                        
                        {/* Bill Type Filter */}
                        {/* <div className="sm:w-48">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <select
                                    value={filterBillType}
                                    onChange={(e) => setFilterBillType(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white appearance-none"
                                >
                                    <option value="">All Types</option>
                                    {billTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div> */}

                        {/* Refresh Button */}
                        {/* <button
                            onClick={loadGeneratedBills}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <Download size={20} />
                            <span>Refresh</span>
                        </button> */}
                    {/* </div>
                </div> */}

                {/* Generated Bills List */}
                <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300'>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Generated Bills ({filteredBills.length})
                    </h2>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading generated bills...</span>
                        </div>
                    ) : filteredBills.length === 0 ? (
                        <div className="text-center py-12">
                            <Plus size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No generated bills found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {generatedBills.length === 0 ? 'No bills have been generated yet.' : 'No bills match your search criteria.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBills.map((bill) => (
                                <div key={bill.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                                                        {bill.bill_name || 'Unnamed Bill'}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Type: <span className="font-medium text-purple-600 dark:text-purple-400">{bill.billtype || 'N/A'}</span>
                                                        </span>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Period: <span className="font-medium">{bill.month} {bill.year}</span>
                                                        </span>
                                                        {bill.totalAmount && (
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                Total Amount: <span className="font-medium text-green-600 dark:text-green-400">${bill.totalAmount}</span>
                                                            </span>
                                                        )}
                                                        {bill.assignedHouses && (
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                Houses: <span className="font-medium">{bill.assignedHouses}</span>
                                                            </span>
                                                        )}
                                                        {bill.unitPrice && (
                                                            <span className="text-gray-600 dark:text-gray-400">
                                                                Unit Price: <span className="font-medium text-green-600 dark:text-green-400">${bill.unitPrice}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                                        bill.totalAmount 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                                                    }`}>
                                                        {bill.totalAmount ? 'Calculated' : 'Generated'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Unit Prices Display */}
                                            {bill.unitPrices && (
                                                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Unit Prices:
                                                    </h4>
                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                        {typeof bill.unitPrices === 'string' 
                                                            ? bill.unitPrices 
                                                            : JSON.stringify(bill.unitPrices)
                                                        }
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center mt-3">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Generated on: {new Date(bill.created_at).toLocaleDateString()} at {new Date(bill.created_at).toLocaleTimeString()}
                                                </p>
                                                
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => {/* Implement edit functionality */}}
                                                        className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                                        title="Edit Bill"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBill(bill.id)}
                                                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                        title="Delete Bill"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary Statistics */}
                    {/* {filteredBills.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="font-semibold text-blue-700 dark:text-blue-300 text-lg">
                                        {filteredBills.length}
                                    </div>
                                    <div className="text-blue-600 dark:text-blue-400">
                                        Total Bills
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="font-semibold text-green-700 dark:text-green-300 text-lg">
                                        ${filteredBills.reduce((sum, bill) => sum + (parseFloat(bill.totalAmount) || 0), 0).toFixed(2)}
                                    </div>
                                    <div className="text-green-600 dark:text-green-400">
                                        Total Amount
                                    </div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <div className="font-semibold text-purple-700 dark:text-purple-300 text-lg">
                                        {billTypes.length}
                                    </div>
                                    <div className="text-purple-600 dark:text-purple-400">
                                        Bill Types
                                    </div>
                                </div>
                            </div>
                        </div>
                    )} */}
                </div>
            </div>

            {/* Generate Bills Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                        >
                            ✖
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                            Generate New Bills
                        </h2>
                        <GenerateSharedValueBill
                            onClose={handleCloseModal}
                            onCreated={handleGenerateBill}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}