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
    
    // Debug state
    const [apiDebug, setApiDebug] = useState({
        rangesResponse: null,
        pricesResponse: null
    });
    
    // Form state
    const [formData, setFormData] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        used_units: ''
    });
    
    const [calculation, setCalculation] = useState(null);
    const [calculationDetails, setCalculationDetails] = useState([]);

    // Convert month number to month name
    const getMonthName = (monthNumber) => {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[monthNumber - 1] || '';
    };

    // Load bill ranges
    const loadBillRanges = async () => {
        try {
            console.log("Loading bill ranges for bill_id:", bill_id);
            const result = await api.get(`/billranges/bills/${bill_id}`);
            console.log("Bill ranges API response FULL:", result);
            
            // Debug: Log the exact structure
            console.log("Full response object:", result);
            console.log("Response data:", result.data);
            console.log("Response data type:", typeof result.data);
            
            // Debug: Save the response
            setApiDebug(prev => ({ ...prev, rangesResponse: result.data }));
            
            // Check if data exists and is an array
            let rangesData = [];
            
            // FIRST: Check if result.data itself is an array
            if (Array.isArray(result.data)) {
                console.log("result.data is an array directly");
                rangesData = result.data;
            }
            // SECOND: Check if result.data.data exists and is an array
            else if (result.data.data && Array.isArray(result.data.data)) {
                console.log("result.data.data is an array");
                rangesData = result.data.data;
            }
            // THIRD: Check if result.data has a success property
            else if (result.data.success && result.data.data) {
                console.log("result.data.success is true");
                if (Array.isArray(result.data.data)) {
                    rangesData = result.data.data;
                } else if (typeof result.data.data === 'object') {
                    // Convert object to array
                    rangesData = Object.values(result.data.data);
                }
            }
            // FOURTH: Try to extract data from any other property
            else if (typeof result.data === 'object') {
                console.log("result.data is an object, trying to find arrays...");
                // Look for any array property in the response
                for (const key in result.data) {
                    if (Array.isArray(result.data[key])) {
                        console.log(`Found array in property: ${key}`);
                        rangesData = result.data[key];
                        break;
                    }
                }
            }
            
            console.log("Extracted rangesData:", rangesData);
            console.log("Extracted rangesData length:", rangesData.length);
            
            if (rangesData.length > 0) {
                // Sort ranges by fromRange in ascending order
                const sortedRanges = rangesData.sort((a, b) => 
                    parseFloat(a.fromRange || a.from_range || a.from) - 
                    parseFloat(b.fromRange || b.from_range || b.from)
                );
                
                console.log("Sorted bill ranges:", sortedRanges);
                console.log("Sample range object:", sortedRanges[0]);
                console.log("Range object keys:", Object.keys(sortedRanges[0]));
                
                setBillRanges(sortedRanges);
                
                if (sortedRanges.length > 0) {
                    setSelectedRange(sortedRanges[0]);
                    console.log("First range set:", sortedRanges[0]);
                } else {
                    console.log("No ranges in the data");
                    toast.warning("No bill ranges found in the response data");
                }
            } else {
                console.log("No ranges data found");
                console.log("Available response keys:", Object.keys(result.data || {}));
                setBillRanges([]);
                toast.warning("No bill ranges data available in response");
            }
        } catch (err) {
            console.error("Error loading bill ranges:", err);
            console.error("Error response:", err.response?.data);
            setError("Failed to load bill ranges.");
            toast.error("Failed to load bill ranges. Check console for details.");
            setBillRanges([]);
        }
    };


    // Load bill prices for selected month/year
    const loadAllPricesForMonthYear = async () => {
        try {
            const monthName = getMonthName(formData.month);
            console.log("Loading prices for:", monthName, formData.year, "bill_id:", bill_id);
            
            // Try multiple API endpoints or parameters
            let res;
            try {
                // Try with bill_id as query parameter
                res = await api.get(
                    `/billprice?bill_id=${bill_id}&month=${monthName}&year=${formData.year}`
                );
                console.log("API Response:", res);
                console.log("API Response Data:", res.data);
            } catch (apiErr) {
                console.log("First API call failed, trying alternative...");
                console.error("First API error:", apiErr.response?.data || apiErr.message);
                // Try different endpoint
                res = await api.get(`/billprice/${bill_id}/${monthName}/${formData.year}`);
            }
            
            // Debug: Save the response
            setApiDebug(prev => ({ ...prev, pricesResponse: res.data }));
            
            console.log("Bill prices API FULL response:", res);
            console.log("Bill prices data structure:", res.data);
            
            if (res.data.success) {
                // Handle different possible response structures
                let pricesData = [];
                
                if (Array.isArray(res.data.data)) {
                    pricesData = res.data.data;
                } else if (res.data.data && typeof res.data.data === 'object') {
                    // If data is an object, convert to array
                    pricesData = Object.values(res.data.data);
                } else if (Array.isArray(res.data)) {
                    // If response is directly an array
                    pricesData = res.data;
                }
                
                console.log("Processed bill prices:", pricesData);
                setBillPrices(pricesData);
                
                // Check what keys the price objects have
                if (pricesData.length > 0) {
                    console.log("First price object keys:", Object.keys(pricesData[0]));
                    console.log("First price object:", pricesData[0]);
                }
                
                // If we have a selected range, update its price
                if (selectedRange && pricesData.length > 0) {
                    console.log("Looking for price for range ID:", selectedRange.id);
                    console.log("Available price range IDs:", pricesData.map(p => p.billrange_id || p.range_id || p.id));
                    
                    const rangePrice = pricesData.find(price => {
                        // Try multiple possible ID fields
                        return (
                            (price.billrange_id && price.billrange_id.toString() === selectedRange.id.toString()) ||
                            (price.range_id && price.range_id.toString() === selectedRange.id.toString()) ||
                            (price.id && price.id.toString() === selectedRange.id.toString())
                        );
                    });
                    
                    console.log("Found range price:", rangePrice);
                    setRangePrice(rangePrice || null);
                }
                
                if (pricesData.length === 0) {
                    toast.info(`No prices found for ${monthName} ${formData.year}. Please set prices first.`);
                } else {
                    toast.success(`Loaded ${pricesData.length} price(s) for ${monthName}`);
                }
            } else {
                console.log("API returned success: false", res.data);
                setBillPrices([]);
                setRangePrice(null);
                toast.warning(`No prices available for ${monthName} ${formData.year}`);
            }
        } catch (err) {
            console.error("Error loading bill prices:", err);
            console.error("Error details:", err.response?.data || err.message);
            setBillPrices([]);
            setRangePrice(null);
            toast.error("Failed to load bill prices. Check console.");
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
                const { totalAmount, details } = calculateBillAmountSimple(usedUnits);
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
        // Load price for this specific range from already loaded prices
        const price = billPrices.find(p => {
            return (
                (p.billrange_id && p.billrange_id.toString() === range.id.toString()) ||
                (p.range_id && p.range_id.toString() === range.id.toString()) ||
                (p.id && p.id.toString() === range.id.toString())
            );
        });
        console.log("Selected range:", range, "Found price:", price);
        setRangePrice(price || null);
    };

    // SIMPLE Calculation function - based on which range the units fall into
    const calculateBillAmountSimple = (usedUnits) => {
        console.log("=== SIMPLE CALCULATION ===");
        console.log("Used units:", usedUnits);
        console.log("All ranges:", billRanges);
        console.log("All prices:", billPrices);
        
        if (!billRanges.length || !billPrices.length) {
            console.log("Missing ranges or prices");
            return { totalAmount: 0, details: [] };
        }
        
        // Find which range the used units fall into
        const used = parseFloat(usedUnits);
        let applicableRange = null;
        let applicablePrice = null;
        
        // Sort ranges by fromRange
        const sortedRanges = [...billRanges].sort((a, b) => 
            parseFloat(a.fromRange) - parseFloat(b.fromRange)
        );
        
        // Find the correct range
        for (const range of sortedRanges) {
            const from = parseFloat(range.fromRange);
            const to = range.toRange ? parseFloat(range.toRange) : Infinity;
            
            console.log(`Checking range ${from}-${to} for units ${used}`);
            
            if (used >= from && (used <= to || to === Infinity)) {
                applicableRange = range;
                console.log("Found applicable range:", range);
                
                // Find price for this range
                applicablePrice = billPrices.find(price => {
                    // Try different ID fields
                    return (
                        (price.billrange_id && price.billrange_id.toString() === range.id.toString()) ||
                        (price.range_id && price.range_id.toString() === range.id.toString()) ||
                        (price.id && price.id.toString() === range.id.toString())
                    );
                });
                
                console.log("Found applicable price:", applicablePrice);
                break;
            }
        }
        
        if (!applicableRange || !applicablePrice) {
            console.log("No applicable range or price found");
            toast.error("No price found for this consumption range");
            return { totalAmount: 0, details: [] };
        }
        
        // Calculate total
        const unitPrice = parseFloat(applicablePrice.unitprice) || parseFloat(applicablePrice.uniprice) || 0;
        const fixedAmount = parseFloat(applicablePrice.fixedamount) || 0;
        const totalAmount = (used * unitPrice) + fixedAmount;
        
        const details = [{
            range: `${applicableRange.fromRange} - ${applicableRange.toRange || '∞'}`,
            units: used,
            unitPrice: unitPrice,
            fixedAmount: fixedAmount,
            rangeAmount: totalAmount,
            calculation: `${used} × ${unitPrice} + ${fixedAmount}`
        }];
        
        console.log("Simple calculation result:", { totalAmount, details });
        
        return { totalAmount, details };
    };

    // ORIGINAL complex calculation function (keeping as backup)
    const calculateBillAmount = (usedUnits) => {
        console.log("=== STARTING CALCULATION ===");
        console.log("Used units:", usedUnits);
        console.log("Bill ranges:", billRanges);
        console.log("Bill prices:", billPrices);
        
        if (!billRanges.length || !billPrices.length) {
            console.log("No ranges or prices available");
            return { totalAmount: 0, details: [] };
        }

        // Sort ranges by fromRange in ascending order
        const sortedRanges = [...billRanges].sort((a, b) => 
            parseFloat(a.fromRange) - parseFloat(b.fromRange)
        );
        
        let remainingUnits = parseFloat(usedUnits);
        let totalAmount = 0;
        const details = [];

        console.log("Sorted ranges:", sortedRanges);
        console.log("Starting with units:", remainingUnits);

        // Process each range
        for (let i = 0; i < sortedRanges.length; i++) {
            const range = sortedRanges[i];
            const price = billPrices.find(p => 
                (p.billrange_id && p.billrange_id.toString() === range.id.toString()) ||
                (p.range_id && p.range_id.toString() === range.id.toString())
            );
            
            if (!price) {
                console.warn(`No price found for range ${range.id}`);
                continue;
            }

            const fromRange = parseFloat(range.fromRange);
            const toRange = range.toRange ? parseFloat(range.toRange) : Infinity;
            const unitPrice = parseFloat(price.unitprice) || parseFloat(price.uniprice) || 0;
            const fixedAmount = parseFloat(price.fixedamount) || 0;
            
            console.log(`\nProcessing range ${i+1}: ${fromRange} - ${toRange}`);
            console.log(`Price: Rs. ${unitPrice}/unit + Rs. ${fixedAmount} fixed`);
            console.log(`Remaining units before this range: ${remainingUnits}`);

            // Calculate units in this range
            let unitsInThisRange = 0;
            
            if (remainingUnits <= 0) {
                console.log("No remaining units, skipping remaining ranges");
                break;
            }

            if (i === 0 && remainingUnits < fromRange) {
                // Units are below the first range minimum
                unitsInThisRange = remainingUnits;
                remainingUnits = 0;
                console.log(`Units below first range: ${unitsInThisRange} units`);
            } else if (remainingUnits >= fromRange) {
                // Calculate how many units can go into this range
                if (toRange === Infinity) {
                    // Last infinite range - take all remaining units
                    unitsInThisRange = remainingUnits;
                    remainingUnits = 0;
                    console.log(`Infinite range - taking all: ${unitsInThisRange} units`);
                } else {
                    // Calculate max units that can fit in this range
                    const maxUnitsInThisRange = toRange - fromRange + 1;
                    
                    // Calculate units from the start of this range
                    const unitsFromRangeStart = remainingUnits - fromRange + 1;
                    
                    // Take the minimum of what fits and what's available
                    unitsInThisRange = Math.min(
                        Math.max(unitsFromRangeStart, 0), // Don't take negative
                        maxUnitsInThisRange,              // Don't exceed range limit
                        remainingUnits                    // Don't exceed total remaining
                    );
                    
                    // Ensure it's not negative
                    unitsInThisRange = Math.max(0, unitsInThisRange);
                    
                    remainingUnits -= unitsInThisRange;
                    console.log(`Finite range - taking: ${unitsInThisRange} units (max in range: ${maxUnitsInThisRange})`);
                    console.log(`Remaining units after range: ${remainingUnits}`);
                }
            } else {
                console.log(`Skipping range ${fromRange}-${toRange} - not enough units`);
            }

            if (unitsInThisRange > 0) {
                const rangeAmount = (unitsInThisRange * unitPrice) + fixedAmount;
                totalAmount += rangeAmount;
                
                details.push({
                    range: `${fromRange} - ${toRange === Infinity ? '∞' : toRange}`,
                    units: unitsInThisRange,
                    unitPrice: unitPrice,
                    fixedAmount: fixedAmount,
                    rangeAmount: rangeAmount,
                    calculation: `${unitsInThisRange} × ${unitPrice} + ${fixedAmount}`
                });
                
                console.log(`Range calculation: ${unitsInThisRange} × ${unitPrice} + ${fixedAmount} = ${rangeAmount}`);
                console.log(`Cumulative total: ${totalAmount}`);
            }
        }

        // Handle any leftover units (shouldn't happen with proper ranges)
        if (remainingUnits > 0) {
            console.log(`Warning: ${remainingUnits} units not allocated to any range`);
        }

        console.log("=== FINAL CALCULATION ===");
        console.log("Total amount:", totalAmount);
        console.log("Calculation details:", details);
        console.log("Remaining units not allocated:", remainingUnits);

        return { totalAmount, details };
    };

    // Update calculation state
    const updateCalculation = (usedUnits, totalAmount, details) => {
        console.log("Updating calculation state");
        setCalculation({
            used_units: usedUnits,
            total_amount: totalAmount,
            calculated_at: new Date().toISOString()
        });
        setCalculationDetails(details);
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
            const { totalAmount, details } = calculateBillAmountSimple(parseFloat(formData.used_units));
            updateCalculation(parseFloat(formData.used_units), totalAmount, details);
        }
    }, [billRanges, billPrices]);

    // Check for common issues
    useEffect(() => {
        // Check if data is loaded but not displaying
        if (billRanges.length > 0 && billPrices.length === 0) {
            console.warn("Ranges loaded but no prices found. Possible issues:");
            console.warn("1. Wrong month/year selected:", formData.month, formData.year);
            console.warn("2. Prices not set for this period");
            console.warn("3. API endpoint might be wrong");
            
            toast.warning(
                `No prices found for ${getMonthName(formData.month)} ${formData.year}. ` +
                `Please check if prices are set for this period.`
            );
        }
        
        if (billRanges.length === 0) {
            console.warn("No bill ranges found. Check if ranges are created for this bill.");
            toast.warning("No bill ranges found. Please create ranges first.");
        }
    }, [billRanges, billPrices, formData.month, formData.year]);

    // Initial load - load ranges only
    useEffect(() => {
        if (!scannedData || !bill_id) {
            toast.error('Missing required data. Please scan again.');
            navigate('/measurable-bills');
            return;
        }

        loadBillRanges();
    }, [bill_id, scannedData]);

    // Load prices when month/year changes
    useEffect(() => {
        if (bill_id && formData.month && formData.year) {
            loadAllPricesForMonthYear();
        }
    }, [formData.month, formData.year]);

    // Get current month name for display
    const currentMonthName = getMonthName(formData.month);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            <Sidebar />
            
            <div className="flex-1 flex flex-col lg:ml-0">
                <Navbar />
                
                <main className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <button 
                                    onClick={() => navigate('/measurable-bills')}
                                    className="mb-2 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
                            <button
                                onClick={() => {
                                    loadBillRanges();
                                    loadAllPricesForMonthYear();
                                    toast.info("Refreshing data...");
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                            >
                                🔄 Refresh Data
                            </button>
                        </div>

                        {/* Debug Info */}
                        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Debug Info:</h4>
                            <div className="text-xs text-gray-600 dark:text-gray-400 grid grid-cols-2 gap-2">
                                <div>
                                    <span className="font-medium">Bill Ranges:</span> {billRanges.length}
                                </div>
                                <div>
                                    <span className="font-medium">Bill Prices for {currentMonthName}:</span> {billPrices.length}
                                </div>
                                <div>
                                    <span className="font-medium">Selected Month:</span> {formData.month} ({currentMonthName})
                                </div>
                                <div>
                                    <span className="font-medium">Selected Year:</span> {formData.year}
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium">Bill ID:</span> {bill_id}
                                </div>
                                <div className="col-span-2">
                                    <span className="font-medium">Used Units:</span> {formData.used_units || 'Not entered'}
                                </div>
                                <div className="col-span-2">
                                    <button 
                                        onClick={() => {
                                            // Test with sample data
                                            const testUnits = 150;
                                            setFormData(prev => ({ ...prev, used_units: testUnits }));
                                            
                                            if (billRanges.length > 0 && billPrices.length > 0) {
                                                const { totalAmount, details } = calculateBillAmountSimple(testUnits);
                                                updateCalculation(testUnits, totalAmount, details);
                                                toast.info(`Test calculation with ${testUnits} units`);
                                            }
                                        }}
                                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm"
                                    >
                                        Test with 150 units
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* API Debug Panel */}
                        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">API Debug Info:</h4>
                            <div className="text-xs space-y-2">
                                <div>
                                    <button 
                                        onClick={() => console.log("API Debug:", apiDebug)}
                                        className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded text-xs"
                                    >
                                        Log API Data to Console
                                    </button>
                                    <button 
                                        onClick={() => console.log("Current State:", { billRanges, billPrices, selectedRange, rangePrice, formData })}
                                        className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-xs"
                                    >
                                        Log State
                                    </button>
                                </div>
                                <div>
                                    <span className="font-medium">Ranges API Response:</span> 
                                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-40 text-xs">
                                        {JSON.stringify(apiDebug.rangesResponse, null, 2)}
                                    </pre>
                                </div>
                                <div>
                                    <span className="font-medium">Prices API Response:</span>
                                    <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-40 text-xs">
                                        {JSON.stringify(apiDebug.pricesResponse, null, 2)}
                                    </pre>
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
                                    <form className="space-y-4">
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

                                        {/* Bill Ranges Display - Table Format */}
                                        {Array.isArray(billRanges) && billRanges.length > 0 ? (
                                            <div className="space-y-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Bill Ranges for {currentMonthName} {formData.year}
                                                </label>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                                                        <thead>
                                                            <tr className="bg-blue-100 dark:bg-blue-900">
                                                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">Range #</th>
                                                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">From (Units)</th>
                                                                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">To (Units)</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {billRanges.map((range, index) => {
                                                                // Try multiple possible property names
                                                                const fromRange = range.fromRange || range.from_range || range.from || 0;
                                                                const toRange = range.toRange || range.to_range || range.to || '∞';
                                                                const rangeId = range.id || range._id || range.range_id;
                                                                
                                                                const price = billPrices.find(p => {
                                                                    // Try multiple possible ID fields
                                                                    const priceRangeId = p.billrange_id || p.range_id || p.id;
                                                                    return priceRangeId && priceRangeId.toString() === rangeId.toString();
                                                                });
                                                                
                                                                const isSelected = selectedRange?.id === rangeId;
                                                                
                                                                return (
                                                                    <tr 
                                                                        key={rangeId || index}
                                                                        onClick={() => handleRangeSelect(range)}
                                                                        className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                                                            isSelected 
                                                                                ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-blue-500' 
                                                                                : ''
                                                                        }`}
                                                                    >
                                                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                                            <div className="flex items-center">
                                                                                {index + 1}
                                                                                {isSelected && (
                                                                                    <div className="ml-2 w-2 h-2 rounded-full bg-blue-500"></div>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                                            {fromRange}
                                                                        </td>
                                                                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">
                                                                            {toRange}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                    {/* Raw Data Display for Debugging */}
                                                    {billRanges.length === 0 && apiDebug.rangesResponse && (
                                                        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                            <h4 className="font-medium text-red-700 dark:text-red-300 mb-2">No Ranges Found - Debug Info:</h4>
                                                            <div className="text-xs">
                                                                <p>API Response Structure:</p>
                                                                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-40">
                                                                    {JSON.stringify(apiDebug.rangesResponse, null, 2)}
                                                                </pre>
                                                                <button 
                                                                    onClick={() => {
                                                                        console.log("Trying to manually extract data...");
                                                                        const data = apiDebug.rangesResponse;
                                                                        
                                                                        // Try different extraction methods
                                                                        if (Array.isArray(data)) {
                                                                            console.log("Data is array:", data);
                                                                            setBillRanges(data);
                                                                        } else if (data.data) {
                                                                            console.log("data.data:", data.data);
                                                                            if (Array.isArray(data.data)) {
                                                                                setBillRanges(data.data);
                                                                            }
                                                                        }
                                                                    }}
                                                                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
                                                                >
                                                                    Try Manual Extraction
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    Click on any row to select a range and view its price details
                                                </p>
                                            </div>
                                        ) : (
                                            // Shows message otherwise
                                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                <p className="text-yellow-600 dark:text-yellow-400">
                                                    {loading ? 'Loading bill ranges...' : 'No bill ranges found for this bill. Please add ranges first.'}
                                                </p>
                                                {/* Debug info */}
                                                <div className="mt-2 text-xs">
                                                    <p>Debug: Array? {Array.isArray(billRanges) ? 'Yes' : 'No'}</p>
                                                    <p>Debug: Length? {billRanges?.length || 0}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Selected Range Price Details */}
                                        {selectedRange && rangePrice && (
                                            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                    Selected Range Price Details for {currentMonthName} {formData.year}
                                                </h4>
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                                        <span className="text-gray-600 dark:text-gray-400 block text-xs">Range</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {selectedRange.fromRange} - {selectedRange.toRange || '∞'} units
                                                        </span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                                        <span className="text-gray-600 dark:text-gray-400 block text-xs">Unit Price</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            Rs. {rangePrice.unitprice || rangePrice.uniprice || '0.00'}/unit
                                                        </span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                                        <span className="text-gray-600 dark:text-gray-400 block text-xs">Fixed Amount</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            Rs. {rangePrice.fixedamount || '0.00'}
                                                        </span>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                                                        <span className="text-gray-600 dark:text-gray-400 block text-xs">Month</span>
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {currentMonthName} {formData.year}
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
                                                Enter the total units consumed for {currentMonthName} {formData.year}
                                            </p>
                                        </div>

                                        {/* Cancel Button */}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/measurable-bills')}
                                            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            Cancel
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
                                                        Breakdown for {currentMonthName}:
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
                                                ⚠️ {billRanges.length - billPrices.length} range(s) missing price for {currentMonthName} {formData.year}
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