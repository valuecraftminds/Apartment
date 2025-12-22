import { Plus, Eye, Edit, Trash2, Search, Filter, Download } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';

export default function ViewMeasurableBills() {
    const [measurableBills, setMeasurableBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBillType, setFilterBillType] = useState('');
    const [apartments, setApartments] = useState([]);
    const [floors, setFloors] = useState({});
    const [houses, setHouses] = useState({});
    const [apartmentMap, setApartmentMap] = useState({});
    const [floorMap, setFloorMap] = useState({});
    const [houseMap, setHouseMap] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const loadMeasurableBills = async () => {
        try {
            setLoading(true);
            const response = await api.get('/generate-measurable-bills');
            if (response.data.success) {
                setMeasurableBills(response.data.data);
                // Load apartment, floor, and house data for the bills
                loadLocationData(response.data.data);
            }
        } catch (error) {
            console.error('Error loading measurable bills:', error);
            toast.error('Failed to load measurable bills');
        } finally {
            setLoading(false);
        }
    };

    // Load apartment, floor, and house data for the bills
    const loadLocationData = async (bills) => {
        const uniqueApartments = [...new Set(bills.map(bill => bill.apartment_id).filter(Boolean))];
        const uniqueFloors = [...new Set(bills.map(bill => bill.floor_id).filter(Boolean))];
        const uniqueHouses = [...new Set(bills.map(bill => bill.house_id).filter(Boolean))];

        // Load apartments
        if (uniqueApartments.length > 0) {
            try {
                const apartmentResponse = await api.get('/apartments');
                if (apartmentResponse.data.success) {
                    const apartmentData = {};
                    apartmentResponse.data.data.forEach(apt => {
                        apartmentData[apt.id] = apt.name;
                    });
                    setApartmentMap(apartmentData);
                }
            } catch (error) {
                console.error('Error loading apartments:', error);
            }
        }

        // Load floors
        for (const floorId of uniqueFloors) {
            if (floorId && !floorMap[floorId]) {
                try {
                    const floorResponse = await api.get(`/floors/${floorId}`);
                    if (floorResponse.data.success) {
                        setFloorMap(prev => ({
                            ...prev,
                            [floorId]: floorResponse.data.data.floor_id
                        }));
                    }
                } catch (error) {
                    console.error('Error loading floor:', error);
                }
            }
        }

        // Load houses
        for (const houseId of uniqueHouses) {
            if (houseId && !houseMap[houseId]) {
                try {
                    const houseResponse = await api.get(`/houses/${houseId}`);
                    if (houseResponse.data.success) {
                        setHouseMap(prev => ({
                            ...prev,
                            [houseId]: houseResponse.data.data.house_id
                        }));
                    }
                } catch (error) {
                    console.error('Error loading house:', error);
                }
            }
        }
    };

    // Get apartment name by ID
    const getApartmentName = (apartmentId) => {
        return apartmentMap[apartmentId] || apartmentId || 'N/A';
    };

    // Get floor name by ID
    const getFloorName = (floorId) => {
        return floorMap[floorId] || floorId || 'N/A';
    };

    // Get house name by ID
    const getHouseName = (houseId) => {
        return houseMap[houseId] || houseId || 'N/A';
    };

    // Get location display text
    const getLocationDisplay = (bill) => {
        if (bill.house_id) {
            return `${getApartmentName(bill.apartment_id)} → ${getFloorName(bill.floor_id)} → ${getHouseName(bill.house_id)}`;
        } else if (bill.floor_id) {
            return `${getApartmentName(bill.apartment_id)} → ${getFloorName(bill.floor_id)}`;
        } else if (bill.apartment_id) {
            return getApartmentName(bill.apartment_id);
        }
        return 'Global';
    };

    useEffect(() => {
        loadMeasurableBills();
    }, []);

    const handleViewDetails = (bill) => {
        setSelectedBill(bill);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedBill(null);
    };

    const handleDeleteClick = (bill) => {
        setBillToDelete(bill);
        setShowDeleteModal(true);
    };

    const handleDeleteBill = async () => {
        if (!billToDelete) return;

        try {
            setDeleting(true);
            const response = await api.delete(`/generate-measurable-bills/${billToDelete.id}`);
            if (response.data.success) {
                toast.success('Measurable bill deleted successfully');
                // Remove from local state
                setMeasurableBills(prev => prev.filter(bill => bill.id !== billToDelete.id));
            }
        } catch (error) {
            console.error('Error deleting measurable bill:', error);
            toast.error(error.response?.data?.message || 'Failed to delete measurable bill');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setBillToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setBillToDelete(null);
    };

    // Filter bills based on search
    const filteredBills = measurableBills.filter(bill => {
        const matchesSearch = bill.bill_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            bill.month?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            bill.year?.toString().includes(searchTerm) ||
                            getApartmentName(bill.apartment_id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            getFloorName(bill.floor_id)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            getHouseName(bill.house_id)?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = !filterBillType || bill.billtype === filterBillType;
        
        return matchesSearch && matchesType;
    });

    // Get unique bill types for filter
    const billTypes = [...new Set(measurableBills.map(bill => bill.billtype))].filter(Boolean);

    // Function to download bill details as CSV
    const downloadCSV = () => {
        if (filteredBills.length === 0) {
            toast.info('No bills to download');
            return;
        }

        const headers = ['Bill Name', 'Type', 'Period', 'Location', 'Previous Reading', 'Current Reading', 'Used Units', 'Total Amount', 'Status', 'Generated Date'];
        
        const csvContent = [
            headers.join(','),
            ...filteredBills.map(bill => [
                `"${bill.bill_name || 'N/A'}"`,
                `"${bill.billtype || 'N/A'}"`,
                `"${bill.month} ${bill.year}"`,
                `"${getLocationDisplay(bill)}"`,
                bill.previous_reading,
                bill.current_reading,
                bill.used_units,
                bill.totalAmount,
                bill.payment_status || 'Pending',
                new Date(bill.created_at).toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `measurable-bills-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className='flex-1 overflow-y-auto p-6'>
            <div className="mx-auto max-w-7xl">
                {/* Filters and Search */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="flex flex-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by bill name, month, year, apartment, floor, or house..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-gray-700"
                                />
                            </div>
                            {/* <button 
                                onClick={downloadCSV}
                                className='flex items-center gap-2 px-4 py-2 ml-4 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-green-600 hover:bg-green-700 hover:scale-105'
                                title="Download CSV"
                            >
                                <Download size={20} />
                                <span>Export CSV</span>
                            </button> */}
                        </div>
                        
                        {/* Bill Type Filter */}
                        {/* {billTypes.length > 0 && (
                            <div className="sm:w-48">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <select
                                        value={filterBillType}
                                        onChange={(e) => setFilterBillType(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white appearance-none"
                                    >
                                        <option value="">All Bill Types</option>
                                        {billTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>

                {/* Measurable Bills List */}
                <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300'>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Measurable Bills ({filteredBills.length})
                        </h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {filteredBills.length} of {measurableBills.length} bills
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading measurable bills...</span>
                        </div>
                    ) : filteredBills.length === 0 ? (
                        <div className="text-center py-12">
                            <Search size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No measurable bills found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                {measurableBills.length === 0 ? 'No measurable bills have been generated yet.' : 'No bills match your search criteria.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredBills.map((bill) => (
                                <div key={bill.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                                                        {bill.bill_name || 'Unnamed Bill'}
                                                    </h3>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                                                        <div className="text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Type: </span>
                                                            <span className="font-medium text-purple-600 dark:text-purple-400">
                                                                {bill.billtype || 'N/A'}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Period: </span>
                                                            <span className="font-medium">
                                                                {bill.month} {bill.year}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* <div className="text-sm">
                                                            <span className="text-gray-600 dark:text-gray-400">Location: </span>
                                                            <span className="font-medium text-blue-600 dark:text-blue-400">
                                                                {getLocationDisplay(bill)}
                                                            </span>
                                                        </div> */}
                                                    </div>

                                                    {/* Readings and Amount */}
                                                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                        <div className="text-sm">
                                                            <div className="text-gray-600 dark:text-gray-400">Readings:</div>
                                                            <div className="font-mono">
                                                                {bill.previous_reading} → {bill.current_reading}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="text-sm">
                                                            <div className="text-gray-600 dark:text-gray-400">Used Units:</div>
                                                            <div className="font-semibold text-blue-600 dark:text-blue-400">
                                                                {bill.used_units} units
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="text-sm">
                                                            <div className="text-gray-600 dark:text-gray-400">Total Amount:</div>
                                                            <div className="font-bold text-green-600 dark:text-green-400 text-lg">
                                                                ${bill.totalAmount?.toFixed(2) || '0.00'}
                                                            </div>
                                                        </div>
                                                    </div> */}
                                                </div>                                                
                                            </div>
                                            
                                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Generated: {new Date(bill.created_at).toLocaleDateString()} at {new Date(bill.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleViewDetails(bill)}
                                                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                                        title="View Bill Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                                                                       
                                                    <button
                                                        onClick={() => handleDeleteClick(bill)}
                                                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                                                        title="Delete Bill"
                                                        disabled={bill.payment_status === 'Paid'}
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
                </div>
            </div>

            {/* Bill Details Modal */}
            {showDetailsModal && selectedBill && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Bill Details
                                </h3>
                                <button
                                    onClick={handleCloseDetailsModal}
                                    className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                                >
                                    ✖
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                {/* Basic Information */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                                        {selectedBill.bill_name || 'Unnamed Bill'}
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Bill Type
                                            </label>
                                            <p className="text-gray-900 dark:text-white font-medium">
                                                {selectedBill.billtype || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Period
                                            </label>
                                            <p className="text-gray-900 dark:text-white font-medium">
                                                {selectedBill.month} {selectedBill.year}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Location
                                            </label>
                                            <p className="text-gray-900 dark:text-white font-medium">
                                                {getLocationDisplay(selectedBill)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Readings and Calculation */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                    <h5 className="font-medium text-gray-900 dark:text-white mb-3">
                                        Reading Details
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Previous Reading
                                            </label>
                                            <p className="text-gray-900 dark:text-white font-mono text-lg">
                                                {selectedBill.previous_reading}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Current Reading
                                            </label>
                                            <p className="text-gray-900 dark:text-white font-mono text-lg">
                                                {selectedBill.current_reading}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                                Used Units
                                            </label>
                                            <p className="text-blue-600 dark:text-blue-400 font-bold text-xl">
                                                {selectedBill.used_units} units
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount and Payment Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                        <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                                            Total Amount
                                        </label>
                                        <p className="text-green-700 dark:text-green-300 font-bold text-2xl">
                                            ${selectedBill.totalAmount?.toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    {/* <div className={`rounded-lg p-4 ${
                                        selectedBill.payment_status === 'Paid'
                                            ? 'bg-green-50 dark:bg-green-900/20'
                                            : selectedBill.payment_status === 'Partial'
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                                            : 'bg-red-50 dark:bg-red-900/20'
                                        }`}>
                                        <label className="block text-sm font-medium mb-1 ${
                                            selectedBill.payment_status === 'Paid'
                                                ? 'text-green-700 dark:text-green-300'
                                                : selectedBill.payment_status === 'Partial'
                                                ? 'text-yellow-700 dark:text-yellow-300'
                                                : 'text-red-700 dark:text-red-300'
                                        }`}">
                                            Payment Status
                                        </label>
                                        <p className={`font-bold text-xl ${
                                            selectedBill.payment_status === 'Paid'
                                                ? 'text-green-700 dark:text-green-300'
                                                : selectedBill.payment_status === 'Partial'
                                                ? 'text-yellow-700 dark:text-yellow-300'
                                                : 'text-red-700 dark:text-red-300'
                                        }`}>
                                            {selectedBill.payment_status || 'Pending'}
                                        </p>
                                        {selectedBill.paidAmount > 0 && (
                                            <p className="text-sm mt-1">
                                                Paid: ${selectedBill.paidAmount?.toFixed(2)} / Pending: ${selectedBill.pendingAmount?.toFixed(2)}
                                            </p>
                                        )}
                                    </div> */}
                                </div>

                                {/* Additional Information */}
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Bill Reference:</span>
                                        <span className="font-mono">{selectedBill.id}</span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span>Generated Date:</span>
                                        <span>{new Date(selectedBill.created_at).toLocaleString()}</span>
                                    </div>
                                    {selectedBill.updated_at && (
                                        <div className="flex justify-between mt-1">
                                            <span>Last Updated:</span>
                                            <span>{new Date(selectedBill.updated_at).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleCloseDetailsModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && billToDelete && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3">
                                    <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Delete Measurable Bill
                                </h3>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to delete this measurable bill? This action cannot be undone.
                            </p>
                            
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                                    Bill Details
                                </h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Bill Name:</span>
                                        <span className="font-medium text-gray-600 dark:text-gray-400">{billToDelete.bill_name || 'Unnamed Bill'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                        <span className="font-medium text-purple-600 dark:text-purple-400">{billToDelete.billtype || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Period:</span>
                                        <span className="font-medium text-gray-600 dark:text-gray-400">{billToDelete.month} {billToDelete.year}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">${billToDelete.totalAmount?.toFixed(2) || '0.00'}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteBill}
                                    disabled={deleting}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                                >
                                    {deleting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Bill'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    )
}