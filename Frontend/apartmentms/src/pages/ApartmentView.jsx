//ApartmentView.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Building2, Plus, Edit, Trash2, Eye, Image, Loader, ToggleRight, ToggleLeft, Upload, FileText, Menu } from 'lucide-react';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CreateApartment from '../Apartments/CreateApartment';
import EditApartment from '../Apartments/EditApartment';
import { toast, ToastContainer } from 'react-toastify';
import BulkImportModal from '../Apartments/BulkImportModal';
import DocumentModal from '../Apartments/DocumentModal';
import Sidebar from '../components/Sidebar';
// import ViewApartment from '../Apartments/ViewApartment';

export default function ApartmentView() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingApartment, setEditingApartment] = useState(null);
    // const [viewingApartment, setViewingApartment] = useState(null);
    // const [showViewModal, setShowViewModal] = useState(false);
    const [showDeactivateModal,setShowDeactivateModal] = useState(false);
    const [deactivatingApartment, setDeactivatingApartment] = useState(null);
    const [showBulkImportModal, setShowBulkImportModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingApartment, setDeletingApartment] = useState(null);
    const [showDocumentModal, setShowDocumentModal] = useState(false); // New state for document modal
    const [selectedApartment, setSelectedApartment] = useState(null);

    // Check screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAddNew = () => {
        setShowCreateModal(true);
    };

    const handleUploadExcel = () => {
        setShowBulkImportModal(true);
    };

    const handleBulkImportModalClose = () => {
        setShowBulkImportModal(false);
    };

    const handleEdit = (apartment) => {
        setEditingApartment(apartment);
        setShowEditModal(true);
    };

    const handleFloorView = (apartment) => {
        navigate(`/floors/${apartment.id}`);
    };

    // const handleViewModalClose = () => {
    //     setShowViewModal(false);
    //     setViewingApartment(null);
    // };

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleEditModalClose = () => {
        setShowEditModal(false);
        setEditingApartment(null);
    };

    const handleApartmentCreated = () => {
        // Refresh the apartments list
        loadApartments();
        // Close the modal
        setShowCreateModal(false);
        // Show success message
        toast.success('Apartment created successfully!');
    };

    const handleApartmentEdited = () => {
        loadApartments(); // Refresh the list
        setShowEditModal(false);
        setEditingApartment(null);
        toast.success('Apartment updated successfully!');
    };

    const handleBulkImportSuccess = () => {
        loadApartments(); // Refresh the apartments list after successful import
        toast.success('Bulk import completed successfully!');
    };

    const confirmDeactivate = (apartment) => {
        setDeactivatingApartment(apartment);
        setShowDeactivateModal(true);
    };

    const cancelDeactivate = () => {
        setShowDeactivateModal(false);
    }

    const loadApartments = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await api.get('/apartments')

            if (result.data.success && Array.isArray(result.data.data)) {
                setApartments(result.data.data);
            } else if (Array.isArray(result.data)) {
                setApartments(result.data);
            } else {
                console.warn('Unexpected response format:', result.data);
                setApartments([]);
            }
        } catch (err) {
            console.error('Error loading apartments:', err);
            if (err.response?.status === 401) {
                setError('Unauthorized. Please login again.');
                navigate('/login');
            } else if (err.response?.status === 400) {
                setError('Company information missing. Please contact support.');
            } else {
                setError('Failed to load apartments. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApartments();
    }, []);

    const handleToggle = async (apartment) => {
        try {
            const result = await api.patch(`/apartments/${apartment.id}/toggle`);
            toast.success(result.data.message);
            loadApartments(); // refresh list
        } catch (err) {
            console.error('Error toggling apartment:', err);
            toast.error('Failed to toggle apartment status');
        }
    };

    //Delete apartment
    const handleDeleteClick = (apartment) => {
        setDeletingApartment(apartment);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (!deletingApartment) return;
            await api.delete(`/apartments/${deletingApartment.id}`);
            toast.success('Apartment deleted successfully');
            setShowDeleteModal(false);
            setDeletingApartment(null);
            loadApartments();
        } catch (err) {
            console.error('Delete apartment error:', err);
            toast.error('Failed to delete apartment');
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeletingApartment(null);
    };


    // New function to handle document button click
    const handleDocumentClick = (apartment) => {
        setSelectedApartment(apartment);
        setShowDocumentModal(true);
    };

    // New function to handle document modal close
    const handleDocumentModalClose = () => {
        setShowDocumentModal(false);
        setSelectedApartment(null);
    };

    // New function to handle successful document upload
    const handleDocumentUploadSuccess = () => {
        toast.success('Document uploaded successfully!');
        // You can refresh documents list if needed
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
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <MobileMenuButton />
            
            <Sidebar 
                onCollapse={setIsSidebarCollapsed}
                isMobileOpen={isMobileSidebarOpen}
                onMobileClose={() => setIsMobileSidebarOpen(false)}
            />
            
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Navbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
                
                <div className='flex-1 overflow-y-auto p-4 md:p-6'>
                    <div className='mx-auto max-w-7xl'>
                        {/* Header */}
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6 gap-4'>
                            <div className='flex items-center'>
                                <Building2 size={isMobile ? 32 : 40} className='text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0'/>
                                <div className="min-w-0">
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
                                        Apartments
                                    </h1>
                                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                                        Manage your apartment buildings
                                    </p>
                                </div>
                            </div>
                            <div className='flex gap-3'>
                                <button 
                                    onClick={handleUploadExcel} 
                                    className='flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-green-600 hover:bg-green-700 hover:scale-105 text-sm md:text-base w-full sm:w-auto'
                                >
                                    <Upload size={isMobile ? 16 : 20}/>
                                    <span className="whitespace-nowrap">Upload Excel</span>
                                </button>
                                <button 
                                    onClick={handleAddNew} 
                                    className='flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105 text-sm md:text-base w-full sm:w-auto'
                                >
                                    <Plus size={isMobile ? 16 : 20}/>
                                    <span className="whitespace-nowrap">Add New</span>
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className='bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6'>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-8 md:py-12">
                                    <Loader size={isMobile ? 24 : 32} className="animate-spin text-purple-600" />
                                    <span className="ml-2 mt-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                                        Loading apartments...
                                    </span>
                                </div>
                                ) : error ? (
                                <div className="text-center py-8 md:py-12">
                                    <div className="text-red-600 dark:text-red-400 text-sm md:text-base mb-4">
                                        {error}
                                    </div>
                                    <button 
                                        onClick={loadApartments}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : apartments.length === 0 ? (
                                <div className="text-center py-8 md:py-12">
                                    <Image size={isMobile ? 32 : 48} className="mx-auto mb-3 md:mb-4 text-gray-400" />
                                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-2">
                                        No apartments found
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Get started by adding your first apartment
                                    </p>
                                    <button 
                                        onClick={handleAddNew}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                                    >
                                        Create First Apartment
                                    </button>
                                </div>
                                ) : (
                                <>
                                    {/* Mobile View - Card Layout */}
                                    {isMobile ? (
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Total Apartments: {apartments.length}
                                                    </span>
                                                    <span className="text-xs text-purple-600 dark:text-purple-400">
                                                        {apartments.length} items
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {apartments.map((apartment, index) => (
                                                <div 
                                                    key={apartment.id || index} 
                                                    onClick={() => apartment.is_active && handleFloorView(apartment)}
                                                    className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-colors ${
                                                        apartment.is_active 
                                                            ? 'active:bg-gray-100 dark:active:bg-gray-600 cursor-pointer' 
                                                            : 'opacity-50 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex items-center flex-1 min-w-0">
                                                            {apartment.picture ? (
                                                                <img 
                                                                    src={`https://apmt.apivcm.shop${apartment.picture}`}
                                                                    alt={apartment.name}
                                                                    className="w-12 h-12 object-cover rounded-lg mr-3"
                                                                    onError={(e) => {
                                                                        console.error('Image failed to load:', apartment.picture);
                                                                        e.target.style.display = 'none';
                                                                        const fallback = e.target.parentNode.querySelector('.image-fallback');
                                                                        if (fallback) fallback.style.display = 'flex';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center mr-3">
                                                                    <Image size={16} className="text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                                                    {apartment.name}
                                                                </h3>
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                                    {apartment.city || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 ml-2 flex-shrink-0">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDocumentClick(apartment);
                                                                }}
                                                                className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                                                title="Manage Documents"
                                                            >
                                                                <FileText size={16} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); 
                                                                    handleEdit(apartment);
                                                                }}
                                                                className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg"
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    confirmDeactivate(apartment);
                                                                }}
                                                                className={`p-2 rounded-lg ${
                                                                    apartment.is_active 
                                                                        ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20'
                                                                        : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20'
                                                                }`}
                                                                title={apartment.is_active ? 'Deactivate' : 'Activate'}
                                                            >
                                                                {apartment.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(apartment);
                                                                }}
                                                                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mt-3">
                                                        <div className="flex items-center">
                                                            <span className="font-medium mr-1">Address:</span>
                                                            <span className="truncate">{apartment.address}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="font-medium mr-1">Floors:</span>
                                                            <span>{apartment.floors}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="font-medium mr-1">Units:</span>
                                                            <span>{apartment.houses}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="font-medium mr-1">Status:</span>
                                                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                                apartment.is_active 
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            }`}>
                                                                {apartment.is_active ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Desktop View - Table Layout */
                                        <div className='overflow-x-auto'>
                                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Apartments
                                                    </span>
                                                    <span className="text-sm text-purple-600 dark:text-purple-400">
                                                        {apartments.length} apartments
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <table className='w-full table-auto min-w-[640px]'>
                                                <thead className='bg-gray-50 dark:bg-gray-700'>
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Picture</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Address</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">City</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Floors</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Units</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {apartments.map((apartment, index) => (
                                                        <tr 
                                                            key={apartment.id || index} 
                                                            onClick={() => apartment.is_active && handleFloorView(apartment)} 
                                                            className={`transition-colors cursor-pointer ${
                                                                apartment.is_active 
                                                                    ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
                                                                    : 'opacity-50 cursor-not-allowed'
                                                            }`}
                                                        >
                                                            {/* ApartmentView.jsx - Update the image display part */}
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                {apartment.picture ? (
                                                                    // If picture is a path (string)
                                                                    <img 
                                                                        // src={`http://localhost:2500${apartment.picture}`}
                                                                        src={`https://apmt.apivcm.shop${apartment.picture}`}
                                                                        alt={apartment.name}
                                                                        className="w-12 h-12 object-cover rounded-lg"
                                                                        onError={(e) => {
                                                                            console.error('Image failed to load:', apartment.picture);
                                                                            e.target.style.display = 'none';
                                                                            const fallback = e.target.parentNode.querySelector('.image-fallback');
                                                                            if (fallback) fallback.style.display = 'flex';
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                                                        <Image size={20} className="text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {apartment.name}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                {apartment.address}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                {apartment.city || 'N/A'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                {apartment.floors}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                                {apartment.houses}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDocumentClick(apartment);
                                                                        }}
                                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                        title="Manage Documents"
                                                                    >
                                                                        <FileText size={20} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation(); 
                                                                            handleEdit(apartment);
                                                                        }}
                                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit size={20} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation(); // prevent row click
                                                                            confirmDeactivate(apartment);
                                                                            // handleToggle(apartment);
                                                                        }}
                                                                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                        title={apartment.is_active ? 'Deactivate' : 'Activate'}
                                                                        >
                                                                        {apartment.is_active ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteClick(apartment);
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                                    Create New Apartment
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                                >
                                    ✖
                                </button>
                            </div>
                            <CreateApartment 
                                onClose={handleCloseModal} 
                                onCreated={handleApartmentCreated}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit Modal */}
            {showEditModal && editingApartment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                                    Edit Apartment
                                </h2>
                                <button
                                    onClick={handleEditModalClose}
                                    className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                                >
                                    ✖
                                </button>
                            </div>
                            <EditApartment 
                                onClose={handleEditModalClose} 
                                onEdited={handleApartmentEdited}
                                apartment={editingApartment}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* {showViewModal && viewingApartment && (
                <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative"></div>
                <ViewApartment
                    apartment={viewingApartment}
                    onClose={handleViewModalClose}
                />
                </div>
            )} */}

            <BulkImportModal
                isOpen={showBulkImportModal}
                onClose={handleBulkImportModalClose}
                onImportSuccess={handleBulkImportSuccess}
            />

            {/* Deactivate/Activate Modal */}
            {showDeactivateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-sm">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            {deactivatingApartment?.is_active 
                            ? "Confirm Deactivation of Apartment" 
                            : "Confirm Activation of Apartment"}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            {deactivatingApartment?.is_active 
                            ? "Are you sure you want to deactivate the apartment?" 
                            : "Are you sure you want to activate the apartment?"}
                        </p>
                        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                            <button
                                onClick={cancelDeactivate}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (deactivatingApartment) {
                                    handleToggle(deactivatingApartment);
                                    setShowDeactivateModal(false);
                                    setDeactivatingApartment(null);
                                    }
                                }}
                                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                                    deactivatingApartment?.is_active 
                                    ? "bg-red-600 hover:bg-red-700" 
                                    : "bg-green-600 hover:bg-green-700"
                                }`}
                            >
                                {deactivatingApartment?.is_active ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && deletingApartment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-sm">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Confirm Deletion
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete "{deletingApartment.name}"?
                        </p>
                        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                            <button
                                onClick={handleCancelDelete}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Document Modal */}
            {showDocumentModal && selectedApartment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                                    Documents - {selectedApartment.name}
                                </h2>
                                <button
                                    onClick={handleDocumentModalClose}
                                    className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                                >
                                    ✖
                                </button>
                            </div>
                            <DocumentModal
                                apartment={selectedApartment}
                                onClose={handleDocumentModalClose}
                                onUploadSuccess={handleDocumentUploadSuccess}
                            />
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}
