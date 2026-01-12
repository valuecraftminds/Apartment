// GenerateSharedValueBill.jsx to create bill
import React, { useState, useEffect } from 'react'
import api from '../api/axios';

export default function GenerateSharedValueBill({ onClose, onCreated,apartment_id }) {
    const [loadingBills, setLoadingBills] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [bills, setBills] = useState([]);
    const [selectedBill, setSelectedBill] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [assignedHousesCount, setAssignedHousesCount] = useState(0);
    const [unitPrice, setUnitPrice] = useState(0);
    const [loadingHouses, setLoadingHouses] = useState(false);
    const [apartments, setApartments] = useState([]);
    const [loadingApartments, setLoadingApartments] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [houseTypes, setHouseTypes] = useState([]);
    
    // New state for selections
    const [selectedApartment, setSelectedApartment] = useState('');
    const [selectedFloors, setSelectedFloors] = useState([]);
    const [selectedHouses, setSelectedHouses] = useState([]);
    const [housesData, setHousesData] = useState([]);
    const [floorsData, setFloorsData] = useState([]);
    const [generationMode, setGenerationMode] = useState('apartment'); // 'apartment', 'floor', 'house'
    const [calculationMethod, setCalculationMethod] = useState('house_count'); 

    // Load only Shared bills
    const loadBills = async () => {
        try {
            setLoadingBills(true);
            setError(null);
            const result = await api.get('/bills');
            if (result.data.success && Array.isArray(result.data.data)) {
                const sharedBills = result.data.data.filter(bill => bill.billtype === 'Shared');
                setBills(sharedBills);
            } else {
                setBills([]);
            }
        } catch (err) {
            console.error('Error loading bills:', err);
            setError('Failed to load bills. Please try again.');
        } finally {
            setLoadingBills(false);
        }
    };

    const loadApartments = async () => {
        try {
            setLoadingApartments(true);
            const result = await api.get('/apartments');
            if (result.data.success) {
                setApartments(result.data.data || []);
            }
        } catch (err) {
            console.error('Error loading apartments:', err);
        } finally {
            setLoadingApartments(false);
        }
    };

    // Load assigned houses and floors when bill and apartment are selected
    const loadAssignedHousesDetails = async (billId, apartmentId) => {
        if (!billId || !apartmentId) {
            setHousesData([]);
            setFloorsData([]);
            setAssignedHousesCount(0);
            return;
        }
        
        try {
            setLoadingHouses(true);
            const response = await api.get(`/generate-bills/assigned-houses/details?bill_id=${billId}&apartment_id=${apartmentId}`);
            if (response.data.success) {
                setHousesData(response.data.data.houses || []);
                setFloorsData(response.data.data.floors || []);
                setAssignedHousesCount(response.data.data.houses.length);
                
                // Calculate unit price if total amount is set
                if (totalAmount && response.data.data.houses.length > 0) {
                    const calculatedUnitPrice = parseFloat(totalAmount) / response.data.data.houses.length;
                    setUnitPrice(calculatedUnitPrice);
                } else {
                    setUnitPrice(0);
                }
            }
        } catch (error) {
            console.error('Error fetching assigned houses details:', error);
            setHousesData([]);
            setFloorsData([]);
            setAssignedHousesCount(0);
        } finally {
            setLoadingHouses(false);
        }
    };

    useEffect(() => {
        loadBills();
        loadApartments();
    }, []);

    // Handle apartment selection
    const handleApartmentChange = (apartmentId) => {
        setSelectedApartment(apartmentId);
        setSelectedFloors([]);
        setSelectedHouses([]);
        
        if (apartmentId && selectedBill) {
            loadAssignedHousesDetails(selectedBill, apartmentId);
        } else {
            setHousesData([]);
            setFloorsData([]);
            setAssignedHousesCount(0);
        }
    };

    // Handle bill selection
    const handleBillChange = (billId) => {
        setSelectedBill(billId);
        if (billId && selectedApartment) {
            loadAssignedHousesDetails(billId, selectedApartment);
        } else {
            setHousesData([]);
            setFloorsData([]);
            setAssignedHousesCount(0);
        }
    };

    // Handle floor selection
    const handleFloorSelect = (floorId) => {
        setSelectedFloors(prev => 
            prev.includes(floorId) 
                ? prev.filter(id => id !== floorId)
                : [...prev, floorId]
        );
    };

    // Handle house selection
    const handleHouseSelect = (houseId) => {
        setSelectedHouses(prev => 
            prev.includes(houseId) 
                ? prev.filter(id => id !== houseId)
                : [...prev, houseId]
        );
    };

    // Select all houses in a floor
    const handleSelectAllHousesInFloor = (floorId) => {
        const floorHouses = housesData.filter(house => house.floor_id === floorId);
        const floorHouseIds = floorHouses.map(house => house.house_id);
        
        setSelectedHouses(prev => {
            const allSelected = floorHouseIds.every(id => prev.includes(id));
            if (allSelected) {
                // Deselect all
                return prev.filter(id => !floorHouseIds.includes(id));
            } else {
                // Select all
                return [...new Set([...prev, ...floorHouseIds])];
            }
        });
    };

    // Handle total amount change and recalculate unit price
    // const handleTotalAmountChange = (amount) => {
    //     setTotalAmount(amount);
        
    //     let count = assignedHousesCount;
    //     if (generationMode === 'floor' && selectedFloors.length > 0) {
    //         count = housesData.filter(house => selectedFloors.includes(house.floor_id)).length;
    //     } else if (generationMode === 'house' && selectedHouses.length > 0) {
    //         count = selectedHouses.length;
    //     }
        
    //     if (amount && count > 0) {
    //         const calculatedUnitPrice = parseFloat(amount) / count;
    //         setUnitPrice(calculatedUnitPrice);
    //     } else {
    //         setUnitPrice(0);
    //     }
    // };
    const handleTotalAmountChange = (amount) => {
        setTotalAmount(amount);
        
        let houses = [];
        if (generationMode === 'apartment') {
            houses = housesData;
        } else if (generationMode === 'floor' && selectedFloors.length > 0) {
            houses = housesData.filter(house => selectedFloors.includes(house.floor_id));
        } else if (generationMode === 'house' && selectedHouses.length > 0) {
            houses = housesData.filter(house => selectedHouses.includes(house.house_id));
        }
        
        if (amount && houses.length > 0) {
            if (calculationMethod === 'square_footage') {
                // Need to fetch square footage data for calculation
                // This would require an API call to get square footage data
                // For now, we'll show a placeholder
                setUnitPrice(0); // Will be calculated on the server
            } else {
                // Original house count calculation
                const calculatedUnitPrice = parseFloat(amount) / houses.length;
                setUnitPrice(calculatedUnitPrice);
            }
        } else {
            setUnitPrice(0);
        }
    };


    // Handle generation mode change
    const handleGenerationModeChange = (mode) => {
        setGenerationMode(mode);
        setSelectedFloors([]);
        setSelectedHouses([]);
    };

    const handleGenerateBill = async () => {
        if (!selectedBill) {
            setError('Please select a bill.');
            return;
        }

        if (!selectedApartment) {
            setError('Please select an apartment.');
            return;
        }

        if (!totalAmount || parseFloat(totalAmount) <= 0) {
            setError('Please enter a valid total amount.');
            return;
        }

        let count = 0;
        if (generationMode === 'apartment') {
            count = assignedHousesCount;
        } else if (generationMode === 'floor') {
            count = selectedFloors.length > 0 ? housesData.filter(house => selectedFloors.includes(house.floor_id)).length : 0;
        } else if (generationMode === 'house') {
            count = selectedHouses.length;
        }

        if (count === 0) {
            setError('No houses selected for bill generation.');
            return;
        }

        // try {
        //     setGenerating(true);
        //     setError(null);

        //     let response;
            
        //     if (generationMode === 'apartment') {
        //         // Original apartment-level generation
        //         const billData = {
        //             bill_id: selectedBill,
        //             year: year,
        //             month: month,
        //             totalAmount: parseFloat(totalAmount),
        //             assignedHouses: assignedHousesCount,
        //             unitPrice: unitPrice,
        //             apartment_id: selectedApartment,
        //             due_date: dueDate || null
        //         };

        //         response = await api.post('/generate-bills', billData);
        //     } else {
        //         // Floor or house level generation
        //         const billData = {
        //             bill_id: selectedBill,
        //             year: year,
        //             month: month,
        //             totalAmount: parseFloat(totalAmount),
        //             apartment_id: selectedApartment,
        //             selected_floors: generationMode === 'floor' ? selectedFloors : [],
        //             selected_houses: generationMode === 'house' ? selectedHouses : []
        //         };

        //         response = await api.post('/generate-bills/multiple', billData);
        //     }
            
        //     if (response.data.success) {
        //         onCreated(response.data.data);
        //     } else {
        //         setError(response.data.message || 'Failed to generate bill');
        //     }
        const billData = {
        bill_id: selectedBill,
        year: year,
        month: month,
        totalAmount: parseFloat(totalAmount),
        apartment_id: selectedApartment,
        selected_floors: generationMode === 'floor' ? selectedFloors : [],
        selected_houses: generationMode === 'house' ? selectedHouses : [],
        calculation_method: calculationMethod, // Add this line
        due_date: dueDate || null
    };

     try {
        setGenerating(true);
        setError(null);
        
        let response;
        
        if (generationMode === 'apartment' && calculationMethod === 'house_count') {
            // ... existing code ...
        } else {
            // Use multiple bills generation for floor/house selection or square footage
            response = await api.post('/generate-bills/multiple', billData);
        }
        
        if (response.data.success) {
            onCreated(response.data.data);
            if (response.data.summary && calculationMethod === 'square_footage') {
                // Show square footage summary
                const summary = response.data.summary;
                alert(`Bills generated successfully!\n\n` +
                      `Calculation Method: Square Footage\n` +
                      `Total Houses: ${summary.totalHouses}\n` +
                      `Total Square Feet: ${summary.totalSqrFeet.toFixed(2)}\n` +
                      `Price per sq ft: $${summary.pricePerSqrFt.toFixed(4)}\n` +
                      `Total Amount: $${summary.totalAmount.toFixed(2)}`);
            }
        } else {
            setError(response.data.message || 'Failed to generate bill');
        }

    } catch (err) {
        console.error('Error generating bill:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Failed to generate bill. Please try again.';
        
        if (calculationMethod === 'square_footage') {
            // Add helpful hints for square footage errors
            setError(`${errorMsg}\n\nPlease check:\n1. Houses are assigned to this bill\n2. Houses have house types linked\n3. House types have square footage defined`);
        } else {
            setError(errorMsg);
        }
    } finally {
        setGenerating(false);
    }
};

    // Get selected bill name for display
    const getSelectedBillName = () => {
        const bill = bills.find(b => b.id === selectedBill);
        return bill ? bill.bill_name : '';
    };

    // Get selected apartment name for display
    const getSelectedApartmentName = () => {
        const apartment = apartments.find(a => a.id === selectedApartment);
        return apartment ? apartment.name : '';
    };

    // Get houses count for current selection
    const getCurrentHousesCount = () => {
        if (generationMode === 'apartment') {
            return assignedHousesCount;
        } else if (generationMode === 'floor') {
            return housesData.filter(house => selectedFloors.includes(house.floor_id)).length;
        } else if (generationMode === 'house') {
            return selectedHouses.length;
        }
        return 0;
    };

    useEffect(() => {
        const fetchHouseTypes = async () => {
            try {
                const res = await api.get(`/housetype?apartment_id=${apartment_id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setHouseTypes(res.data.data || []);
            } catch (err) {
                console.error("Error fetching house types:", err);
            }
        };
        fetchHouseTypes();
    }, [apartment_id]);

    return (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 pl-1">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                </div>
            )}

            {/* Year and Month Selection */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Year *
                    </label>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                        {[2023, 2024, 2025].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Month *
                    </label>
                    <select
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    >
                        {['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Due Date (Optional)
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            {/* Bill Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Shared Bill *
                </label>
                <select
                    value={selectedBill}
                    onChange={(e) => handleBillChange(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    disabled={loadingBills}
                >
                    <option value="">Select a Shared Bill</option>
                    {bills.map(bill => (
                        <option key={bill.id} value={bill.id}>{bill.bill_name}</option>
                    ))}
                </select>
                {loadingBills && (
                    <p className="text-xs text-gray-500 mt-1">Loading bills...</p>
                )}
            </div>

            {/* Apartment Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Apartment *
                </label>
                <select
                    value={selectedApartment}
                    onChange={(e) => handleApartmentChange(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    disabled={loadingApartments}
                >
                    <option value="">Select an Apartment</option>
                    {apartments.map(apartment => (
                        <option key={apartment.id} value={apartment.id}>{apartment.name}</option>
                    ))}
                </select>
                {loadingApartments && (
                    <p className="text-xs text-gray-500 mt-1">Loading apartments...</p>
                )}
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Calculation Method *
                </label>
                <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                        <input
                            type="radio"
                            id="house_count"
                            name="calculation_method"
                            value="house_count"
                            checked={calculationMethod === 'house_count'}
                            onChange={(e) => setCalculationMethod(e.target.value)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <label htmlFor="house_count" className="text-sm text-gray-700 dark:text-gray-300">
                            Divide by House Count (Equal division)
                        </label>
                    </div>
                    <div className="flex items-center space-x-3">
                        <input
                            type="radio"
                            id="square_footage"
                            name="calculation_method"
                            value="square_footage"
                            checked={calculationMethod === 'square_footage'}
                            onChange={(e) => setCalculationMethod(e.target.value)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                        />
                        <label htmlFor="square_footage" className="text-sm text-gray-700 dark:text-gray-300">
                            Divide by Square Footage (Proportional)
                        </label>
                    </div>
                </div>
                {calculationMethod === 'square_footage' && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Total amount will be divided proportionally based on each house's square footage
                    </p>
                )}
            </div>

            {/* Generation Mode Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Generation Scope
                </label>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        type="button"
                        onClick={() => handleGenerationModeChange('apartment')}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                            generationMode === 'apartment'
                                ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900 dark:border-purple-400 dark:text-purple-300'
                                : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                        }`}
                    >
                        Entire Apartment
                    </button>
                    <button
                        type="button"
                        onClick={() => handleGenerationModeChange('floor')}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                            generationMode === 'floor'
                                ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-400 dark:text-blue-300'
                                : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                        }`}
                    >
                        Select Floors
                    </button>
                    <button
                        type="button"
                        onClick={() => handleGenerationModeChange('house')}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                            generationMode === 'house'
                                ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900 dark:border-green-400 dark:text-green-300'
                                : 'bg-gray-100 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
                        }`}
                    >
                        Select Houses
                    </button>
                </div>
            </div>

            {/* Floor Selection (when mode is 'floor') */}
            {generationMode === 'floor' && selectedApartment && selectedBill && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Floors ({selectedFloors.length} selected)
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                        {loadingHouses ? (
                            <p className="text-xs text-gray-500">Loading floors...</p>
                        ) : floorsData.length === 0 ? (
                            <p className="text-xs text-gray-500">No floors found</p>
                        ) : (
                            floorsData.map(floor => (
                                <div key={floor.id} className="flex items-center space-x-2 py-1">
                                    <input
                                        type="checkbox"
                                        id={`floor-${floor.id}`}
                                        checked={selectedFloors.includes(floor.id)}
                                        onChange={() => handleFloorSelect(floor.id)}
                                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                    />
                                    <label htmlFor={`floor-${floor.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                                        Floor {floor.floor_id} ({floor.assigned_houses_count} houses)
                                    </label>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* House Selection (when mode is 'house') */}
            {generationMode === 'house' && selectedApartment && selectedBill && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Houses ({selectedHouses.length} selected)
                    </label>
                    <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2 bg-gray-50 dark:bg-gray-700">
                        {loadingHouses ? (
                            <p className="text-xs text-gray-500">Loading houses...</p>
                        ) : housesData.length === 0 ? (
                            <p className="text-xs text-gray-500">No houses found</p>
                        ) : (
                            floorsData.map(floor => {
                                const floorHouses = housesData.filter(house => house.floor_id === floor.id);
                                if (floorHouses.length === 0) return null;
                                
                                return (
                                    <div key={floor.id} className="mb-2">
                                        <div className="flex items-center space-x-2 py-1 border-b border-gray-200 dark:border-gray-600">
                                            <input
                                                type="checkbox"
                                                id={`floor-all-${floor.id}`}
                                                checked={floorHouses.every(house => selectedHouses.includes(house.house_id))}
                                                onChange={() => handleSelectAllHousesInFloor(floor.id)}
                                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                            />
                                            <label htmlFor={`floor-all-${floor.id}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Floor {floor.floor_id} ({floorHouses.length} houses)
                                            </label>
                                        </div>
                                        <div className="ml-4 mt-1 grid grid-cols-2 gap-1">
                                            {floorHouses.map(house => (
                                                <div key={house.house_id} className="flex items-center space-x-2 py-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`house-${house.house_id}`}
                                                        checked={selectedHouses.includes(house.house_id)}
                                                        onChange={() => handleHouseSelect(house.house_id)}
                                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                    />
                                                    <label htmlFor={`house-${house.house_id}`} className="text-xs text-gray-600 dark:text-gray-400">
                                                        House {house.house_number}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Total Amount Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Total Amount ($) *
                </label>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={totalAmount}
                    onChange={(e) => handleTotalAmountChange(e.target.value)} 
                    placeholder="Enter total amount"
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Calculation Summary */}
            {(selectedBill && selectedApartment && getCurrentHousesCount() > 0) && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <h4 className="font-medium text-gray-800 dark:text-white text-sm">
                        Calculation Summary
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Calculation Method:</span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {calculationMethod === 'house_count' ? 'House Count (Equal)' : 'Square Footage (Proportional)'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">Selected Bill:</span>
                            <p className="font-medium text-gray-800 dark:text-white">{getSelectedBillName()}</p>
                        </div>
                    </div>


                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600 dark:text-gray-400">
                                {generationMode === 'apartment' ? 'Total Houses:' :
                                 generationMode === 'floor' ? 'Selected Floors:' : 'Selected Houses:'}
                            </span>
                            <p className="font-medium text-gray-800 dark:text-white">
                                {loadingHouses ? (
                                    <span className="text-xs text-gray-500">Loading...</span>
                                ) : generationMode === 'floor' ? (
                                    `${selectedFloors.length} floors (${getCurrentHousesCount()} houses)`
                                ) : (
                                    getCurrentHousesCount()
                                )}
                            </p>
                        </div>
                    </div>

                    {/* {totalAmount && getCurrentHousesCount() > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                                    <p className="font-medium text-green-600 dark:text-green-400">${parseFloat(totalAmount).toFixed(2)}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
                                    <p className="font-medium text-purple-600 dark:text-purple-400">${unitPrice.toFixed(2)}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Calculation: ${totalAmount} ÷ {getCurrentHousesCount()} houses = ${unitPrice.toFixed(2)} per house
                            </p>
                        </div>
                    )} */}
                    {totalAmount && getCurrentHousesCount() > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                            {calculationMethod === 'house_count' ? (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                                        <p className="font-medium text-green-600 dark:text-green-400">${parseFloat(totalAmount).toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
                                        <p className="font-medium text-purple-600 dark:text-purple-400">${unitPrice.toFixed(2)}</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Amounts will be calculated proportionally based on each house's square footage
                                    </div>
                                </div>
                            )}
                            {calculationMethod === 'house_count' && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                    Calculation: ${totalAmount} ÷ {getCurrentHousesCount()} houses = ${unitPrice.toFixed(2)} per house
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
              

            {/* No assigned houses warning */}
            {selectedBill && selectedApartment && !loadingHouses && getCurrentHousesCount() === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {generationMode === 'apartment' 
                            ? '⚠️ No houses are assigned to this bill for the selected apartment.'
                            : generationMode === 'floor'
                            ? '⚠️ Please select at least one floor.'
                            : '⚠️ Please select at least one house.'
                        }
                    </p>
                </div>
            )}

            {/* Action Buttons - Sticky at bottom */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 pt-4 pb-2 -mx-2 px-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                        disabled={generating}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerateBill}
                        disabled={!selectedBill || !selectedApartment || !totalAmount || getCurrentHousesCount() === 0 || generating}
                        className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {generating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Generating...</span>
                            </>
                        ) : (
                            <span>
                                {generationMode === 'apartment' 
                                    ? 'Generate Bill' 
                                    : `Generate ${getCurrentHousesCount()} Bills`}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}