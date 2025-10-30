import React, { useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar';
import {Edit, Image, Loader, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import CreateBillType from '../Bills/CreateBillType';
import EditBillType from '../Bills/EditBillType';

export default function Bills() {
    const [loadingBills,setLoadingBills] = useState(false);
    const [error, setError] = useState(null);
    const [bills,setBills] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedBillType, setSelectedBillType] = useState(null);
    const [selectedBillForAssign, setSelectedBillForAssign] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingBill, setDeletingBill] = useState(null);
    const navigate = useNavigate();

    // States for assign modal
    const [apartments, setApartments] = useState([]);
    const [floors, setFloors] = useState([]);
    const [houses, setHouses] = useState([]);
    const [selectedApartment, setSelectedApartment] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('');
    const [selectedHouses, setSelectedHouses] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [loadingApartments, setLoadingApartments] = useState(false);
    const [loadingFloors, setLoadingFloors] = useState(false);
    const [loadingHouses, setLoadingHouses] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const loadBills = async () => {
        try {
            setLoadingBills(true);
            setError(null);
            const result = await api.get('/bills');
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

    useEffect(()=>{
        loadBills();
    },[]);

    // Load apartments for assign modal
    const loadApartments = async () => {
        try {
            setLoadingApartments(true);
            const result = await api.get('/apartments');
            if (result.data.success) {
                setApartments(result.data.data || []);
            }
        } catch (err) {
            console.error('Error loading apartments:', err);
            toast.error('Failed to load apartments');
        } finally {
            setLoadingApartments(false);
        }
    };

    // Load floors based on selected apartment
    const loadFloors = async (apartmentId) => {
        if (!apartmentId) {
            setFloors([]);
            setSelectedFloor('');
            return;
        }
        try {
            setLoadingFloors(true);
            const result = await api.get(`/floors?apartment_id=${apartmentId}`);
            if (result.data.success) {
                setFloors(result.data.data || []);
            }
        } catch (err) {
            console.error('Error loading floors:', err);
            toast.error('Failed to load floors');
        } finally {
            setLoadingFloors(false);
        }
    };

    // Load houses based on selected floor
    const loadHouses = async (apartmentId, floorId) => {
        if (!apartmentId || !floorId) {
            setHouses([]);
            setSelectedHouses([]);
            return;
        }
        try {
            setLoadingHouses(true);
            const result = await api.get(`/houses?apartment_id=${apartmentId}&floor_id=${floorId}`);
            if (result.data.success) {
                const housesData = result.data.data || [];
                setHouses(housesData);
                setSelectedHouses([]);
                setSelectAll(false);
            }
        } catch (err) {
            console.error('Error loading houses:', err);
            toast.error('Failed to load houses');
        } finally {
            setLoadingHouses(false);
        }
    };

    // Handle apartment selection
    const handleApartmentChange = (e) => {
        const apartmentId = e.target.value;
        setSelectedApartment(apartmentId);
        setSelectedFloor('');
        setFloors([]);
        setHouses([]);
        setSelectedHouses([]);
        if (apartmentId) {
            loadFloors(apartmentId);
        }
    };

    // Handle floor selection
    const handleFloorChange = (e) => {
        const floorId = e.target.value;
        setSelectedFloor(floorId);
        setHouses([]);
        setSelectedHouses([]);
        if (selectedApartment && floorId) {
            loadHouses(selectedApartment, floorId);
        }
    };

    // Handle individual house selection
    const handleHouseSelect = (houseId) => {
        setSelectedHouses(prev => {
            if (prev.includes(houseId)) {
                return prev.filter(id => id !== houseId);
            } else {
                return [...prev, houseId];
            }
        });
    };

    // Handle select all houses
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedHouses([]);
        } else {
            const allHouseIds = houses.map(house => house.id);
            setSelectedHouses(allHouseIds);
        }
        setSelectAll(!selectAll);
    };

    // Update selectAll when selectedHouses changes
    useEffect(() => {
        if (houses.length > 0) {
            setSelectAll(selectedHouses.length === houses.length);
        }
    }, [selectedHouses, houses]);

    // Open assign modal
    const handleAssignClick = (bill) => {
        setSelectedBillForAssign(bill);
        setShowAssignModal(true);
        loadApartments();
        // Reset selections
        setSelectedApartment('');
        setSelectedFloor('');
        setFloors([]);
        setHouses([]);
        setSelectedHouses([]);
        setSelectAll(false);
    };

    // Close assign modal
    const handleCloseAssignModal = () => {
        setShowAssignModal(false);
        setSelectedBillForAssign(null);
        setSelectedApartment('');
        setSelectedFloor('');
        setFloors([]);
        setHouses([]);
        setSelectedHouses([]);
        setSelectAll(false);
    };

    // Submit assignment
    const handleAssignSubmit = async () => {
        if (!selectedApartment || !selectedFloor || selectedHouses.length === 0) {
            toast.error('Please select apartment, floor, and at least one house');
            return;
        }

        setAssigning(true);
        try {
            const assignmentData = {
                bill_id: selectedBillForAssign.id,
                apartment_id: selectedApartment,
                floor_id: selectedFloor,
                house_ids: selectedHouses
            };

            await api.post('/bill-assignments/assign', assignmentData);
            toast.success(`Bill "${selectedBillForAssign.bill_name}" assigned to ${selectedHouses.length} house(s) successfully!`);
            handleCloseAssignModal();
        } catch (err) {
            console.error('Error assigning bill:', err);
            toast.error(err.response?.data?.message || 'Failed to assign bill');
        } finally {
            setAssigning(false);
        }
    };

    //create Bill Type
    const handleAddNew = () =>{
        setShowCreateModal(true);
    }

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateBillType = () => {
        loadBills();
        setShowCreateModal(false);
       
    }

    //Update house types
    const handleEdit = (bills) => {
        setSelectedBillType(bills);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedBillType(null);
    };

    const handleBillTypeUpdated = () => {
        loadBills();
        setShowEditModal(false);
        toast.success('Bill Type updated successfully!');
    };

    //Delete bill
    const handleDeleteClick = (bill) => {
        setDeletingBill(bill);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (!deletingBill) return;
            await api.delete(`/bills/${deletingBill.id}`);
            toast.success('Bill type deleted successfully');
            setShowDeleteModal(false);
            setDeletingBill(null);
            loadBills();
        } catch (err) {
            console.error('Delete bill type error:', err);
            toast.error('Failed to delete bill type');
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeletingBill(null);
    };

    return (
        
                <div className='flex-1 overflow-y-auto p-6'>
                    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300'>
                        <button 
                        onClick={handleAddNew}
                        className='flex items-center gap-2 mb-3 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                            <Plus size={20} />
                            <span>New Bill Type</span>
                        </button>
                        {loadingBills ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader size={32} className="animate-spin text-purple-600" />
                                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading Bill types...</span>
                            </div>
                            ) : error ? (
                            <div className="text-center py-12 text-red-600 dark:text-red-400">
                                {error}
                                <button
                                    onClick={loadBills}
                                    className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Retry
                                </button>
                            </div>
                            ) : bills.length === 0 ? (
                            <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                                <Image size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-lg">No bill types found</p>
                                <p className="text-sm">Get started by adding bill types</p>
                            </div>
                            ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bill Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Bill Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {bills.map((bill,index) => (
                                            <tr key={bill.id}
                                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                                                onClick={() => navigate(`/billranges/${bill.id}`)}
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white items-center ">
                                                {bill.billtype}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center ">
                                                <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAssignClick(bill);
                                                }}
                                                title="Assign Bill"
                                                className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-all justify-between mr-2"
                                                >
                                                <Plus size={20} />
                                                </button>
                                                <span>{bill.bill_name}</span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(bill);
                                                            }}
                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                            title="Edit"
                                                            >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(bill);
                                                            }}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Create Bill Type Modal */}
                        {showCreateModal && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                                    <button
                                        onClick={handleCloseModal}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                                    >
                                    ✖
                                    </button>
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                                        Add New Bill Type
                                    </h2>
                                    <CreateBillType
                                        onClose={handleCloseModal} 
                                        onCreated={handleCreateBillType}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Edit Bill Type Modal */}
                        {showEditModal && selectedBillType && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                                <button
                                    onClick={handleCloseEditModal}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                                >
                                    ✖
                                </button>
                                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                                    Update the Bill Type
                                </h2>
                                <EditBillType
                                    onClose={handleCloseEditModal}
                                    onUpdated={handleBillTypeUpdated}
                                    bills={selectedBillType}
                                />
                                </div>
                            </div>
                        )}

                        {/* Assign Bill Modal */}
                        {showAssignModal && selectedBillForAssign && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
                                    <button
                                        onClick={handleCloseAssignModal}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                                    >
                                        ✖
                                    </button>
                                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                                        Assign Bill: <span className="text-purple-600">{selectedBillForAssign.bill_name}</span>
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        {/* Apartment Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Select Apartment *
                                            </label>
                                            <select
                                                value={selectedApartment}
                                                onChange={handleApartmentChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                disabled={loadingApartments}
                                            >
                                                <option value="">Choose Apartment</option>
                                                {apartments.map(apartment => (
                                                    <option key={apartment.id} value={apartment.id}>
                                                        {apartment.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingApartments && (
                                                <p className="text-sm text-gray-500 mt-2 flex items-center">
                                                    <Loader size={16} className="animate-spin mr-2" />
                                                    Loading apartments...
                                                </p>
                                            )}
                                        </div>

                                        {/* Floor Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Select Floor *
                                            </label>
                                            <select
                                                value={selectedFloor}
                                                onChange={handleFloorChange}
                                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                disabled={!selectedApartment || loadingFloors}
                                            >
                                                <option value="">{!selectedApartment ? 'Select apartment first' : 'Choose Floor'}</option>
                                                {floors.map(floor => (
                                                    <option key={floor.id} value={floor.id}>
                                                        {floor.floor_id}
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingFloors && (
                                                <p className="text-sm text-gray-500 mt-2 flex items-center">
                                                    <Loader size={16} className="animate-spin mr-2" />
                                                    Loading floors...
                                                </p>
                                            )}
                                        </div>

                                        {/* Houses Selection */}
                                        {houses.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Select Houses ({selectedHouses.length} selected)
                                                    </label>
                                                    <span className="text-sm text-gray-500">
                                                        {houses.length} houses available
                                                    </span>
                                                </div>
                                                <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700">
                                                    {/* Select All Checkbox */}
                                                    <div className="flex items-center mb-3 p-2 bg-white dark:bg-gray-600 rounded border">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectAll}
                                                            onChange={handleSelectAll}
                                                            className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                                                        />
                                                        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Select All Houses
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Houses List */}
                                                    <div className="space-y-2">
                                                        {houses.map(house => (
                                                            <div key={house.id} className="flex items-center p-3 bg-white dark:bg-gray-600 rounded border hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedHouses.includes(house.id)}
                                                                    onChange={() => handleHouseSelect(house.id)}
                                                                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                                                                />
                                                                <div className="ml-3 flex-1">
                                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                        {house.house_id}
                                                                    </span>
                                                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                                        ({house.status})
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                {loadingHouses && (
                                                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                                                        <Loader size={16} className="animate-spin mr-2" />
                                                        Loading houses...
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Selected Houses Summary */}
                                        {selectedHouses.length > 0 && (
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                    <strong>{selectedHouses.length}</strong> house{selectedHouses.length !== 1 ? 's' : ''} selected for assignment
                                                </p>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={handleCloseAssignModal}
                                                className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAssignSubmit}
                                                disabled={!selectedApartment || !selectedFloor || selectedHouses.length === 0 || assigning}
                                                className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                                            >
                                                {assigning ? (
                                                    <>
                                                        <Loader size={16} className="animate-spin" />
                                                        Assigning...
                                                    </>
                                                ) : (
                                                    `Assign to ${selectedHouses.length} House${selectedHouses.length !== 1 ? 's' : ''}`
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && deletingBill && (
                            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                Confirm Deletion
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Are you sure you want to delete "{deletingBill.bill_name}"?
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
                    </div>
                    <ToastContainer position="top-center" autoClose={3000} />
                </div>
            
            
    )
}