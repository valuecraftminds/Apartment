//ComplaintCategories.jsx
import React, { useContext, useEffect, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import Navbar from '../../components/navbar';
import { Edit, Image, Loader, Plus, Settings, Trash2, Menu, Smartphone, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import api from '../../api/axios';
import CreateServiceCategory from './CreateServiceCategory';
import EditServiceCategory from './EditServiceCategory';

export default function ComplaintCategories() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [loadCategories, setLoadCategories] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingCategory, setDeletingCategory] = useState(null);

    // Check screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/categories');
            
            if (response.data.success && Array.isArray(response.data.data)) {
                setCategories(response.data.data);
            } else if (Array.isArray(response.data)) {
                setCategories(response.data);
            } else {
                console.warn('Unexpected response format:', response.data);
                setCategories([]);
            }
        } catch (err) {
            console.error('Failed to load service categories:', err);
            toast.error('Failed to load service categories. Please try again.');
            
            if (err.response?.status === 401) {
                setError('Unauthorized. Please login again.');
                navigate('/login');
            } else if (err.response?.status === 400) {
                setError('Company information missing. Please contact support.');
            } else {
                setError('Failed to load service categories. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    // Handle add new category
    const handleAddNew = () => {
        setShowCreateModal(true);
    }

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
    }

    const handleServiceCategoryCreated = () => {
        // Refresh the categories list
        fetchCategories();
        // Close the modal
        setShowCreateModal(false);
        // Show success message
        toast.success('Service category created successfully!');
    };

    //handle edit category
    const handleEdit = (category) => {
        setCategoryToEdit(category);
        setShowEditModal(true);
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setCategoryToEdit(null);
    }
    const handleServiceCategoryUpdated = () => {
        // Refresh the categories list
        fetchCategories();
        // Close the modal
        setShowEditModal(false);
        setCategoryToEdit(null);
        // Show success message
        toast.success('Service category updated successfully!');
    };

    //delete category
    const handleDelete = (category) => {
        setDeletingCategory(category);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
    try {
      if (!deletingCategory) return;
      await api.delete(`/categories/${deletingCategory.id}`);
      toast.success('Category deleted successfully');
      setShowDeleteModal(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Delete category error:', err);
      toast.error('Failed to delete category. Please try again.');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingCategory(null);
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
                                <Settings size={isMobile ? 32 : 40} className='text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0'/>
                                <div className="min-w-0">
                                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
                                        Service Categories
                                    </h1>
                                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                                        Manage your service categories
                                    </p>
                                </div>
                            </div>
                            <div className='flex gap-3'>
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
                                        Loading service categories...
                                    </span>
                                </div>
                            ): error ? (
                                <div className="text-center py-8 md:py-12">
                                    <div className="text-red-600 dark:text-red-400 text-sm md:text-base mb-4">
                                        {error}
                                    </div>
                                    <button 
                                        onClick={fetchCategories}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-8 md:py-12">
                                    <Image size={isMobile ? 32 : 48} className="mx-auto mb-3 md:mb-4 text-gray-400" />
                                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-2">
                                        No service categories found
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Get started by adding your first service category
                                    </p>
                                    <button 
                                        onClick={handleAddNew}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                                    >
                                        Create First Category
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Mobile View - Card Layout */}
                                    {isMobile ? (
                                        <div className="space-y-3">
                                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Total Categories: {categories.length}
                                                    </span>
                                                    <span className="text-xs text-purple-600 dark:text-purple-400">
                                                        {categories.length} items
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {categories.map(category => (
                                                <div key={category.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                                                {category.name}
                                                            </h3>
                                                            {category.description && (
                                                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                                                    {category.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2 ml-2 flex-shrink-0">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); 
                                                                    handleEdit(category);
                                                                }}
                                                                className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg"
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); 
                                                                    handleDelete(category);
                                                                }}
                                                                className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {category.color && (
                                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                            <div 
                                                                className="w-3 h-3 rounded-full mr-2"
                                                                style={{ backgroundColor: category.color }}
                                                            ></div>
                                                            <span>Color: {category.color}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Desktop View - Table Layout */
                                        <div className='overflow-x-auto'>
                                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                                        Service Categories
                                                    </span>
                                                    <span className="text-sm text-purple-600 dark:text-purple-400">
                                                        {categories.length} categories
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <table className='w-full table-auto min-w-[640px]'>
                                                <thead className='bg-gray-50 dark:bg-gray-700'>
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Name
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Description
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Color
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                    {categories.map(category => (
                                                        <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {category.name}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm text-gray-900 dark:text-white max-w-[300px] truncate">
                                                                {category.description || 'No description'}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                {category.color ? (
                                                                    <div className="flex items-center">
                                                                        <div 
                                                                            className="w-6 h-6 rounded-full mr-2 border border-gray-300 dark:border-gray-600"
                                                                            style={{ backgroundColor: category.color }}
                                                                        ></div>
                                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                            {category.color}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400 dark:text-gray-500">
                                                                        No color
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                                <div className='flex space-x-2'>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation(); 
                                                                            handleEdit(category);
                                                                        }}
                                                                        className="p-2 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation(); 
                                                                            handleDelete(category);
                                                                        }}
                                                                        className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
                                    Create New Service Category
                                </h2>
                                <button
                                    onClick={handleCloseCreateModal}
                                    className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                                >
                                    ✖
                                </button>
                            </div>
                            <CreateServiceCategory
                                onClose={handleCloseCreateModal} 
                                onCreated={handleServiceCategoryCreated}
                            />
                        </div>
                    </div>
                </div>
            )}
            {showEditModal && categoryToEdit && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-4 md:p-6">
                            <div className="flex justify-between items-center mb-4 md:mb-6">
                                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                                    Edit Service Category
                                </h2>
                                <button
                                    onClick={handleCloseEditModal}
                                    className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                                >
                                    ✖
                                </button>
                            </div>
                            <EditServiceCategory
                                onClose={handleCloseEditModal} 
                                onEdited={handleServiceCategoryUpdated}
                                serviceCategory={categoryToEdit}
                            />
                        </div>
                    </div>
                </div>
            )}
            {showDeleteModal && deletingCategory && (
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                            Confirm Deletion
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Are you sure you want to delete "{deletingCategory.name}"?
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