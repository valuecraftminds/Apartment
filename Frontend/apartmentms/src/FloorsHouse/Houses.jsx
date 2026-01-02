import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { ChevronLeft, Edit, FileText, House, Image, Loader, Plus, QrCode, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import HouseTypes from './HouseTypes';
import ViewHouse from './ViewHouse';
import CreateHouse from './CreateHouse';
import { toast, ToastContainer } from 'react-toastify';
import EditHouse from './EditHouse';
import Bills from '../Bills/Bills';
import HouseDocumentModal from './HouseDocumentModal';
import QRCodeGenerator from './QRCodeGenerator';

export default function Houses() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { apartment_id, floor_id } = useParams();
    console.log('Apartment ID:', apartment_id);
    console.log('Floor Id: ',floor_id);
    const [apartment, setApartment] = useState(null);
    const [floor, setFloor] = useState(null);
    const [houses, setHouses] = useState([]);
    const [housetype,setHouseType] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [loadingHouses, setLoadingHouses] = useState(false);
    const [loadingHouseTypes,setLoadingHouseTypes] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivatingHouse, setDeactivatingHouse] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingHouse, setDeletingHouse] = useState(null);   
    const [activeTab, setActiveTab] = useState("houses");
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [showHouseDocumentModal, setShowHouseDocumentModal] = useState(false);
    const [selectedHouseForDocuments, setSelectedHouseForDocuments] = useState(null);
    const [selectedHouses, setSelectedHouses] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);

    useEffect(() => {
        const fetchApartment = async () => {
            try {
                const res = await api.get(`/apartments/${apartment_id}`);
                if (res.data.success) {
                    setApartment(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching apartment:', err);
            }
        };
        if (apartment_id) fetchApartment();
    }, [apartment_id]);

    useEffect(() => {
        const fetchFloor = async () => {
            try {
                const res = await api.get(`/floors/${floor_id}`);
                if (res.data.success) {
                    setFloor(res.data.data);
                }
            } catch (err) {
                console.error('Error fetching floors:', err);
            }
        };
        if (floor_id) fetchFloor();
    }, [floor_id]);

    const loadHouseTypes = async () => {
        try {
            setLoadingHouseTypes(true);
            setError(null);
            const result = await api.get(`/housetype?apartment_id=${apartment_id}`);
            if (result.data.success && Array.isArray(result.data.data)) {
                setHouseType(result.data.data);
            } else {
                setHouseType([]);
            }
        } catch (err) {
            console.error('Error loading houses:', err);
            setError('Failed to load houses. Please try again.');
        } finally {
            setLoadingHouseTypes(false);
        }
    };

    useEffect(()=>{
        loadHouseTypes();
    },[apartment_id]);

    const handleBack = () => {
        navigate(`/floors/${apartment.id}`);
    };

    const loadHouses = async (floor_id) => {
        try {
            setLoadingHouses(true);
            setError(null);
            const result = await api.get(`/houses?apartment_id=${apartment_id}&floor_id=${floor_id}`);
            if (result.data.success && Array.isArray(result.data.data)) {
                setHouses(result.data.data);
                setSelectedHouses([]);
                setSelectAll(false);
            } else {
                setHouses([]);
            }
        } catch (err) {
            console.error('Error loading houses:', err);
            setError('Failed to load houses. Please try again.');
        } finally {
            setLoadingHouses(false);
        }
    };

    useEffect(() => {
        if (floor_id && apartment_id) {
            loadHouses(floor_id);
        }
    }, [floor_id, apartment_id]);

    const handleHouseView = (house) => {
        navigate(`/viewhouse/${apartment_id}/${floor_id}/${house.id}`);
    };

    //Add new house
    const handleAddNew = () =>{
        setShowCreateModal(true);
    }

    const handleCloseModal = () => {
    setShowCreateModal(false);
    };

    const handleHouseCreated = () => {
            loadHouses(floor_id);
            setShowCreateModal(false);
            toast.success('House created successfully!');
    };

    //Update Houses
        const handleEdit = (house) => {
        setSelectedHouse(house);
        setShowEditModal(true);
        };
    
        const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedHouse(null);
        };
    
        const handleHouseUpdated = () => {
        loadHouses(floor_id);
        // setShowEditModal(false);
        toast.success('House updated successfully!');
        };

     //Deactivate and activate the houses
    const confirmDeactivate = (house) => {
        setDeactivatingHouse(house);
        setShowDeactivateModal(true);
    };

    const cancelDeactivate = () => {
        setShowDeactivateModal(false);
        setDeactivatingHouse(null);
    }

    const handleToggle = async (house) => {
        try {
            const result = await api.patch(`/houses/${house.id}/toggle`);
            toast.success(result.data.message);
            loadHouses(floor_id); 
        } catch (err) {
            console.error('Error toggling house:', err);
            toast.error('Failed to toggle house status');
        }
    };

    //delete house
    const handleDeleteClick = (house) => {
    setDeletingHouse(house);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!deletingHouse) return;
      await api.delete(`/houses/${deletingHouse.id}`);
      toast.success('House deleted successfully');
      setShowDeleteModal(false);
      setDeletingHouse(null);
      loadHouses(floor_id);
    } catch (err) {
      console.error('Delete house error:', err);
      toast.error('Failed to delete house');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingHouse(null);
  };

  //handle house document
    const handleDocumentClick = (house) => {
      setSelectedHouseForDocuments(house);
      setShowHouseDocumentModal(true);
      };
  
    const handleDocumentModalClose = () => {
        setShowHouseDocumentModal(false);
        setSelectedHouseForDocuments(null);
    };
  
    const handleDocumentUploadSuccess = () => {
        toast.success('House documents uploaded successfully!');
    };

     // Checkbox selection handlers
    const handleHouseSelect = (houseId) => {
        setSelectedHouses(prev => {
            if (prev.includes(houseId)) {
                return prev.filter(id => id !== houseId);
            } else {
                return [...prev, houseId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedHouses([]);
        } else {
            const allHouseIds = houses.map(house => house.id);
            setSelectedHouses(allHouseIds);
        }
        setSelectAll(!selectAll);
    };

    // Update selectAll state when selection changes
    useEffect(() => {
        if (houses.length > 0 && selectedHouses.length === houses.length) {
            setSelectAll(true);
        } else {
            setSelectAll(false);
        }
    }, [selectedHouses, houses]);

    // Get selected houses count
    const selectedCount = selectedHouses.length;

    //Generate QR Codes for selected houses
    const handleGenerateQRCodes = () => {
        if (selectedHouses.length === 0) {
            toast.error('Please select at least one house to generate QR codes');
            return;
        }
        
        const selectedHouseObjects = houses.filter(house => 
            selectedHouses.includes(house.id)
        );
        
        setShowQRModal(true);
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };


    return (
        <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
            <Sidebar />
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Navbar />
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {/* Title Container */}
                        <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                            <div className='flex flex-col'>
                                <div className='flex items-center'>
                                    <button onClick={handleBack} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                                        <ChevronLeft size={25} />
                                    </button>
                                    <House size={40} className='text-purple-600 dark:text-purple-400 mr-3 ml-3' />
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Houses</h1>
                                </div>
                                {apartment && (
                                    <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                        Apartment: {apartment.name}
                                    </div>
                                )}
                                {floor && (
                                    <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                        Floor: {floor.floor_id}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-6">
                            <button
                                onClick={() => setActiveTab("houses")}
                                className={`px-4 py-2 font-semibold transition-colors duration-200 
                                    ${activeTab === "houses"
                                        ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}>
                                Houses
                            </button>
                            <button
                                onClick={() => setActiveTab("houseTypes")}
                                className={`px-4 py-2 font-semibold transition-colors duration-200 
                                    ${activeTab === "houseTypes"
                                        ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}>
                                House Types
                            </button>
                        </div>

                        {/* Content Switch */}
                        {activeTab === "houses" ? (
                            <div className='bg-white dark:bg-gray-800 rounded-2xl p-6'>
                                <div className='flex gap-2'>
                                <button onClick={handleAddNew} className='flex items-center gap-2 mb-4 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                                    <Plus size={20} />
                                    <span>New House</span>
                                </button>
                                <button 
                                    onClick={handleGenerateQRCodes}
                                    disabled={selectedHouses.length === 0}
                                    className='flex items-center ml-190 gap-2 px-4 py-2 mb-4 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-green-600 hover:bg-green-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                                >
                                    <QrCode size={20} />
                                    <span>Generate QR Code ({selectedHouses.length})</span>
                                </button>
                                </div>
                                 {/* Selection Info */}
                                {selectedHouses.length > 0 && (
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            {selectedHouses.length} house{selectedHouses.length !== 1 ? 's' : ''} selected for QR code generation
                                        </p>
                                    </div>
                                )}
                                
                                {loadingHouses ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader size={32} className="animate-spin text-purple-600" />
                                        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading Houses...</span>
                                    </div>
                                    ) : error ? (
                                    <div className="text-center py-12 text-red-600 dark:text-red-400">
                                        {error}
                                        <button
                                            onClick={loadHouses}
                                            className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                    ) : houses.length === 0 ? (
                                    <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                                        <Image size={48} className="mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg">No houses found</p>
                                        <p className="text-sm">Get started by adding houses</p>
                                    </div>
                                    ) : (
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        {/* Table Container with Fixed Height and Scroll */}
                                        <div className="overflow-auto max-h-[500px]"> {/* This enables scrolling */}
                                            <table className="w-full table-auto">
                                                <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectAll}
                                                                onChange={handleSelectAll}
                                                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                            />
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">House No</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created_at</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {houses.map((house) => (
                                                        <tr
                                                            key={house.id}
                                                            onClick={() => house.is_active && handleHouseView(house)}
                                                            className={`transition-colors cursor-pointer ${
                                                                house.is_active 
                                                                ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
                                                                : 'opacity-50 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedHouses.includes(house.id)}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        handleHouseSelect(house.id);
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {house.house_id}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {housetype.find(ht => ht.id === house.housetype_id)?.name || "N/A"}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {house.status}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {formatDate(house.created_at)}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDocumentClick(house)
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                        title="Manage Documents"
                                                                    >
                                                                        <FileText size={20} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEdit(house);
                                                                        }}
                                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit size={20} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            confirmDeactivate(house);
                                                                        }}
                                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                        title={house.is_active ? 'Deactivate' : 'Activate'}
                                                                    >
                                                                        {house.is_active ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteClick(house);
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
                                        
                                        {/* House Count Footer */}
                                        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-t border-gray-200 dark:border-gray-600">
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Total: {houses.length} house{houses.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <HouseTypes/>
                        )}
                    </div>
                </div>
            </div>

            {/* Create House Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-5xl relative">
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                        >
                        ✖
                        </button>
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                            Create Houses
                        </h2>
                        <CreateHouse
                            onClose={handleCloseModal} 
                            onCreated={handleHouseCreated}
                            apartment_id={apartment_id}
                            floor_id={floor_id}
                        />
                    </div>
                </div>
            )}

            {/* Edit House Modal */}
            {showEditModal && selectedHouse && (
                <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                    <button
                        onClick={handleCloseEditModal}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    >
                        ✖
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Edit House
                    </h2>
                    <EditHouse
                        onClose={handleCloseEditModal}
                        onUpdated={handleHouseUpdated}
                        house={selectedHouse}
                        apartment_id={apartment_id}
                        floor_id={floor_id} 
                    />
                    </div>
                </div>
            )}

            {/* Deactivate/Activate Confirmation Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        {deactivatingHouse?.is_active
                        ? "Confirm Deactivation of House"
                        : "Confirm Activation of House"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {deactivatingHouse?.is_active
                        ? "Are you sure you want to deactivate this house?"
                        : "Are you sure you want to activate this house?"}
                    </p>
                    <div className="flex justify-end space-x-3">
                        <button
                        onClick={cancelDeactivate}
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                        Cancel
                        </button>
                        <button
                        onClick={() => {
                            if (deactivatingHouse) {
                            handleToggle(deactivatingHouse);
                            setShowDeactivateModal(false);
                            setDeactivatingHouse(null);
                            }
                        }}
                        className={`px-4 py-2 rounded-md text-white transition-colors duration-200 ${
                            deactivatingHouse?.is_active
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                        >
                        {deactivatingHouse?.is_active ? "Deactivate" : "Activate"}
                        </button>
                    </div>
                    </div>
                </div>
            )}
            {showDeleteModal && deletingHouse && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Confirm Deletion
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Are you sure you want to delete "{deletingHouse.house_id}"?
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
        {/* House Document Modal */}
        {showHouseDocumentModal && selectedHouseForDocuments && (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
                    <HouseDocumentModal
                        house={selectedHouseForDocuments}
                        apartment={apartment}
                        floor={floor}
                        onClose={handleDocumentModalClose}
                        onUploadSuccess={handleDocumentUploadSuccess}
                        />
                    </div>
                </div>
        )}
         {/* QR Code Generator Modal */}
            {showQRModal && apartment && floor && (
                <QRCodeGenerator
                    houses={houses.filter(house => selectedHouses.includes(house.id))}
                    apartment={apartment}
                    floor={floor}
                    onClose={() => setShowQRModal(false)}
                />
            )}
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    )
}