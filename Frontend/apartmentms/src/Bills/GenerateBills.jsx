//GenerateBills.jsx
import { Plus, Eye, Edit, Trash2, Download, Search, Filter } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import GenerateSharedValueBill from './GenerateSharedValueBill';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import ViewSharedValueBillDetails from './ViewSharedValueBillDetails';

export default function GenerateBills() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [generatedBills, setGeneratedBills] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBillType, setFilterBillType] = useState('');
    const [apartments, setApartments] = useState([]);
    const [floors, setFloors] = useState({});
    const [houses, setHouses] = useState({});
    const [loadingApartments, setLoadingApartments] = useState(false);
    const [loadingFloors, setLoadingFloors] = useState({});
    const [loadingHouses, setLoadingHouses] = useState({});
    const [apartmentMap, setApartmentMap] = useState({});
    const [floorMap, setFloorMap] = useState({});
    const [houseMap, setHouseMap] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [billToDelete, setBillToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [billToView, setBillToView] = useState(null);

    const loadGeneratedBills = async () => {
        try {
            setLoading(true);
            const response = await api.get('/generate-bills');
            if (response.data.success) {
                setGeneratedBills(response.data.data);
                // Load apartment, floor, and house data for the generated bills
                loadLocationData(response.data.data);
            }
        } catch (error) {
            console.error('Error loading generated bills:', error);
            toast.error('Failed to load generated bills');
        } finally {
            setLoading(false);
        }
    };

    // Load apartment, floor, and house data for the generated bills
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
        return apartmentMap[apartmentId] || apartmentId || 'All Apartments';
    };

    // Get floor name by ID
    const getFloorName = (floorId) => {
        return floorMap[floorId] || floorId || 'All Floors';
    };

    // Get house name by ID
    const getHouseName = (houseId) => {
        return houseMap[houseId] || houseId || 'All Houses';
    };

    // Check if bill is for specific location (apartment/floor/house)
    const getLocationScope = (bill) => {
        if (bill.house_id) {
            return 'House';
        } else if (bill.floor_id) {
            return 'Floor';
        } else if (bill.apartment_id) {
            return 'Apartment';
        }
        return 'Global';
    };

    // Get location display text
    const getLocationDisplay = (bill) => {
        const scope = getLocationScope(bill);
        switch (scope) {
            case 'House':
                return `${getApartmentName(bill.apartment_id)} → ${getFloorName(bill.floor_id)} → ${getHouseName(bill.house_id)}`;
            case 'Floor':
                return `${getApartmentName(bill.apartment_id)} → ${getFloorName(bill.floor_id)}`;
            case 'Apartment':
                return getApartmentName(bill.apartment_id);
            default:
                return 'All Locations';
        }
    };

    useEffect(() => {
        loadGeneratedBills();
        loadApartments();
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
            // Reload location data for new bills
            loadLocationData(newBills);
        }
        loadGeneratedBills(); // Reload to get all data
        setShowCreateModal(false);
    }

     const handleViewClick = (bill) => {
        setBillToView(bill);
        setShowViewModal(true);
    };

    const handleCloseViewModal = () => {
        setShowViewModal(false);
        setBillToView(null);
    };

    const handleDeleteClick = (bill) => {
        setBillToDelete(bill);
        setShowDeleteModal(true);
    }

    const handleDeleteBill = async () => {
        if (!billToDelete) return;

        try {
            setDeleting(true);
            const response = await api.delete(`/generate-bills/${billToDelete.id}`);
            if (response.data.success) {
                toast.success('Generated bill deleted successfully');
                // Remove from local state
                setGeneratedBills(prev => prev.filter(bill => bill.id !== billToDelete.id));
            }
        } catch (error) {
            console.error('Error deleting generated bill:', error);
            toast.error(error.response?.data?.message || 'Failed to delete generated bill');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setBillToDelete(null);
        }
    }

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setBillToDelete(null);
    }

    const loadApartments = async () => {
        try {
            setLoadingApartments(true);
            const result = await api.get('/apartments');
            if (result.data.success) {
                setApartments(result.data.data || []);
                // Also update apartment map
                const apartmentData = {};
                result.data.data.forEach(apt => {
                    apartmentData[apt.id] = apt.name;
                });
                setApartmentMap(apartmentData);
            }
        } catch (err) {
            console.error('Error loading apartments:', err);
            toast.error('Failed to load apartments');
        } finally {
            setLoadingApartments(false);
        }
    };

    // Load floors for a specific apartment
    const loadFloorsForApartment = async (apartmentId) => {
        if (!apartmentId) return;
        
        try {
            setLoadingFloors(prev => ({ ...prev, [apartmentId]: true }));
            const result = await api.get(`/floors?apartment_id=${apartmentId}`);
            if (result.data.success) {
                const floorsData = result.data.data || [];
                setFloors(prev => ({
                    ...prev,
                    [apartmentId]: floorsData
                }));
                // Update floor map
                const floorData = { ...floorMap };
                floorsData.forEach(floor => {
                    floorData[floor.id] = floor.name;
                });
                setFloorMap(floorData);
            }
        } catch (err) {
            console.error('Error loading floors:', err);
            toast.error('Failed to load floors');
        } finally {
            setLoadingFloors(prev => ({ ...prev, [apartmentId]: false }));
        }
    };

    // Load houses for a specific floor
    const loadHousesForFloor = async (apartmentId, floorId) => {
        if (!apartmentId || !floorId) return;
        
        try {
            setLoadingHouses(prev => ({ ...prev, [floorId]: true }));
            const result = await api.get(`/houses?apartment_id=${apartmentId}&floor_id=${floorId}`);
            if (result.data.success) {
                const housesData = result.data.data || [];
                setHouses(prev => ({
                    ...prev,
                    [floorId]: housesData
                }));
                // Update house map
                const houseData = { ...houseMap };
                housesData.forEach(house => {
                    houseData[house.id] = house.name;
                });
                setHouseMap(houseData);
            }
        } catch (err) {
            console.error('Error loading houses:', err);
            toast.error('Failed to load houses');
        } finally {
            setLoadingHouses(prev => ({ ...prev, [floorId]: false }));
        }
    };

    // Filter bills based on search and bill type
    const filteredBills = generatedBills.filter(bill => {
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
    const billTypes = [...new Set(generatedBills.map(bill => bill.billtype))].filter(Boolean);

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
                            <button 
                                onClick={handleAddNew}
                                className='flex items-center gap-2 px-4 py-2 ml-4 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'
                            >
                                <Plus size={20} />
                                <span>Generate Bills</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Generated Bills List - SIMPLIFIED */}
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
                                                <div className="flex-1">
                                                    {/* SIMPLIFIED: Only show Bill Name, Type, and Month */}
                                                    <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                                                        {bill.bill_name || 'Unnamed Bill'}
                                                    </h3>
                                                    
                                                    <div className="flex flex-wrap gap-4 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                                            <span className="font-medium text-purple-600 dark:text-purple-400">
                                                                {bill.billtype || 'N/A'}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-600 dark:text-gray-400">Period:</span>
                                                            <span className="font-medium">
                                                                {bill.month} {bill.year}
                                                            </span>
                                                        </div>
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
                                            
                                            <div className="flex justify-between items-center mt-4">
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Generated: {new Date(bill.created_at).toLocaleDateString()}
                                                </p>
                                                
                                                <div className="flex space-x-2">
                                                    {/* View button to show details modal */}
                                                    <button
                                                        onClick={() => handleViewClick(bill)}
                                                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                                        title="View Bill Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>                                                    
                                                    <button
                                                        onClick={() => handleDeleteClick(bill)}
                                                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
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

            {/* View Bill Details Modal */}
            {showViewModal && billToView && (
                <ViewSharedValueBillDetails
                    bill={billToView}
                    onClose={handleCloseViewModal}
                    getApartmentName={getApartmentName}
                    getFloorName={getFloorName}
                    getHouseName={getHouseName}
                    getLocationScope={getLocationScope}
                    getLocationDisplay={getLocationDisplay}
                />
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
                                    Delete Generated Bill
                                </h3>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to delete this generated bill? This action cannot be undone.
                                {billToDelete.assignedHouses > 0 && (
                                    <span className="block mt-2 text-red-600 dark:text-red-400 text-sm">
                                        Warning: This bill is assigned to {billToDelete.assignedHouses} house(s). Deleting it may affect related payments.
                                    </span>
                                )}
                            </p>
                            
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                                    Bill Details
                                </h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Bill Name:</span>
                                        <span className="font-medium">{billToDelete.bill_name || 'Unnamed Bill'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Type:</span>
                                        <span className="font-medium text-purple-600 dark:text-purple-400">{billToDelete.billtype || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Period:</span>
                                        <span className="font-medium">{billToDelete.month} {billToDelete.year}</span>
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