//Houses.jsx
import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/navbar'
import { ChevronLeft, Edit, FileText, House, Image, Loader, Plus, QrCode, ToggleLeft, ToggleRight, Trash2, Menu } from 'lucide-react'
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
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { apartment_id, floor_id } = useParams();
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

    // Check screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
        setShowEditModal(false);
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

    // Mobile menu button
    const MobileMenuButton = () => (
        <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
        >
            <Menu size={24} />
        </button>
    );

    return (
        <div className='flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200'>
            <MobileMenuButton />
            
            <Sidebar 
                onCollapse={setIsSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />
            
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Navbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    <div className="mx-auto max-w-7xl">
                        {/* Title Container */}
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6 gap-4'>
                            <div className='flex items-center'>
                                <button onClick={handleBack} className='p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-purple-700 dark:text-purple-400 mr-2 md:mr-3'>
                                    <ChevronLeft size={isMobile ? 20 : 25} />
                                </button>
                                <House size={isMobile ? 28 : 40} className='text-purple-600 dark:text-purple-400 mr-2 md:mr-3 flex-shrink-0' />
                                <div className="min-w-0">
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
                                        Houses
                                    </h1>
                                    {apartment && floor && (
                                        <div className='text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate'>
                                            <span className="font-medium">{apartment.name}</span> • Floor {floor.floor_id}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Mobile QR Code Button */}
                            {isMobile && selectedHouses.length > 0 && (
                                <button 
                                    onClick={handleGenerateQRCodes}
                                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-green-600 hover:bg-green-700"
                                >
                                    <QrCode size={16} />
                                    <span className="text-xs">QR ({selectedHouses.length})</span>
                                </button>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-4 md:mb-6">
                            <button
                                onClick={() => setActiveTab("houses")}
                                className={`px-3 md:px-4 py-2 font-semibold transition-colors duration-200 text-sm md:text-base
                                    ${activeTab === "houses"
                                        ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}>
                                Houses
                            </button>
                            <button
                                onClick={() => setActiveTab("houseTypes")}
                                className={`px-3 md:px-4 py-2 font-semibold transition-colors duration-200 text-sm md:text-base
                                    ${activeTab === "houseTypes"
                                        ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}>
                                House Types
                            </button>
                        </div>

                        {/* Content Switch */}
                        {activeTab === "houses" ? (
                            <div className='bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6'>
                                <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'gap-3 mb-4'}`}>
                                    <button 
                                        onClick={handleAddNew} 
                                        className={`flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105 text-sm md:text-base ${isMobile ? 'w-full' : ''}`}
                                    >
                                        <Plus size={isMobile ? 16 : 20} />
                                        <span>New House</span>
                                    </button>
                                    {!isMobile && (
                                        <button 
                                            onClick={handleGenerateQRCodes}
                                            disabled={selectedHouses.length === 0}
                                            className='flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-green-600 hover:bg-green-700 hover:scale-105 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                                        >
                                            <QrCode size={isMobile ? 16 : 20} />
                                            <span>Generate QR Code ({selectedHouses.length})</span>
                                        </button>
                                    )}
                                </div>
                                
                                {/* Selection Info */}
                                {selectedHouses.length > 0 && (
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                {selectedHouses.length} house{selectedHouses.length !== 1 ? 's' : ''} selected
                                            </p>
                                            {isMobile ? (
                                                <button 
                                                    onClick={handleGenerateQRCodes}
                                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                                >
                                                    Generate QR
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                )}
                                
                                {loadingHouses ? (
                                    <div className="flex flex-col items-center justify-center py-8 md:py-12">
                                        <Loader size={isMobile ? 24 : 32} className="animate-spin text-purple-600" />
                                        <span className="ml-2 mt-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                                            Loading Houses...
                                        </span>
                                    </div>
                                    ) : error ? (
                                    <div className="text-center py-8 md:py-12">
                                        <div className="text-red-600 dark:text-red-400 text-sm md:text-base mb-4">
                                            {error}
                                        </div>
                                        <button
                                            onClick={() => loadHouses(floor_id)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                    ) : houses.length === 0 ? (
                                    <div className="text-center py-8 md:py-12">
                                        <Image size={isMobile ? 32 : 48} className="mx-auto mb-3 md:mb-4 text-gray-400" />
                                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-2">
                                            No houses found
                                        </p>
                                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            Get started by adding houses
                                        </p>
                                        <button 
                                            onClick={handleAddNew}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                                        >
                                            Add First House
                                        </button>
                                    </div>
                                    ) : (
                                    <>
                                        {/* Mobile View - Card Layout */}
                                        {isMobile ? (
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            Total Houses: {houses.length}
                                                        </span>
                                                        <button
                                                            onClick={handleSelectAll}
                                                            className="text-xs text-purple-600 dark:text-purple-400"
                                                        >
                                                            {selectAll ? 'Deselect All' : 'Select All'}
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                {houses.map((house) => (
                                                    <div 
                                                        key={house.id} 
                                                        onClick={() => house.is_active && handleHouseView(house)}
                                                        className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-colors ${
                                                            house.is_active 
                                                            ? 'active:bg-gray-100 dark:active:bg-gray-600 cursor-pointer' 
                                                            : 'opacity-50 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center flex-1 min-w-0">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedHouses.includes(house.id)}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        handleHouseSelect(house.id);
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded mr-3"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center">
                                                                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                                                            House {house.house_id}
                                                                        </h3>
                                                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                                                            house.status === 'occupied' 
                                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                        }`}>
                                                                            {house.status}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                        {housetype.find(ht => ht.id === house.housetype_id)?.name || "N/A"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-1 ml-2 flex-shrink-0">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDocumentClick(house);
                                                                    }}
                                                                    className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                                                    title="Manage Documents"
                                                                >
                                                                    <FileText size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEdit(house);
                                                                    }}
                                                                    className="p-1.5 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg"
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        confirmDeactivate(house);
                                                                    }}
                                                                    className={`p-1.5 rounded-lg ${
                                                                        house.is_active 
                                                                            ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20'
                                                                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20'
                                                                    }`}
                                                                    title={house.is_active ? 'Deactivate' : 'Activate'}
                                                                >
                                                                    {house.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteClick(house);
                                                                    }}
                                                                    className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between mt-2">
                                                            <span>Created: {formatDate(house.created_at)}</span>
                                                            <span className={`px-1.5 py-0.5 rounded text-xs ${
                                                                house.is_active 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }`}>
                                                                {house.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            /* Desktop View - Table Layout */
                                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                                {/* Table Container with Fixed Height and Scroll */}
                                                <div className="overflow-auto max-h-[500px]">
                                                    <table className="w-full table-auto min-w-[640px]">
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
                                    </>
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                                    Create Houses
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                                >
                                    ✖
                                </button>
                            </div>
                            <CreateHouse
                                onClose={handleCloseModal} 
                                onCreated={handleHouseCreated}
                                apartment_id={apartment_id}
                                floor_id={floor_id}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit House Modal */}
            {showEditModal && selectedHouse && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                                    Edit House
                                </h2>
                                <button
                                    onClick={handleCloseEditModal}
                                    className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                                >
                                    ✖
                                </button>
                            </div>
                            <EditHouse
                                onClose={handleCloseEditModal}
                                onUpdated={handleHouseUpdated}
                                house={selectedHouse}
                                apartment_id={apartment_id}
                                floor_id={floor_id} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Deactivate/Activate Confirmation Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-sm">
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
                    <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'space-x-3'}`}>
                        <button
                        onClick={cancelDeactivate}
                        className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isMobile ? '' : 'flex-1'}`}
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
                        className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${isMobile ? '' : 'flex-1'} ${
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
            
            {/* Delete Modal */}
            {showDeleteModal && deletingHouse && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-sm">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Confirm Deletion
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Are you sure you want to delete "{deletingHouse.house_id}"?
                        </p>
                        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'space-x-3'}`}>
                        <button
                            onClick={handleCancelDelete}
                            className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isMobile ? '' : 'flex-1'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className={`px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors ${isMobile ? '' : 'flex-1'}`}
                        >
                            Delete
                        </button>
                        </div>
                    </div>
                </div>
            )}            
            
            {/* House Document Modal */}
            {showHouseDocumentModal && selectedHouseForDocuments && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6">
                            <HouseDocumentModal
                                house={selectedHouseForDocuments}
                                apartment={apartment}
                                floor={floor}
                                onClose={handleDocumentModalClose}
                                onUploadSuccess={handleDocumentUploadSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {/* QR Code Generator Modal */}
            {showQRModal && apartment && floor && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6">
                            <QRCodeGenerator
                                houses={houses.filter(house => selectedHouses.includes(house.id))}
                                apartment={apartment}
                                floor={floor}
                                onClose={() => setShowQRModal(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    )
}