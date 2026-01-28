//ManualBillMeter.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Home, Hash, Calendar, MessageSquare, Upload, Check, X, Loader, Building2, AlertCircle, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function ManualBillMeter() {
    const { bill_id } = useParams();
    const [loading, setLoading] = useState(true);
    const [apartment, setApartment] = useState(null);
    const [floors, setFloors] = useState([]);
    const [houses, setHouses] = useState([]);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [filteredHouses, setFilteredHouses] = useState([]);
    const [userAssignedBill, setUserAssignedBill] = useState(null);
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        meterReading: '',
        readingDate: new Date().toISOString().split('T')[0],
        previousReading: '',
        consumption: '',
        remarks: '',
        image: null,
        imagePreview: null
    });
    const [expandedFloor, setExpandedFloor] = useState(null);

    // Fetch user's assigned apartments
    const fetchUserApartments = async () => {
        try {
            const response = await api.get(`/user-apartments/users/${auth.user.id}/apartments`);
            if (response.data.success && response.data.data.length > 0) {
                setApartment(response.data.data[0]);
                return response.data.data[0];
            }
            return null;
        } catch (error) {
            console.error('Error fetching apartments:', error);
            toast.error('Error loading your apartments');
            return null;
        }
    };

    // Load floors for the apartment
    const loadFloors = async (apartment_id) => {
        try {
            const result = await api.get(`/floors?apartment_id=${apartment_id}`); 
            console.log('Floors API Response:', result.data);

            if (result.data.success && Array.isArray(result.data.data)) {
                setFloors(result.data.data);
            } else {
                setFloors([]);
            }
        } catch (err) {
            console.error('Error loading floors:', err);
            toast.error('Failed to load floors');
        }
    };

    // Fetch houses for a specific floor
    const fetchHouses = async (floor_id) => {
        try {
            const result = await api.get(`/houses?apartment_id=${apartment.id}&floor_id=${floor_id}`);
            if (result.data.success && Array.isArray(result.data.data)) {
                return result.data.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching houses:', error);
            toast.error('Error loading houses');
            return [];
        }
    };

    // Get user's assigned bill details
    const getUserAssignedBill = async () => {
        try {
            const response = await api.get(`/user-bills/users/${auth.user.id}/bills`);
            if (response.data.success && Array.isArray(response.data.data)) {
                // Find the bill matching the bill_id from URL
                const bill = response.data.data.find(b => b.id === bill_id);
                if (bill) {
                    setUserAssignedBill(bill);
                    return bill;
                } else {
                    toast.error('You are not assigned to this bill');
                    return null;
                }
            }
            return null;
        } catch (error) {
            console.error('Error fetching user assigned bill:', error);
            toast.error('Error loading bill information');
            return null;
        }
    };

    // Load assigned bills for a house
    const loadAssignedBillsForHouse = async (houseId) => {
        try {
            const res = await api.get(
                `/bill-assignments/house-details?house_id=${houseId}&apartment_id=${apartment.id}`
            );
            
            if (res.data.success && Array.isArray(res.data.data)) {
                // Return bill IDs assigned to this house
                return res.data.data.map(assignment => assignment.bill_id);
            }
            return [];
        } catch (err) {
            console.error(`Error loading bills for house ${houseId}`, err);
            return [];
        }
    };

    // Main data loading function
    const loadData = async () => {
        try {
            setLoading(true);
            
            // 1. Get user's assigned apartment
            const userApartment = await fetchUserApartments();
            if (!userApartment) {
                toast.error('No apartment assigned to you');
                setLoading(false);
                return;
            }

            // 2. Load floors for the apartment
            await loadFloors(userApartment.id);

            // 3. Get user's assigned bill
            const userBill = await getUserAssignedBill();
            if (!userBill) {
                setLoading(false);
                return;
            }

            setLoading(false);

        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load data');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (auth?.user?.id && bill_id) {
            loadData();
        }
    }, [auth?.user?.id, bill_id]);

    // Handle floor selection
    const handleFloorSelect = async (floor) => {
        setSelectedFloor(floor);
        setSelectedHouse(null);
        setFilteredHouses([]);
        
        try {
            // Load houses for this floor
            const floorHouses = await fetchHouses(floor.id);
            
            // Filter houses that have the user's assigned bill
            const accessibleHouses = [];
            for (const house of floorHouses) {
                const houseAssignedBillIds = await loadAssignedBillsForHouse(house.id);
                
                // Check if user's bill_id is in the house's assigned bills
                if (houseAssignedBillIds.includes(bill_id)) {
                    accessibleHouses.push({
                        ...house,
                        hasAccess: true
                    });
                }
            }
            
            setHouses(floorHouses);
            setFilteredHouses(accessibleHouses);
            
            if (accessibleHouses.length === 0) {
                toast.info(`No houses in this floor have ${userAssignedBill?.bill_name || 'this bill'} assigned`);
            }
        } catch (error) {
            console.error('Error loading houses for floor:', error);
            toast.error('Failed to load houses');
        }
    };

    // Handle house selection and navigation to calculate page
    const handleHouseSelect = (house) => {
        // Prepare data to pass to CalculateMeasurableBill
        const dataToPass = {
            house: {
                id: house.id,
                houseId: house.id,
                house_name: house.house_id,
                floor_id: selectedFloor?.id,
                floor_name: selectedFloor?.floor_id,
                apartment_id: apartment?.id,
                apartment_name: apartment?.name
            },
            bill: userAssignedBill,
        };
        
        // Navigate to CalculateMeasurableBill with proper data
        navigate(`/calculate-measurable-bill/${bill_id}`, {
            state: {
                manualData: dataToPass,
                source: 'manual'
            }
        });
    };

    // Toggle floor expansion
    const toggleFloorExpansion = (floorId) => {
        setExpandedFloor(expandedFloor === floorId ? null : floorId);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader size={32} className="animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading...</span>
            </div>
        );
    }

    if (!apartment) {
        return (
            <div className="text-center py-12">
                <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    No Apartment Assigned
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    You are not assigned to any apartment. Please contact your administrator.
                </p>
            </div>
        );
    }

    if (!userAssignedBill) {
        return (
            <div className="text-center py-12">
                <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    No Bill Access
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                    You are not assigned to this bill or the bill doesn't exist.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Select Floor & House */}
            <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                            <Home size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Select House</h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                {apartment.name} • {userAssignedBill.bill_name}
                            </p>
                        </div>
                    </div>

                    {/* Floor Selection */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                            <Layers size={18} className="mr-2" />
                            Select Floor
                        </h3>
                        {floors.length === 0 ? (
                            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                <p>No floors found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {floors.map((floor) => (
                                    <div key={floor.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleFloorExpansion(floor.id)}
                                            className={`w-full text-left p-3 flex justify-between items-center ${
                                                selectedFloor?.id === floor.id
                                                    ? 'bg-purple-50 dark:bg-purple-900/20'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="font-medium text-gray-800 dark:text-white">
                                                    {floor.floor_id}
                                                </span>
                                                {selectedFloor?.id === floor.id && (
                                                    <span className="ml-2 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                                                        Selected
                                                    </span>
                                                )}
                                            </div>
                                            {expandedFloor === floor.id ? (
                                                <ChevronUp size={18} className="text-gray-500" />
                                            ) : (
                                                <ChevronDown size={18} className="text-gray-500" />
                                            )}
                                        </button>
                                        
                                        {/* Houses for this floor */}
                                        {expandedFloor === floor.id && (
                                            <div className="border-t border-gray-200 dark:border-gray-600 p-3">
                                                {!selectedFloor || selectedFloor.id !== floor.id ? (
                                                    <button
                                                        onClick={() => handleFloorSelect(floor)}
                                                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                                    >
                                                        Load Houses for this Floor
                                                    </button>
                                                ) : filteredHouses.length === 0 ? (
                                                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                                                        <AlertCircle size={20} className="mx-auto mb-2" />
                                                        <p>No houses with {userAssignedBill.bill_name} assigned</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                        {filteredHouses.map((house) => (
                                                            <button
                                                                key={house.id}
                                                                onClick={() => handleHouseSelect(house)}
                                                                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                                                                    selectedHouse?.id === house.id
                                                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/20'
                                                                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded-lg">
                                                                        <Building2 size={16} className="text-gray-600 dark:text-gray-300" />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                                                            {house.house_id}
                                                                        </h4>
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            Click to calculate bill
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-purple-600 dark:text-purple-400">
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column - Empty or Information Panel */}
            <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                        <Home size={48} className="text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        Select a House
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-md">
                        Choose a floor and select a house from the list to calculate its {userAssignedBill.bill_name} bill.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>Available houses are those assigned with {userAssignedBill.bill_name}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}