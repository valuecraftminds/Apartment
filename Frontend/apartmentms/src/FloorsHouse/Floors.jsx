import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Building, Building2, ChevronLeft, Edit, Image, Loader, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import CreateFloors from './CreateFloors';
import EditFloors from './EditFloors';
import { toast, ToastContainer } from 'react-toastify';

export default function Floors() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const {id} = useParams();
    console.log('Apartment ID:', id);
    const [apartment, setApartment] = useState(null);
    const navigate = useNavigate();
    const [floors, setFloors] = useState([]);
    const [error, setError] = useState(null);
    const [loadingFloors, setLoadingFloors] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivatingFloor, setDeactivatingFloor] = useState(null);

    

    useEffect(() => {
        const fetchApartment = async () => {
            try {
                const res = await api.get(`/apartments/${id}`);
                if (res.data.success) {
                    setApartment(res.data.data); // set the apartment object
                }
            } catch (err) {
                console.error('Error fetching apartment:', err);
            }
        };
        if (id) fetchApartment();
    }, [id]);

    const handleBack = () => {
        navigate('/apartmentview');
    };

    const loadFloors = async () => {
    try {
        setLoadingFloors(true);
        setError(null);
        //get the floor through apartment id
        const result = await api.get(`/floors?apartment_id=${id}`); 
        console.log('API Response:', result.data);

        if (result.data.success && Array.isArray(result.data.data)) {
            setFloors(result.data.data);
        } else {
            setFloors([]);
        }
    } catch (err) {
        console.error('Error loading floors:', err);
        setError('Failed to load floors. Please try again.');
    } finally {
         setLoadingFloors(false);
    }
};

    useEffect(() => {
        loadFloors();
    }, [id]);

  const handleHouseView = (floor) => {
  navigate(`/houses/${id}/${floor.id}`); // pass both apartment id and floor id
};

const confirmDeactivate = (floor) => {
        setDeactivatingFloor(floor);
        setShowDeactivateModal(true);
    };

    const cancelDeactivate = () => {
        setShowDeactivateModal(false);
        setDeactivatingFloor(null);
    }

    const handleToggle = async (floor) => {
        try {
            const result = await api.patch(`/floors/${floor.id}/toggle`);
            toast.success(result.data.message);
            loadFloors(); 
        } catch (err) {
            console.error('Error toggling floor:', err);
            toast.error('Failed to toggle floor status');
        }
    };

    //Add floors
    const handleAddNew = () =>{
        setShowCreateModal(true);
    }

    const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleFloorsCreated = () => {
          loadFloors();
          setShowCreateModal(false);
          toast.success('Floor created successfully!');
      };

    const handleEdit = (floor) => {
    setSelectedFloor(floor);
    setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedFloor(null);
    };

    const handleFloorUpdated = () => {
    loadFloors();
    setShowEditModal(false);
    toast.success('Floor updated successfully!');
    };

  return (    
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
        <Sidebar onCollapse={setIsSidebarCollapsed}/>
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <Navbar/>
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl">
                    <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                        <div className='flex flex-col'>
                            <div className='flex items-center'>
                                <button onClick ={handleBack} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                                    <ChevronLeft size={25} />
                                </button>
                                <Building size={40} className='text-purple-600 dark:text-purple-400 mr-3 ml-3'/>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Floors</h1>
                            </div>
                            {/* Apartment name below the title */}
                            {apartment && (
                                <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                    Apartment: {apartment.name}
                                </div>
                            )}
                        </div>
                        <button onClick={handleAddNew} className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                            <Plus size={20}/>
                            <span>Add New</span>
                        </button>
                    </div>
                        <div className='bg-white dark:bg-gray-800 rounded-2xl p-6'>
                            {loadingFloors ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader size={32} className="animate-spin text-purple-600" />
                                        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading floors...</span>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12 text-red-600 dark:text-red-400">
                                        {error}
                                        <button 
                                            onClick={loadFloors}
                                            className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : floors.length === 0 ? (
                                    <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                                        <Image size={48} className="mx-auto mb-4 text-gray-400" />
                                        <p className="text-lg">No floors found</p>
                                        <p className="text-sm">Get started by adding floors</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full table-auto">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Floor</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">House Count</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {floors.map((floor, index) => (
                                                    <tr 
                                                        key={floor.id || index} 
                                                        onClick={() => floor.is_active && handleHouseView(floor)} 
                                                        className={`transition-colors cursor-pointer ${
                                                            floor.is_active 
                                                                ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
                                                                : 'opacity-50 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {floor.floor_id}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {floor.house_count}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            <span
                                                                className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                                ${
                                                                    floor.status === "active"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : floor.status === "maintenance"
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                    : floor.status === "partial"
                                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                                                }`}
                                                            >
                                                                {floor.status.charAt(0).toUpperCase() + floor.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEdit(floor);
                                                                    }}
                                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                    title="Edit"
                                                                    >
                                                                    <Edit size={20} />
                                                                    </button>
                                                                <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // prevent row click
                                                                    confirmDeactivate(floor);
                                                                    // handleToggle(floor);
                                                                }}
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                title={floor.is_active ? 'Deactivate' : 'Activate'}
                                                                >
                                                                {floor.is_active ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}
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
                        Create Floors
                    </h2>
                    <CreateFloors
                        onClose={handleCloseModal} 
                        onCreated={handleFloorsCreated}
                        apartment_id={id}
                    />
                </div>
            </div>
        )}
        {showEditModal && selectedFloor && (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button
                    onClick={handleCloseEditModal}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                    ✖
                </button>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Edit Floor
                </h2>
                <EditFloors
                    onClose={handleCloseEditModal}
                    onUpdated={handleFloorUpdated}
                    floor={selectedFloor}
                />
                </div>
            </div>
        )}
        {showDeactivateModal && (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    {deactivatingFloor?.is_active
                    ? "Confirm Deactivation of Floor"
                    : "Confirm Activation of Floor"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {deactivatingFloor?.is_active
                    ? "Are you sure you want to deactivate this floor?"
                    : "Are you sure you want to activate this floor?"}
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
                        if (deactivatingFloor) {
                        handleToggle(deactivatingFloor);
                        setShowDeactivateModal(false);
                        setDeactivatingFloor(null);
                        }
                    }}
                    className={`px-4 py-2 rounded-md text-white transition-colors duration-200 ${
                        deactivatingFloor?.is_active
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                    >
                    {deactivatingFloor?.is_active ? "Deactivate" : "Activate"}
                    </button>
                </div>
                </div>
            </div>
        )}
        <ToastContainer position="top-center" autoClose={3000} />
    </div>
  )
}
