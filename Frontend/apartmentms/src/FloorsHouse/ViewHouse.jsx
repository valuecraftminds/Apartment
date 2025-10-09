import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ChevronLeft, House } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate, useParams } from 'react-router-dom';

export default function ViewHouse() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("type");
    const { apartment_id, floor_id, id } = useParams();
    console.log('Apartment Id:',apartment_id);
    console.log('Floor ID: ',floor_id);
    console.log("House ID: ",id);
    const [apartment, setApartment] = useState(null);
    const [floor, setFloor] = useState(null);
    const [house, setHouse] = useState(null);
    const [housetype, setHouseType] = useState(null);
    const [houseowner,setHouseOwner] = useState(null);

    const navigate = useNavigate();

    // Fetch apartment
    useEffect(() => {
        if (!apartment_id) return;
        api.get(`/apartments/${apartment_id}`)
            .then(res => res.data.success && setApartment(res.data.data))
            .catch(err => console.error('Error fetching apartment:', err));
    }, [apartment_id]);

    // Fetch floor
    useEffect(() => {
        if (!floor_id) return;
        api.get(`/floors/${floor_id}`)
            .then(res => res.data.success && setFloor(res.data.data))
            .catch(err => console.error('Error fetching floor:', err));
    }, [floor_id]);

    // Fetch house
    useEffect(() => {
        if (!id) return;
        api.get(`/houses/${id}`)
            .then(res => res.data.success && setHouse(res.data.data))
            .catch(err => console.error("Error fetching house:", err));
    }, [id]);

    // Fetch house type when house is loaded
    useEffect(() => {
        if (house?.housetype_id) {
            api.get(`/housetype/${house.housetype_id}`)
                .then(res => res.data.success && setHouseType(res.data.data))
                .catch(err => console.error("Error fetching house type:", err));
        }
    }, [house]);

    //Fetch House owner
    useEffect(() => {
        if(house?.house_owner_id){
            api.get(`/houseowner/${house.house_owner_id}`)
                .then(res => res.data.success && setHouseOwner(res.data.data))
                .catch(err => console.error("Error fetching house owner: ", err));
        }
    },[house]);

    const handleBack = () => {
        navigate(`/houses/${apartment_id}/${floor_id}`);
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
            <Sidebar />
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Navbar />
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {/* Title */}
                        <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                            <div className='flex flex-col'>
                                <div className='flex items-center'>
                                    <button onClick={handleBack} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                                        <ChevronLeft size={25} />
                                    </button>
                                    <House size={40} className='text-purple-600 dark:text-purple-400 mr-3 ml-3' />
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">House Details</h1>
                                </div>
                                {apartment && 
                                    <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                        Apartment: {apartment.name}
                                    </div>}
                                {floor && 
                                    <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                        Floor: {floor.floor_id}
                                    </div>}
                                {house && (
                                    <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                        {/* <p>House ID: {house.id}</p> */}
                                        <p>House No: {house.house_id}</p>
                                        {/* <p>Status: {house.status}</p> */}
                                    </div>
                                )}
                            </div>
                        </div>

                        
                        {/* Tabs */}
                        <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-4">
                            <button
                                onClick={() => setActiveTab("type")}
                                className={`px-4 py-2 font-semibold 
                                    ${activeTab === "type"
                                        ? "text-purple-600 border-b-2 border-purple-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                            >
                                House Type
                            </button>
                            <button
                                onClick={() => setActiveTab("owner")}
                                className={`px-4 py-2 font-semibold 
                                    ${activeTab === "owner"
                                        ? "text-purple-600 border-b-2 border-purple-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                            >
                                House Owner
                            </button>
                            <button
                                onClick={() => setActiveTab("family")}
                                className={`px-4 py-2 font-semibold 
                                    ${activeTab === "family"
                                        ? "text-purple-600 border-b-2 border-purple-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                            >
                                Family
                            </button>
                        </div>

                        {/* Content */}
                        {activeTab === "type" && housetype && (
                            <div className="mt-1 text-gray-700 dark:text-gray-300 font-semibold space-y-2">
                                <p><strong>Type:</strong> {housetype.name}</p>
                                <p><strong>Members:</strong> {housetype.members}</p>
                                <p><strong>Square Feet:</strong> {housetype.sqrfeet}</p>
                                <p><strong>Rooms:</strong> {housetype.rooms}</p>
                                <p><strong>Bathrooms:</strong> {housetype.bathrooms}</p>
                            </div>
                        )}
                        {activeTab === "owner" && houseowner && (
                            <div className="mt-1 text-gray-700 dark:text-gray-300 font-semibold space-y-2">
                                <p><strong>Name:</strong> {houseowner.name}</p>
                                <p><strong>NIC:</strong> {houseowner.nic}</p>
                                <p><strong>Occupation:</strong> {houseowner.occupation}</p>
                                <p><strong>Country:</strong> {houseowner.country}</p>
                                <p><strong>Mobile:</strong> {houseowner.mobile}</p>
                                <p><strong>occupied way:</strong> {houseowner.occupied_way}</p>
                                {/* <p><strong>Proof:</strong> {houseowner.proof}</p> */}
                            </div>
                        )}
                        {/* {activeTab === "family" && housetype && (
                            <div className="mt-1 text-gray-700 dark:text-gray-300 font-semibold space-y-2">
                                <p><strong>Type:</strong> {housetype.name}</p>
                                <p><strong>Members:</strong> {housetype.members}</p>
                                <p><strong>Square Feet:</strong> {housetype.sqrfeet}</p>
                                <p><strong>Rooms:</strong> {housetype.rooms}</p>
                                <p><strong>Bathrooms:</strong> {housetype.bathrooms}</p>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>
        </div>
    );
}
