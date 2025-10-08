import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import { ChevronLeft, Edit, House, Image, Loader, Plus, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import HouseTypes from './HouseTypes';
import ViewHouse from './ViewHouse';

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

    const [activeTab, setActiveTab] = useState("houses"); // NEW: tab state

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
                                <button className='flex items-center gap-2 mb-3 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
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
                                    <div className="overflow-x-auto">
                                        <table className="w-full table-auto">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">House No</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Updated_at</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {houses.map((houses) => (
                                                    <tr
                                                        key={houses.id}
                                                        onClick={() => houses.is_active && handleHouseView(houses)}
                                                        className={`transition-colors cursor-pointer ${
                                                            houses.is_active 
                                                            ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
                                                            : 'opacity-50 cursor-not-allowed'
                                                        }`}
                                                        >
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.house_id}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {housetype.find(ht => ht.id === houses.housetype_id)?.name || "N/A"}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.status}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {houses.updated_at}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={20} />
                                                                </button>
                                                                <button
                                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                            </div>
                            ) : (
                            <HouseTypes/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
