import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { ChevronLeft, Edit, House, Image, Loader, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import HouseTypes from './HouseTypes';
import ViewHouse from './ViewHouse';
import CreateHouse from './CreateHouse';
import { toast, ToastContainer } from 'react-toastify';
import EditHouse from './EditHouse';
import Bills from '../Bills/Bills';

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
    

    const [activeTab, setActiveTab] = useState("houses");

   const [selectedHouse, setSelectedHouse] = useState(null);

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
                                <button onClick={handleAddNew} className='flex items-center gap-2 mb-4 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                                    <Plus size={20} />
                                    <span>New House</span>
                                </button>
                                
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
                                                                {house.house_id}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {housetype.find(ht => ht.id === house.housetype_id)?.name || "N/A"}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {house.status}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                                {house.created_at}
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                                <div className="flex space-x-2">
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
            
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    )
}