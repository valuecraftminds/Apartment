import React, { useEffect } from 'react'
import {Edit, Image, Loader, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import CreateHouseType from '../FloorsHouse/CreateHouseType';
import EditHouseType from './EditHouseType';

export default function HouseTypes() {
    const {apartment_id} = useParams();
    //console.log('Apartment ID:', apartment_id);  
    const [loadingHouseTypes,setLoadingHouseTypes] = useState(false);
    const [error, setError] = useState(null);
    const [housetype,setHouseType] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedHouseType, setSelectedHouseType] = useState(null);
    // const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    // const [deactivatinghouseType, setDeactivatingHouseType] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingHouseType, setDeletingHouseType] = useState(null);

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

    //create House Type
    const handleAddNew = () =>{
        setShowCreateModal(true);
    }

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateHouseType = () => {
        loadHouseTypes();
        setShowCreateModal(false);
        toast.success('House Type Created Successfully');
    }

    //Update house types
    const handleEdit = (housetype) => {
        setSelectedHouseType(housetype);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedHouseType(null);
    };

    const handleHouseTypeUpdated = () => {
        loadHouseTypes();
        setShowEditModal(false);
        toast.success('House Type updated successfully!');
    };

    // //Deactivate / Activate House Type
    // const confirmDeactivate = (housetype) => {
    //     setDeactivatingHouseType(housetype);
    //     setShowDeactivateModal(true);
    // };

    // const cancelDeactivate = () => {
    //     setShowDeactivateModal(false);
    //     setDeactivatingHouseType(null);
    // }

    // const handleToggle = async (housetype) => {
    //     try {
    //         const result = await api.patch(`/housetype/${housetype.id}/toggle`);
    //         toast.success(result.data.message);
    //         loadHouseTypes(); 
    //     } catch (err) {
    //         console.error('Error toggling house type:', err);
    //         toast.error('Failed to toggle house type status');
    //     }
    // };

     //Delete house type
  const handleDeleteClick = (housetype) => {
    setDeletingHouseType(housetype);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!deletingHouseType) return;
      await api.delete(`/houseType/${deletingHouseType.id}`);
      toast.success('House type deleted successfully');
      setShowDeleteModal(false);
      setDeletingHouseType(null);
      loadHouseTypes();
    } catch (err) {
      console.error('Delete house type error:', err);
      toast.error('Failed to delete house type');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingHouseType(null);
  };


  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300'>
        <button onClick={handleAddNew}
        className='flex items-center gap-2 mb-3 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
            <Plus size={20} />
            <span>New House Type</span>
        </button>
        {loadingHouseTypes ? (
            <div className="flex justify-center items-center py-12">
                <Loader size={32} className="animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading House types...</span>
            </div>
        ) : error ? (
            <div className="text-center py-12 text-red-600 dark:text-red-400">
                {error}
                <button
                    onClick={loadHouseTypes}
                    className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    Retry
                </button>
            </div>
        ) : housetype.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                <Image size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg">No house types found</p>
                <p className="text-sm">Get started by adding house types</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SQR Feet</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No of Rooms</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No of Bathrooms</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {housetype.map((housetype) => (
                            <tr key={housetype.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {housetype.name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {housetype.sqrfeet}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {housetype.rooms}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {housetype.bathrooms}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(housetype);
                                            }}
                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                            title="Edit"
                                            >
                                            <Edit size={20} />
                                        </button>
                                        {/* <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // prevent row click
                                                confirmDeactivate(housetype);
                                            }}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            title={housetype.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                            {housetype.is_active ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}
                                        </button> */}
                                        <button
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(housetype);
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
        {showCreateModal && (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    >
                    ✖
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Add New House Types
                    </h2>
                    <CreateHouseType
                        onClose={handleCloseModal} 
                        onCreated={handleCreateHouseType}
                        apartment_id={apartment_id}
                    />
                </div>
            </div>
        )}
        {showEditModal && selectedHouseType && (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button
                    onClick={handleCloseEditModal}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                    ✖
                </button>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Update the House Type
                </h2>
                <EditHouseType
                    onClose={handleCloseEditModal}
                    onUpdated={handleHouseTypeUpdated}
                    housetype={selectedHouseType}
                />
                </div>
            </div>
        )}
        {/* {showDeactivateModal && (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    {deactivatinghouseType?.is_active
                    ? "Confirm Deactivation of House type"
                    : "Confirm Activation of House Type"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {deactivatinghouseType?.is_active
                    ? "Are you sure you want to deactivate this type?"
                    : "Are you sure you want to activate this type?"}
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
                        if (deactivatinghouseType) {
                        handleToggle(deactivatinghouseType);
                        setShowDeactivateModal(false);
                        setDeactivatingHouseType(null);
                        }
                    }}
                    className={`px-4 py-2 rounded-md text-white transition-colors duration-200 ${
                        deactivatinghouseType?.is_active
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    >
                    {deactivatinghouseType?.is_active ? "Deactivate" : "Activate"}
                    </button>
                </div>
                </div>
            </div>
        )} */}

        {showDeleteModal && deletingHouseType && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{deletingHouseType.name}"?
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
  )
}
