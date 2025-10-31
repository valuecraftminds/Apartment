import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { ChevronLeft, FileText, House } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import CalculateBill from '../Bills/CalculateBill';

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
    // const [calculateBill,setCalculateBill] = useState(null);
    const [assignedBills, setAssignedBills] = useState([]);
    const [loadingAssignedBills, setLoadingAssignedBills] = useState(false);


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
        if(house?.houseowner_id){
            api.get(`/houseowner/${house.houseowner_id}`)
                .then(res => res.data.success && setHouseOwner(res.data.data))
                .catch(err => console.error("Error fetching house owner: ", err));
        }
    },[house]);

     // Fetch assigned bills for this house
    useEffect(() => {
        if (id) {
            fetchAssignedBills();
        }
    }, [id]);

    const fetchAssignedBills = async () => {
        try {
            setLoadingAssignedBills(true);
            const response = await api.get(`/bill-assignments/house/${id}`);
            if (response.data.success) {
                setAssignedBills(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching assigned bills:', error);
            setAssignedBills([]);
        } finally {
            setLoadingAssignedBills(false);
        }
    };

    const handleBack = () => {
        navigate(`/houses/${apartment_id}/${floor_id}`);
    };

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
                            <button
                                onClick={() => setActiveTab("assignedBills")}
                                className={`px-4 py-2 font-semibold 
                                    ${activeTab === "assignedBills"
                                        ? "text-purple-600 border-b-2 border-purple-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                            >
                                Assigned Bills
                            </button>
                        </div>

                        {/* Content */}
                        {activeTab === "type" && housetype && (
                            <div className="mt-1 text-gray-700 dark:text-gray-300 font-semibold space-y-2">
                                <p><strong>Type:</strong> {housetype.name}</p>
                                <p><strong>Square Feet:</strong> {housetype.sqrfeet}</p>
                                <p><strong>Rooms:</strong> {housetype.rooms}</p>
                                <p><strong>Bathrooms:</strong> {housetype.bathrooms}</p>
                            </div>
                        )}
                        {activeTab === "owner" && houseowner && (
                            <div className="mt-1 text-gray-700 dark:text-gray-300 font-semibold space-y-2">
                                <p><strong>Name:</strong> {houseowner.name}</p>
                                <p><strong>NIC:</strong> {houseowner.NIC}</p>
                                <p><strong>Occupation:</strong> {houseowner.occupation}</p>
                                <p><strong>Country:</strong> {houseowner.country}</p>
                                <p><strong>Mobile:</strong> {houseowner.mobile}</p>
                                <p><strong>Email:</strong>{houseowner.email}</p>
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
                        {activeTab === "assignedBills" && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                    <FileText className="mr-2" size={20} />
                                    Assigned Bills
                                </h3>
                                
                                {loadingAssignedBills ? (
                                    <div className="flex justify-center items-center py-8">
                                        <Loader size={24} className="animate-spin text-purple-600 mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">Loading assigned bills...</span>
                                    </div>
                                ) : assignedBills.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <FileText size={48} className="mx-auto mb-3 opacity-50" />
                                        <p>No bills assigned to this house</p>
                                        <p className="text-sm">Bills will appear here once they are assigned to this house</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {assignedBills.map((assignment) => (
                                            <div 
                                                key={assignment.id}
                                                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <DollarSign size={18} className="text-green-600 mr-2" />
                                                            <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                                                                {assignment.bill?.bill_name || 'Unknown Bill'}
                                                            </h4>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                            <div className="flex items-center">
                                                                <span className="font-medium mr-2">Type:</span>
                                                                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                                                                    {assignment.bill?.billtype || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Calendar size={14} className="mr-2" />
                                                                <span className="font-medium mr-2">Assigned:</span>
                                                                <span>{formatDate(assignment.assigned_date)}</span>
                                                            </div>
                                                        </div>
                                                        {assignment.bill?.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                {assignment.bill.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            assignment.status === 'active' 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {assignment.status || 'active'}
                                                        </span>
                                                        {/* You can add action buttons here if needed */}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Optional: Show CalculateBill component below the assigned bills */}
                                {/* <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <CalculateBill apartment_id={apartment_id} />
                                </div> */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
