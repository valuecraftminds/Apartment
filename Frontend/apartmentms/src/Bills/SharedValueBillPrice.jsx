import React, { useState, useEffect } from 'react';
import { ChevronLeft, FileText, Plus, Edit, Trash2, Loader } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CreateSharedValueBillPrice from './CreateSharedValueBillPrice';

export default function SharedValueBillPrice() {
    const { bill_id } = useParams();
    const navigate = useNavigate();

    const [sharedValuePrices, setSharedValuePrices] = useState([]);
    const [billInfo, setBillInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingBill, setLoadingBill] = useState(false);
    const [error, setError] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBillPrice, setEditingBillPrice] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingPrice, setDeletingPrice] = useState(null);

    // Load bill information
    const loadBillInfo = async () => {
        try {
            setLoadingBill(true);
            const response = await api.get(`/bills/${bill_id}`);
            if (response.data.success) {
                setBillInfo(response.data.data);
            }
        } catch (err) {
            console.error('Error loading bill info:', err);
        } finally {
            setLoadingBill(false);
        }
    };

    // Load shared value prices
    const loadSharedValuePrices = async () => {
        try {
            setLoading(true);
            setError(null);
            
            if (!bill_id) {
                setError('Bill ID is required');
                return;
            }

            const response = await api.get(`/shared-value-prices/bill/${bill_id}`);
            
            if (response.data.success) {
                setSharedValuePrices(response.data.data || []);
            } else {
                setError('Failed to load shared value prices');
                setSharedValuePrices([]);
            }
        } catch (err) {
            console.error('Error loading shared value prices:', err);
            setError('Failed to load shared value prices. Please try again.');
            setSharedValuePrices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (bill_id) {
            loadBillInfo();
            loadSharedValuePrices();
        }
    }, [bill_id]);

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    // Update your handleCreateSuccess function in SharedValueBillPrice.jsx
const handleCreateSuccess = () => {
    console.log('handleCreateSuccess called'); // Debug log
    setShowCreateModal(false);
    toast.success('Shared value price created successfully');
    loadSharedValuePrices(); // Make sure this is called
};

// Also update your useEffect to see if it's loading properly
useEffect(() => {
    console.log('bill_id changed:', bill_id); // Debug log
    if (bill_id) {
        loadBillInfo();
        loadSharedValuePrices();
    }
}, [bill_id]);

    // Handle edit success
    const handleEditSuccess = () => {
        loadSharedValuePrices();
        setShowEditModal(false);
        setEditingBillPrice(null);
        toast.success('Shared value price updated successfully');
    };

    // Handle edit click
    const handleEditClick = (price) => {
        setEditingBillPrice(price);
        setShowEditModal(true);
    };

    // Handle delete click
    const handleDeleteClick = (price) => {
        setDeletingPrice(price);
        setShowDeleteModal(true);
    };

    // Confirm delete
    const handleConfirmDelete = async () => {
        try {
            if (!deletingPrice) return;
            
            await api.delete(`/shared-value-prices/${deletingPrice.id}`);
            toast.success('Shared value price deleted successfully');
            setShowDeleteModal(false);
            setDeletingPrice(null);
            loadSharedValuePrices();
        } catch (err) {
            console.error('Delete shared value price error:', err);
            toast.error('Failed to delete shared value price');
        }
    };

    // Cancel delete
    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeletingPrice(null);
    };

    // Format month name
    const formatMonth = (monthNumber) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthNumber - 1] || monthNumber;
    };

    // Format currency
    // const formatCurrency = (amount) => {
    //     return new Intl.NumberFormat('en-LK', {
    //         style: 'currency',
    //         currency: 'LKR',
    //         minimumFractionDigits: 2
    //     }).format(amount);
    // };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <Sidebar onCollapse={setIsSidebarCollapsed} />

            <div
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
                    isSidebarCollapsed ? "ml-20" : "ml-64"
                }`}
            >
                <Navbar />

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6">
                            <div className="flex items-center">
                                <button
                                    onClick={handleBack}
                                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-700 transition mr-3"
                                >
                                    <ChevronLeft size={25} />
                                </button>
                                <FileText
                                    size={40}
                                    className="text-purple-600 dark:text-purple-400 mr-3"
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Shared Value Bill Amounts 
                                    </h1>
                                    {billInfo && (
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                            {billInfo.bill_name} - {billInfo.billtype}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {/* <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Total Prices</p>
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {sharedValuePrices.length}
                                </p>
                            </div> */}
                        </div>

                        {/* Content */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                disabled={!bill_id}
                                className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white ${
                                    !bill_id 
                                        ? 'bg-purple-400 cursor-not-allowed' 
                                        : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
                                }`}
                            >
                                <Plus size={20} />
                                <span>Set Shared Value Price</span>
                            </button>

                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader size={32} className="animate-spin text-purple-600" />
                                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                                        Loading Shared Value Prices...
                                    </span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 text-red-600 dark:text-red-400">
                                    {error}
                                    <button
                                        onClick={loadSharedValuePrices}
                                        className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : sharedValuePrices.length === 0 ? (
                                <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                                    <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg">No Shared Value Prices Found</p>
                                    <p className="text-sm">Add new shared value prices for this bill.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    No
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Year
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Month
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Amount
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Created At
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {sharedValuePrices.map((price, index) => (
                                                <tr key={price.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {index + 1}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {price.year}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                        {formatMonth(price.month)}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                                                        {price.amount}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {new Date(price.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEditClick(price)}
                                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteClick(price)}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <CreateSharedValueBillPrice
                    bill_id={bill_id}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            {/* Edit Modal */}
            {showEditModal && editingBillPrice && (
                <EditSharedValuePriceModal
                    price={editingBillPrice}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingBillPrice(null);
                    }}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingPrice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete the shared value price for {formatMonth(deletingPrice.month)} {deletingPrice.year}?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={handleCancelDelete}
                                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}
