import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CalculateMeasurableBill() {
    const { bill_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { auth } = useContext(AuthContext);
    
    // Get scanned data and bill data from location state
    const scannedData = location.state?.scannedData || null;
    const billData = location.state?.billData || null;
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [billRanges, setBillRanges] = useState([]);
    const [billPrices, setBillPrices] = useState([]);
    const [selectedRange, setSelectedRange] = useState(null);
    const [rangePrice, setRangePrice] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        used_units: ''
    });
    
    const [calculation, setCalculation] = useState(null);
    const [calculationDetails, setCalculationDetails] = useState([]);

    // Load bill ranges
    const loadBillRanges = async () => {
        try {
            const result = await api.get(`/billranges?bill_id=${bill_id}`);
            if (result.data.success && Array.isArray(result.data.data)) {
                // Filter by bill_id (ensure it's string comparison)
                const filtered = result.data.data.filter(range => 
                    range.bill_id && range.bill_id.toString() === bill_id.toString()
                );
                
                // Sort ranges by min_units in ascending order
                const sortedRanges = filtered.sort((a, b) => parseFloat(a.min_units) - parseFloat(b.min_units));
                setBillRanges(sortedRanges);
                
                // Select the first range by default
                if (sortedRanges.length > 0) {
                    setSelectedRange(sortedRanges[0]);
                }
                
                console.log("Loaded bill ranges:", sortedRanges);
            } else {
                setBillRanges([]);
                console.log("No bill ranges found");
            }
        } catch (err) {
            console.error("Error loading bill ranges:", err);
            setError("Failed to load bill ranges.");
        }
    };

    // Load price for a specific range and month/year
    const loadRangePrice = async (rangeId) => {
        try {
            const res = await api.get(
                `/billprice?billrange_id=${rangeId}&month=${formData.month}&year=${formData.year}`
            );
            
            if (res.data.success && res.data.data) {
                setRangePrice(res.data.data);
            } else {
                setRangePrice(null);
            }
        } catch (err) {
            console.error("Error loading bill price:", err);
            setRangePrice(null);
        }
    };

    // Load all bill prices for the selected month/year
    const loadAllPricesForMonthYear = async () => {
        try {
            const res = await api.get(
                `/billprice?bill_id=${bill_id}&month=${formData.month}&year=${formData.year}`
            );
            
            if (res.data.success && Array.isArray(res.data.data)) {
                // Filter by bill_id (ensure it's string comparison)
                const filtered = res.data.data.filter(price => 
                    price.bill_id && price.bill_id.toString() === bill_id.toString()
                );
                
                console.log("Loaded bill prices:", filtered);
                setBillPrices(filtered);
                
                // If we have a selected range, update its price
                if (selectedRange) {
                    const rangePrice = filtered.find(price => 
                        price.billrange_id && price.billrange_id.toString() === selectedRange.id.toString()
                    );
                    setRangePrice(rangePrice || null);
                }
                
                // Recalculate if we have used units
                if (formData.used_units && formData.used_units > 0) {
                    const { totalAmount, details } = calculateBillAmount(parseFloat(formData.used_units));
                    updateCalculation(parseFloat(formData.used_units), totalAmount, details);
                }
            } else {
                setBillPrices([]);
                setRangePrice(null);
            }
        } catch (err) {
            console.error("Error loading bill prices:", err);
            setBillPrices([]);
            setRangePrice(null);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        const updatedFormData = {
            ...formData,
            [name]: name === 'used_units' ? value : parseInt(value)
        };
    
        setFormData(updatedFormData);

        // When month/year changes, load new prices
        if (name === 'month' || name === 'year') {
            loadAllPricesForMonthYear();
        }
    
        // Recalculate when units change
        if (name === 'used_units') {
            const usedUnits = parseFloat(value) || 0;
            if (usedUnits > 0 && billRanges.length > 0 && billPrices.length > 0) {
                const { totalAmount, details } = calculateBillAmount(usedUnits);
                updateCalculation(usedUnits, totalAmount, details);
            } else {
                setCalculation(null);
                setCalculationDetails([]);
            }
        }
    };

    // Handle range selection
    const handleRangeSelect = (range) => {
        setSelectedRange(range);
        // Load price for this specific range
        const price = billPrices.find(p => p.billrange_id === range.id);
        setRangePrice(price || null);
    };

    // Calculate bill amount based on ranges and units - FIXED VERSION
    const calculateBillAmount = (usedUnits) => {
        console.log("Calculating for units:", usedUnits);
        console.log("Available ranges:", billRanges);
        console.log("Available prices:", billPrices);
        
        if (!billRanges.length || !billPrices.length) {
            console.log("No ranges or prices available");
            return { totalAmount: 0, details: [] };
        }

        // Sort ranges by min_units in ascending order
        const sortedRanges = [...billRanges].sort((a, b) => parseFloat(a.min_units) - parseFloat(b.min_units));
        
        let remainingUnits = parseFloat(usedUnits);
        let totalAmount = 0;
        const details = [];

        console.log("Sorted ranges:", sortedRanges);
        console.log("Remaining units start:", remainingUnits);

        // Process each range in order
        for (let i = 0; i < sortedRanges.length; i++) {
            const range = sortedRanges[i];
            const rangePrice = billPrices.find(price => price.billrange_id === range.id);
            
            if (!rangePrice) {
                console.warn(`No price found for range ${range.id} in ${formData.month}/${formData.year}`);
                continue;
            }

            // Get range boundaries
            const minUnits = parseFloat(range.min_units);
            const maxUnits = range.max_units ? parseFloat(range.max_units) : Infinity;
            
            console.log(`Processing range ${i+1}: ${minUnits}-${maxUnits}, Remaining: ${remainingUnits}`);

            // Calculate how many units fall into this range
            let rangeUnits = 0;
            
            if (remainingUnits <= 0) {
                break;
            }

            if (remainingUnits >= minUnits) {
                // Calculate available units in this range
                let availableUnitsInRange;
                if (maxUnits === Infinity) {
                    // Infinite range - all remaining units go here
                    availableUnitsInRange = remainingUnits;
                } else {
                    // Finite range - calculate units between min and max
                    availableUnitsInRange = maxUnits - minUnits + 1;
                }
                
                // Calculate how many units we can allocate to this range
                // Units start from the minimum of this range
                const unitsFromThisRangeStart = Math.max(0, remainingUnits - minUnits + 1);
                rangeUnits = Math.min(unitsFromThisRangeStart, availableUnitsInRange, remainingUnits);
                
                console.log(`Range ${i+1} calculations:`);
                console.log(`- Available in range: ${availableUnitsInRange}`);
                console.log(`- Units from range start: ${unitsFromThisRangeStart}`);
                console.log(`- Allocating: ${rangeUnits} units`);
                
                if (rangeUnits > 0) {
                    const rangeAmount = (rangeUnits * rangePrice.unit_price);
                    const fixedAmount = rangePrice.fixed_amount || 0;
                    const totalRangeAmount = rangeAmount + fixedAmount;
                    totalAmount += totalRangeAmount;
                    
                    details.push({
                        range: `${minUnits} - ${maxUnits === Infinity ? '∞' : maxUnits}`,
                        units: rangeUnits,
                        unitPrice: rangePrice.unit_price,
                        fixedAmount: fixedAmount,
                        rangeAmount: totalRangeAmount,
                        calculation: `${rangeUnits} × ${rangePrice.unit_price} + ${fixedAmount}`
                    });
                    
                    remainingUnits -= rangeUnits;
                    console.log(`Remaining units after range ${i+1}: ${remainingUnits}`);
                }
            }
        }

        // Handle case where used units are less than the first range's min_units
        if (remainingUnits > 0) {
            console.log(`${remainingUnits} units below first range threshold`);
            const firstRange = sortedRanges[0];
            const firstRangePrice = billPrices.find(price => price.billrange_id === firstRange.id);
            
            if (firstRangePrice && firstRange.min_units > 0) {
                const rangeAmount = (remainingUnits * firstRangePrice.unit_price);
                const fixedAmount = firstRangePrice.fixed_amount || 0;
                const totalRangeAmount = rangeAmount + fixedAmount;
                totalAmount += totalRangeAmount;
                
                details.unshift({
                    range: `0 - ${firstRange.min_units - 1}`,
                    units: remainingUnits,
                    unitPrice: firstRangePrice.unit_price,
                    fixedAmount: fixedAmount,
                    rangeAmount: totalRangeAmount,
                    calculation: `${remainingUnits} × ${firstRangePrice.unit_price} + ${fixedAmount}`
                });
                
                remainingUnits = 0;
            }
        }

        console.log("Final calculation:", {
            totalAmount: totalAmount,
            details: details,
            remainingUnits: remainingUnits
        });

        return { totalAmount, details };
    };

    // Update calculation state
    const updateCalculation = (usedUnits, totalAmount, details) => {
        console.log("Updating calculation:", { usedUnits, totalAmount, details });
        setCalculation({
            used_units: usedUnits,
            total_amount: totalAmount,
            calculated_at: new Date().toISOString()
        });
        setCalculationDetails(details);
    };

    // Submit bill calculation
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!calculation || !scannedData) {
            setError('Please enter used units to calculate');
            return;
        }

        // Check if we have prices for all ranges
        const missingPrices = billRanges.filter(range => 
            !billPrices.find(price => price.billrange_id === range.id)
        );
        
        if (missingPrices.length > 0) {
            toast.error(`Missing price data for some ranges in ${formData.month}/${formData.year}`);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const billPaymentData = {
                company_id: auth?.user?.company_id,
                apartment_id: scannedData.apt_id || scannedData.apartment_db_id,
                floor_id: scannedData.floor_id || null,
                house_id: scannedData.house_db_id,
                bill_id: bill_id,
                generate_bills_id_int: null,
                payment_status: 'Pending',
                pendingAmount: calculation.total_amount,
                paidAmount: 0.00,
                due_date: new Date(formData.year, formData.month - 1, 15).toISOString().split('T')[0],
                used_units: calculation.used_units,
                calculated_amount: calculation.total_amount,
                bill_month: formData.month,
                bill_year: formData.year
            };

            const response = await api.post('/billpayments', billPaymentData);
            
            if (response.data.success) {
                toast.success('Bill calculated and saved successfully!');
                setTimeout(() => {
                    navigate('/measurable-bills');
                }, 2000);
            } else {
                setError(response.data.message || 'Failed to save bill calculation');
                toast.error(response.data.message || 'Failed to save bill calculation');
            }
        } catch (err) {
            console.error('Error saving bill calculation:', err);
            const errorMsg = err.response?.data?.message || 'Failed to save bill calculation';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Generate month options
    const monthOptions = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' },
        { value: 3, label: 'March' }, { value: 4, label: 'April' },
        { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' },
        { value: 9, label: 'September' }, { value: 10, label: 'October' },
        { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    // Generate year options
    const currentYear = new Date().getFullYear();
    const yearOptions = [
        currentYear - 1,
        currentYear,
        currentYear + 1
    ];

    // Recalculate when ranges or prices change
    useEffect(() => {
        if (formData.used_units && formData.used_units > 0 && billRanges.length > 0 && billPrices.length > 0) {
            console.log("Auto-recalculating due to data change");
            const { totalAmount, details } = calculateBillAmount(parseFloat(formData.used_units));
            updateCalculation(parseFloat(formData.used_units), totalAmount, details);
        }
    }, [billRanges, billPrices]);

    useEffect(() => {
        if (!scannedData || !bill_id) {
            toast.error('Missing required data. Please scan again.');
            navigate('/measurable-bills');
            return;
        }

        loadBillRanges();
        loadAllPricesForMonthYear();
    }, [bill_id, scannedData]);

    // Load prices when month/year changes
    useEffect(() => {
        if (bill_id && formData.month && formData.year) {
            loadAllPricesForMonthYear();
        }
    }, [formData.month, formData.year]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            <Sidebar />
            
            <div className="flex-1 flex flex-col lg:ml-0">
                <Navbar />
                
                <main className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="mb-6">
                            <button 
                                onClick={() => navigate('/measurable-bills')}
                                className="mb-4 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                                ← Back to Measurable Bills
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Calculate Bill: {billData?.bill_name || 'Measurable Bill'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Calculate bill for scanned house
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        {/* Debug Info - Remove in production */}
                        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Debug Info:</h4>
                            <div className="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2">
                                <div>
                                    <span className="font-medium">Bill Ranges:</span> {billRanges.length}
                                </div>
                                <div>
                                    <span className="font-medium">Bill Prices:</span> {billPrices.length}
                                </div>
                                <div>
                                    <span className="font-medium">Selected Month:</span> {formData.month}
                                </div>
                                <div>
                                    <span className="font-medium">Selected Year:</span> {formData.year}
                                </div>
                            </div>
                        </div>

                        {/* House Information Card */}
                        {scannedData && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    House Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">House ID</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {scannedData.h_id || scannedData.house_id}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Apartment</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {scannedData.apt || scannedData.apartment}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Floor</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {scannedData.fl || scannedData.floor || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Calculation Form */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Month and Year Selection */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Month
                                                </label>
                                                <select
                                                    name="month"
                                                    value={formData.month}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    {monthOptions.map(month => (
                                                        <option key={month.value} value={month.value}>
                                                            {month.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Year
                                                </label>
                                                <select
                                                    name="year"
                                                    value={formData.year}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    required
                                                >
                                                    {yearOptions.map(year => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Bill Ranges Display */}
                                        {billRanges.length > 0 ? (
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Bill Ranges for {monthOptions.find(m => m.value == formData.month)?.label} {formData.year}
                                                </label>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {billRanges.map((range, index) => {
                                                        const price = billPrices.find(p => p.billrange_id === range.id);
                                                        const isSelected = selectedRange?.id === range.id;
                                                        
                                                        return (
                                                            <div 
                                                                key={range.id}
                                                                onClick={() => handleRangeSelect(range)}
                                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                                                    isSelected 
                                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                                                }`}
                                                            >
                                                                <div className="flex justify-between items-center">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                                            Range {index + 1}: {range.min_units} - {range.max_units || '∞'} units
                                                                        </p>
                                                                        {price ? (
                                                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                                Rs. {price.unit_price}/unit 
                                                                                {price.fixed_amount ? ` + Rs. ${price.fixed_amount} fixed` : ''}
                                                                            </p>
                                                                        ) : (
                                                                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                                                                No price set for {monthOptions.find(m => m.value == formData.month)?.label}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    {isSelected && (
                                                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                <p className="text-yellow-600 dark:text-yellow-400">
                                                    No bill ranges found. Please add ranges for this bill first.
                                                </p>
                                            </div>
                                        )}

                                        {/* Selected Range Price Details */}
                                        {selectedRange && rangePrice && (
                                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                    Selected Range Price
                                                </h4>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
                                                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                            Rs. {rangePrice.unit_price}/unit
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 dark:text-gray-400">Fixed Amount:</span>
                                                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                                                            Rs. {rangePrice.fixed_amount || '0.00'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Used Units Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Used Units
                                            </label>
                                            <input
                                                type="number"
                                                name="used_units"
                                                value={formData.used_units}
                                                onChange={handleInputChange}
                                                placeholder="Enter used units"
                                                min="0"
                                                step="0.01"
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Enter the total units consumed for {monthOptions.find(m => m.value == formData.month)?.label} {formData.year}
                                            </p>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={loading || !calculation}
                                            className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? 'Saving...' : 'Save Bill Calculation'}
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* Calculation Preview */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                        Calculation Preview
                                    </h3>
                                    
                                    {calculation ? (
                                        <div className="space-y-4">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Used Units:</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {calculation.used_units} units
                                                </span>
                                            </div>
                                            
                                            {/* Calculation Details */}
                                            {calculationDetails.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Breakdown:
                                                    </p>
                                                    {calculationDetails.map((detail, index) => (
                                                        <div key={index} className="text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                                            <div className="flex justify-between">
                                                                <span>Range {detail.range}:</span>
                                                                <span>{detail.units} units</span>
                                                            </div>
                                                            <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                                                <span>× Rs. {detail.unitPrice}/unit</span>
                                                                <span>Rs. {(detail.units * detail.unitPrice).toFixed(2)}</span>
                                                            </div>
                                                            {detail.fixedAmount > 0 && (
                                                                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                                                    <span>+ Fixed amount:</span>
                                                                    <span>Rs. {detail.fixedAmount.toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex justify-between font-medium text-gray-700 dark:text-gray-300 mt-1 pt-1 border-t border-gray-200 dark:border-gray-600">
                                                                <span>Subtotal:</span>
                                                                <span>Rs. {detail.rangeAmount.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400 font-medium">Total Amount:</span>
                                                    <span className="font-bold text-lg text-green-600 dark:text-green-400">
                                                        Rs. {calculation.total_amount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Enter used units to see calculation preview
                                        </p>
                                    )}

                                    {/* Missing Prices Warning */}
                                    {billRanges.length > 0 && billPrices.length < billRanges.length && (
                                        <div className="mt-6 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                                            <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                                ⚠️ {billRanges.length - billPrices.length} range(s) missing price for {monthOptions.find(m => m.value == formData.month)?.label} {formData.year}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer position="top-center" autoClose={3000} />
        </div>
    );
}