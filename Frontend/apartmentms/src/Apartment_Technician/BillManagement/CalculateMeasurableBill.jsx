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
    const [dueDate, setDueDate] = useState('');
    
    // Form state
    const [formData, setFormData] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        previous_reading: '',
        current_reading: '',
        used_units: '',
        total_amount: ''
    });
    
    const [calculation, setCalculation] = useState(null);
    const [calculationDetails, setCalculationDetails] = useState([]);
    
    // Loading states
    const [loadingPreviousReading, setLoadingPreviousReading] = useState(false);
    const [generatingBill, setGeneratingBill] = useState(false);
    
    // Previous month/year ref for comparison
    const prevMonthRef = React.useRef(formData.month);
    const prevYearRef = React.useRef(formData.year);

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
            
            // Check if data exists and is an array
            let rangesData = [];
            
            if (Array.isArray(result.data)) {
                rangesData = result.data;
            } else if (result.data.data && Array.isArray(result.data.data)) {
                rangesData = result.data.data;
            } else if (result.data.success && result.data.data) {
                if (Array.isArray(result.data.data)) {
                    rangesData = result.data.data;
                } else if (typeof result.data.data === 'object') {
                    rangesData = Object.values(result.data.data);
                }
            } else if (typeof result.data === 'object') {
                for (const key in result.data) {
                    if (Array.isArray(result.data[key])) {
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
                    parseFloat(a.fromRange || a.from_range || a.from || 0) - 
                    parseFloat(b.fromRange || b.from_range || b.from || 0)
                );
                
                console.log("Sorted bill ranges:", sortedRanges);
                setBillRanges(sortedRanges);
                
                if (sortedRanges.length > 0) {
                    setSelectedRange(sortedRanges[0]);
                }
            } else {
                setBillRanges([]);
                toast.warning("No bill ranges data available in response");
            }
        } catch (err) {
            console.error("Error loading bill ranges:", err);
            toast.error("Failed to load bill ranges.");
            setBillRanges([]);
        }
    };

    // Load bill prices for selected month/year - FIXED: Remove billrange_id param
    const loadAllPricesForMonthYear = async () => {
        try {
            const monthName = getMonthName(formData.month);
            const monthNumber = formData.month;
            
            console.log("🔍 Loading prices for:", {
                monthNumber: monthNumber,
                monthName: monthName,
                year: formData.year,
                bill_id: bill_id
            });
            
            // Clear previous prices
            setBillPrices([]);
            setRangePrice(null);
            
            // Try multiple API patterns to find the right one
            let res = null;
            let apiError = null;
            
            // Pattern 1: Query parameters with month name - REMOVED billrange_id
            try {
                console.log("🔄 Trying API Pattern 1: /billprice?params (ALL PRICES)");
                res = await api.get(`/billprice`, {
                    params: {
                        bill_id: bill_id,
                        month: monthName,
                        year: formData.year
                    }
                });
                console.log("✅ Pattern 1 success:", res.data);
            } catch (err1) {
                apiError = err1;
                console.log("⚠️ Pattern 1 failed:", err1.response?.data || err1.message);
                
                // Pattern 2: Query parameters with month number - REMOVED billrange_id
                try {
                    console.log("🔄 Trying API Pattern 2: /billprice?params with month number (ALL PRICES)");
                    res = await api.get(`/billprice`, {
                        params: {
                            bill_id: bill_id,
                            month: monthNumber,
                            year: formData.year
                            // REMOVED: billrange_id: selectedRange ? (selectedRange.id || selectedRange._id) : undefined
                        }
                    });
                    console.log("✅ Pattern 2 success:", res.data);
                } catch (err2) {
                    apiError = err2;
                    console.log("⚠️ Pattern 2 failed:", err2.response?.data || err2.message);
                    
                    // Pattern 3: Path parameters with month name - UPDATED to get all prices
                    try {
                        console.log("🔄 Trying API Pattern 3: /billprice/bill/month/year (ALL PRICES)");
                        res = await api.get(`/billprice/${bill_id}/${monthName}/${formData.year}`);
                        console.log("✅ Pattern 3 success:", res.data);
                    } catch (err3) {
                        apiError = err3;
                        console.log("⚠️ Pattern 3 failed:", err3.response?.data || err3.message);
                        
                        // Pattern 4: Path parameters with month number - UPDATED to get all prices
                        try {
                            console.log("🔄 Trying API Pattern 4: /billprice/bill/monthNumber/year (ALL PRICES)");
                            res = await api.get(`/billprice/${bill_id}/${monthNumber}/${formData.year}`);
                            console.log("✅ Pattern 4 success:", res.data);
                        } catch (err4) {
                            apiError = err4;
                            console.log("⚠️ Pattern 4 failed:", err4.response?.data || err4.message);
                            
                            // Pattern 5: Alternative endpoint - REMOVED billrange_id
                            try {
                                console.log("🔄 Trying API Pattern 5: /api/billprice (ALL PRICES)");
                                res = await api.get(`/api/billprice`, {
                                    params: {
                                        bill_id: bill_id,
                                        month: monthName,
                                        year: formData.year
                                        // REMOVED: billrange_id: selectedRange ? (selectedRange.id || selectedRange._id) : undefined
                                    }
                                });
                                console.log("✅ Pattern 5 success:", res.data);
                            } catch (err5) {
                                apiError = err5;
                                console.log("⚠️ All patterns failed");
                                throw new Error("All API attempts failed");
                            }
                        }
                    }
                }
            }
            
            console.log("📊 Final API response structure:", {
                data: res.data,
                success: res.data?.success,
                dataExists: !!res.data?.data,
                isArray: Array.isArray(res.data?.data),
                dataType: typeof res.data?.data
            });
            
            let pricesData = [];
            
            // Parse response based on different possible structures
            if (res.data?.success) {
                if (Array.isArray(res.data.data)) {
                    pricesData = res.data.data;
                } else if (res.data.data && typeof res.data.data === 'object') {
                    pricesData = Object.values(res.data.data);
                } else {
                    pricesData = [];
                }
            } else if (Array.isArray(res.data)) {
                pricesData = res.data;
            } else if (res.data?.data && Array.isArray(res.data.data)) {
                pricesData = res.data.data;
            } else if (res.data && typeof res.data === 'object') {
                // Check if any property contains an array
                for (const key in res.data) {
                    if (Array.isArray(res.data[key])) {
                        pricesData = res.data[key];
                        break;
                    }
                }
            }
            
            console.log("✅ Processed bill prices:", pricesData);
            console.log("✅ Month values in prices:", pricesData.map(p => ({ 
                id: p.id, 
                month: p.month, 
                year: p.year,
                billrange_id: p.billrange_id
            })));
            
            // Filter prices for the current month/year
            const filteredPrices = pricesData.filter(price => {
                const priceMonth = price.month;
                const priceYear = price.year;
                
                // Check if month matches (either name or number)
                const monthMatch = priceMonth === monthName || priceMonth === monthNumber.toString();
                // Check if year matches
                const yearMatch = priceYear === formData.year || priceYear === formData.year.toString();
                
                return monthMatch && yearMatch;
            });
            
            console.log("Filtered prices for current month/year:", filteredPrices);
            
            if (filteredPrices.length > 0) {
                setBillPrices(filteredPrices);
                console.log("Set billPrices state with", filteredPrices.length, "prices");
                
                // If we have a selected range, find its price
                if (selectedRange) {
                    findPriceForSelectedRange(filteredPrices);
                }
                
            } else if (pricesData.length > 0) {
                // If we got prices but they're not filtered properly, use all
                console.log("No filtering match, using all prices:", pricesData.length);
                setBillPrices(pricesData);
                
                if (selectedRange) {
                    findPriceForSelectedRange(pricesData);
                }
                
                toast.success(`Loaded ${pricesData.length} price(s) for ${monthName}`);
            } else {
                console.log("No prices data found in response");
                setBillPrices([]);
                toast.info(`No prices found for ${monthName} ${formData.year}. Please set prices first.`);
            }
        } catch (err) {
            console.error("Error loading bill prices:", err);
            console.error(" Error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            setBillPrices([]);
            setRangePrice(null);
            toast.error(`Failed to load prices for ${getMonthName(formData.month)}. Check console.`);
        }
    };

    // Find price for selected range
    const findPriceForSelectedRange = (pricesData = billPrices) => {
        if (!selectedRange || !pricesData || pricesData.length === 0) {
            setRangePrice(null);
            return;
        }
        
        const foundPrice = pricesData.find(price => {
            const priceRangeId = price.billrange_id || price.range_id || price.id;
            const rangeId = selectedRange.id || selectedRange._id;
            return priceRangeId && priceRangeId.toString() === rangeId.toString();
        });
        
        console.log("Looking for price for range:", selectedRange.id);
        console.log("Available prices range IDs:", pricesData.map(p => p.billrange_id));
        console.log("Found price for selected range:", foundPrice);
        setRangePrice(foundPrice || null);
    };

    // Load previous reading for the house
    const loadPreviousReading = async () => {
        const houseId = scannedData?.house_db_id;
        
        if (!houseId || !bill_id) {
            console.log("Missing houseId or bill_id");
            setFormData(prev => ({ ...prev, previous_reading: '0' }));
            return;
        }

        try {
            setLoadingPreviousReading(true);
            
            console.log("🔍 Loading previous reading for:", { 
                houseId, 
                bill_id,
                scannedData 
            });
            
            const response = await api.get(`/generate-measurable-bills/previous-reading`, {
                params: {
                    house_id: houseId,
                    bill_id: bill_id
                }
            });
            
            console.log("✅ API Response:", response.data);
            
            if (response.data.success) {
                const previousReading = response.data.data?.current_reading || 0;
                setFormData(prev => ({
                    ...prev,
                    previous_reading: previousReading.toString()
                }));
                console.log(`✅ Previous reading set to: ${previousReading}`);
            }
        } catch (err) {
            console.error("❌ Error loading previous reading:", err);
            
            // Check if it's a 404 (no data found) or server error
            if (err.response?.status === 404) {
                console.log("No previous reading found (404). Starting from 0.");
                setFormData(prev => ({ ...prev, previous_reading: '0' }));
            } else {
                // For other errors, show message
                toast.error("Could not load previous reading");
                setFormData(prev => ({ ...prev, previous_reading: '0' }));
            }
        } finally {
            setLoadingPreviousReading(false);
        }
    };

    // Handle month/year change specifically
    const handleMonthYearChange = async (field, value) => {
        const newFormData = {
            ...formData,
            [field]: parseInt(value)
        };
        
        setFormData(newFormData);
        
        // Check if month or year actually changed
        const monthChanged = field === 'month' && value !== prevMonthRef.current;
        const yearChanged = field === 'year' && value !== prevYearRef.current;
        
        if (monthChanged || yearChanged) {
            console.log("Month/Year changed - Clearing and reloading data");
            console.log("Old month:", prevMonthRef.current, "New month:", field === 'month' ? value : formData.month);
            console.log("Old year:", prevYearRef.current, "New year:", field === 'year' ? value : formData.year);
            
            // Update refs
            if (field === 'month') prevMonthRef.current = value;
            if (field === 'year') prevYearRef.current = value;
            
            // Clear all calculation-related state
            setBillPrices([]);
            setRangePrice(null);
            setCalculation(null);
            setCalculationDetails([]);
            
            // Reset form calculations but keep readings
            setFormData(prev => ({
                ...prev,
                [field]: parseInt(value),
                total_amount: '',
                used_units: ''
            }));
            
            // Load new data immediately
            loadAllPricesForMonthYear();
            loadPreviousReading();
        }
    };

    // Handle other input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // For month and year, use special handler
        if (name === 'month' || name === 'year') {
            handleMonthYearChange(name, value);
            return;
        }
        
        const updatedFormData = {
            ...formData,
            [name]: value
        };

        setFormData(updatedFormData);
        
        // Auto-calculate used units when current reading changes
        if (name === 'current_reading') {
            const current = parseFloat(value) || 0;
            const previous = parseFloat(formData.previous_reading) || 0;
            const usedUnits = current - previous;
            
            if (usedUnits >= 0) {
                updatedFormData.used_units = usedUnits.toString();
                updatedFormData.total_amount = ''; // Reset total amount
                
                // Recalculate if we have all data
                if (usedUnits > 0 && billRanges.length > 0 && billPrices.length > 0) {
                    const { totalAmount, details } = calculateBillAmountSequential(usedUnits);
                    updatedFormData.total_amount = totalAmount.toFixed(2);
                    updateCalculation(usedUnits, totalAmount, details);
                } else {
                    setCalculation(null);
                    setCalculationDetails([]);
                }
            } else {
                toast.error("Current reading cannot be less than previous reading");
            }
        }
        
        setFormData(updatedFormData);
    };

    // Handle range selection
    const handleRangeSelect = (range) => {
        setSelectedRange(range);
        findPriceForSelectedRange();
    };

    // SEQUENTIAL CALCULATION FUNCTION
    const calculateBillAmountSequential = (usedUnits) => {
        console.log("=== SEQUENTIAL CALCULATION ===");
        console.log("Used units:", usedUnits);
        console.log("All ranges:", billRanges);
        console.log("All prices:", billPrices);
        
        if (!billRanges.length || !billPrices.length) {
            console.log("Missing ranges or prices");
            return { totalAmount: 0, details: [] };
        }

        // Sort ranges by fromRange in ascending order
        const sortedRanges = [...billRanges].sort((a, b) => 
            parseFloat(a.fromRange || a.from_range || a.from || 0) - 
            parseFloat(b.fromRange || b.from_range || b.from || 0)
        );
        
        let remainingUnits = parseFloat(usedUnits);
        let totalAmount = 0;
        const details = [];

        console.log("Sorted ranges:", sortedRanges);
        console.log("Starting with units:", remainingUnits);

        // Process each range sequentially
        for (let i = 0; i < sortedRanges.length && remainingUnits > 0; i++) {
            const range = sortedRanges[i];
            
            // Find price for this range
            const price = billPrices.find(p => {
                const priceRangeId = p.billrange_id || p.range_id || p.id;
                const rangeId = range.id || range._id;
                return priceRangeId && priceRangeId.toString() === rangeId.toString();
            });
            
            if (!price) {
                console.warn(`No price found for range ${range.id}`);
                continue;
            }

            const fromRange = parseFloat(range.fromRange || range.from_range || range.from || 0);
            const toRange = range.toRange ? parseFloat(range.toRange || range.to_range || range.to) : Infinity;
            const unitPrice = parseFloat(price.unitprice || price.uniprice || 0);
            const fixedAmount = parseFloat(price.fixedamount || 0);
            
            console.log(`\nProcessing range ${i+1}: ${fromRange} - ${toRange}`);
            console.log(`Price: Rs. ${unitPrice}/unit + Rs. ${fixedAmount} fixed`);
            console.log(`Remaining units before this range: ${remainingUnits}`);

            // Calculate units that can go into this range
            let unitsInThisRange = 0;
            
            if (toRange === Infinity) {
                // Last infinite range - take all remaining units
                unitsInThisRange = remainingUnits;
                remainingUnits = 0;
                console.log(`Infinite range - taking all: ${unitsInThisRange} units`);
            } else {
                // Calculate capacity of this range
                const rangeCapacity = toRange - fromRange + 1;
                
                // Determine units to allocate to this range
                if (i === 0) {
                    // For first range, check if used units are less than the range
                    if (usedUnits <= rangeCapacity) {
                        unitsInThisRange = usedUnits;
                    } else {
                        unitsInThisRange = rangeCapacity;
                    }
                } else {
                    // For subsequent ranges, allocate based on remaining units
                    unitsInThisRange = Math.min(rangeCapacity, remainingUnits);
                }
                
                remainingUnits -= unitsInThisRange;
                console.log(`Range capacity: ${rangeCapacity}, Allocating: ${unitsInThisRange} units`);
                console.log(`Remaining units after range: ${remainingUnits}`);
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
                    calculation: `${unitsInThisRange} × ${unitPrice} + ${fixedAmount} = ${rangeAmount.toFixed(2)}`
                });
                
                console.log(`Range calculation: ${unitsInThisRange} × ${unitPrice} + ${fixedAmount} = ${rangeAmount}`);
                console.log(`Cumulative total: ${totalAmount}`);
            }
        }

        // Handle any leftover units
        if (remainingUnits > 0) {
            console.log(`Leftover units: ${remainingUnits} - should not happen with proper ranges`);
        }

        console.log("=== FINAL CALCULATION ===");
        console.log("Total amount:", totalAmount.toFixed(2));
        console.log("Calculation details:", details);

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

    // Calculate button handler
    const handleCalculate = () => {
        const usedUnits = parseFloat(formData.used_units);
        
        if (!usedUnits || usedUnits <= 0) {
            toast.error("Please enter valid used units");
            return;
        }
        
        if (billRanges.length === 0) {
            toast.error("No bill ranges configured");
            return;
        }
        
        if (billPrices.length === 0) {
            toast.error("No prices set for selected month/year");
            return;
        }
        
        const { totalAmount, details } = calculateBillAmountSequential(usedUnits);
        setFormData(prev => ({
            ...prev,
            total_amount: totalAmount.toFixed(2)
        }));
        updateCalculation(usedUnits, totalAmount, details);
        
        // toast.success(`Calculated total: Rs. ${totalAmount.toFixed(2)}`);
    };

    // Generate bill handler
    const handleGenerateBill = async () => {
        if (!calculation) {
            toast.error("Please calculate the bill first");
            return;
        }
        
        // Debug: Check what data we have
        console.log("🔍 DEBUG - scannedData:", scannedData);
        console.log("🔍 DEBUG - All scannedData keys:", Object.keys(scannedData || {}));
        
        // Check if we have all required data
        // Use the correct property names from your QR data structure
        const houseId = scannedData?.house_db_id;
        const apartmentId = scannedData?.apt_id || scannedData?.apartment_db_id || scannedData?.apartment_id;
        const floorId = scannedData?.f_id || scannedData?.floor_db_id;

        console.log("🔍 DEBUG - Extracted IDs:", { 
            houseId, 
            apartmentId,
            h_id: scannedData?.h_id,
            house_id: scannedData?.house_id,
            house_db_id: scannedData?.house_db_id,
            apt_id: scannedData?.apt_id,
            apartment_db_id: scannedData?.apartment_db_id,
            apartment_id: scannedData?.apartment_id,
            f_id: scannedData?.f_id
        });
        
        if (!houseId || !apartmentId || !floorId) {
            toast.error("House information is missing. Please scan the QR code again.");
            console.error("❌ Missing data:", { 
                houseId, 
                apartmentId,
                floorId,
                fullScannedData: scannedData 
            });
            return;
        }
        
        try {
            setGeneratingBill(true);
            
            // Create payload for bill generation
            const payload = {
                house_id: houseId,
                apartment_id: apartmentId,
                floor_id: floorId,
                bill_id: bill_id,
                year: parseInt(formData.year),
                month: getMonthName(parseInt(formData.month)),
                previous_reading: parseFloat(formData.previous_reading) || 0,
                current_reading: parseFloat(formData.current_reading) || 0,
                used_units: parseFloat(formData.used_units) || calculation.used_units,
                totalAmount: parseFloat(formData.total_amount) || calculation.total_amount,
                due_date: dueDate || null
            };
            
            console.log("📤 Generating bill with payload:", payload);
            
            // Call the API endpoint
            const response = await api.post('/generate-measurable-bills/from-calculation', payload);
            
            console.log("API Response:", response.data);
            
            if (response.data.success) {
                toast.success("Bill generated successfully!");

        //         const billData = response.data.data;
        //             if (billData) {
        //                 toast.info(`📊 Bill Details:
        // • Measurable Bill ID: ${billData.id || 'Generated'}
        // • Total Amount: Rs. ${billData.totalAmount || formData.total_amount}
        // • Used Units: ${billData.used_units || formData.used_units} units
        // • Bill payment record also created`);
        //             }
                
                // Reset form for next bill
                setFormData({
                    month: new Date().getMonth() + 1,
                    year: new Date().getFullYear(),
                    previous_reading: formData.current_reading, // Set previous reading to current reading
                    current_reading: '',
                    used_units: '',
                    total_amount: ''
                });
                
                setCalculation(null);
                setCalculationDetails([]);
                
                // Optionally navigate to bills list or stay on page
                setTimeout(() => {
                    // You can navigate to the bills list or stay on page
                    // navigate('/measurable-bills');
                    
                    // Reload previous reading for next bill (using current reading as previous)
                    loadPreviousReading();
                }, 2000);
                
            } else {
                toast.error(response.data.message || "Failed to generate bill");
            }
        } catch (err) {
            console.error("Error generating bill:", err);
            console.error("Error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
            
            let errorMessage = "Failed to generate bill";
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            toast.error(errorMessage);
        } finally {
            setGeneratingBill(false);
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
        if (formData.used_units && parseFloat(formData.used_units) > 0 && 
            billRanges.length > 0 && billPrices.length > 0) {
            const usedUnits = parseFloat(formData.used_units);
            const { totalAmount, details } = calculateBillAmountSequential(usedUnits);
            setFormData(prev => ({
                ...prev,
                total_amount: totalAmount.toFixed(2)
            }));
            updateCalculation(usedUnits, totalAmount, details);
        }
    }, [billRanges, billPrices]);

    // When selected range changes, find its price
    useEffect(() => {
        if (selectedRange && billPrices.length > 0) {
            findPriceForSelectedRange();
        }
    }, [selectedRange, billPrices]);

    // Initial load
    useEffect(() => {
        if (!scannedData || !bill_id) {
            toast.error('Missing required data. Please scan again.');
            navigate('/measurable-bills');
            return;
        }

        loadBillRanges();
        loadPreviousReading();
        
        // Initialize refs
        prevMonthRef.current = formData.month;
        prevYearRef.current = formData.year;
    }, [bill_id, scannedData]);

    // Load prices when month/year changes or when ranges are loaded
    useEffect(() => {
        if (bill_id && formData.month && formData.year && billRanges.length > 0) {
            console.log("🚀 Loading prices on mount or range change");
            loadAllPricesForMonthYear();
        }
    }, [bill_id, formData.month, formData.year, billRanges.length]);

    // Get current month name for display
    const currentMonthName = getMonthName(formData.month);


    // Add this useEffect to debug scannedData
useEffect(() => {
    console.log("🔍 Full scannedData:", scannedData);
    console.log("🔍 Available keys in scannedData:", Object.keys(scannedData || {}));
    
    if (scannedData) {
        console.log("🔍 Apartment data:", {
            apartment_id: scannedData.apartment_id,
            apt: scannedData.apt,
            apartment: scannedData.apartment,
            h_id: scannedData.h_id,
            house_id: scannedData.house_id,
            f_id: scannedData.f_id,
            floor: scannedData.floor
        });
    }
}, [scannedData]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            <Sidebar />
            
            <div className="flex-1 flex flex-col">
                <Navbar />
                
                <main className="flex-1 p-4 md:p-6">
                    <div className="max-w-7xl mx-auto w-full">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                            <div className="flex-1">
                                <button 
                                    onClick={() => navigate('/measurable-bills')}
                                    className="mb-2 md:mb-3 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm md:text-base"
                                >
                                    <svg className="w-4 h-4 md:w-5 md:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Back to Measurable Bills
                                </button>
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                                    Calculate Bill: {billData?.bill_name || 'Measurable Bill'}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm md:text-base">
                                    Calculate bill for scanned house
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    loadBillRanges();
                                    loadAllPricesForMonthYear();
                                    loadPreviousReading();
                                    toast.info("Refreshing data...");
                                }}
                                className="px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center text-sm md:text-base"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Data
                            </button>
                        </div>

                        {/* House Information Card */}
                        {scannedData && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
                                    House Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                    <div className="bg-gray-50 dark:bg-gray-900 p-3 md:p-4 rounded-lg">
                                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">House ID</p>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                                            {scannedData.h_id || scannedData.house_id}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-3 md:p-4 rounded-lg">
                                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Apartment</p>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                                            {scannedData.apt || scannedData.apartment}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900 p-3 md:p-4 rounded-lg">
                                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Floor</p>
                                        <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base">
                                            {scannedData.fl || scannedData.floor || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                            {/* Calculation Form */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
                                    <form className="space-y-4 md:space-y-6">
                                        {/* Month and Year Selection */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                                                    Month
                                                </label>
                                                <select
                                                    name="month"
                                                    value={formData.month}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
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
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                                                    Year
                                                </label>
                                                <select
                                                    name="year"
                                                    value={formData.year}
                                                    onChange={handleInputChange}
                                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                                                    required
                                                >
                                                    {yearOptions.map(year => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
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

                                        {/* Reading Inputs */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                                                    Previous Reading (units)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        name="previous_reading"
                                                        value={formData.previous_reading}
                                                        onChange={handleInputChange}
                                                        placeholder="Previous reading"
                                                        min="0"
                                                        step="1"
                                                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                                                        required
                                                        readOnly
                                                    />
                                                    {loadingPreviousReading && (
                                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                            <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-blue-600"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Auto-loaded from last bill
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                                                    Current Reading (units)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="current_reading"
                                                    value={formData.current_reading}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter current reading"
                                                    min={formData.previous_reading}
                                                    step="1"
                                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Enter meter reading for {currentMonthName} {formData.year}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Used Units */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                                                Used Units (auto-calculated)
                                            </label>
                                            <input
                                                type="number"
                                                name="used_units"
                                                value={formData.used_units}
                                                readOnly
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base"
                                            />
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Current reading - Previous reading
                                            </p>
                                        </div>

                                        {/* Bill Ranges Display */}
                                        {Array.isArray(billRanges) && billRanges.length > 0 ? (
                                            <div className="space-y-2 md:space-y-3">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Bill Ranges for {currentMonthName} {formData.year}
                                                </label>
                                                <div className="overflow-x-auto -mx-2 md:mx-0">
                                                    <div className="inline-block min-w-full align-middle">
                                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-300 dark:border-gray-600">
                                                            <thead className="bg-blue-50 dark:bg-blue-900">
                                                                <tr>
                                                                    <th className="px-2 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">#</th>
                                                                    <th className="px-2 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">From</th>
                                                                    <th className="px-2 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">To</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                                {billRanges.map((range, index) => {
                                                                    const fromRange = range.fromRange || range.from_range || range.from || 0;
                                                                    const toRange = range.toRange || range.to_range || range.to || '∞';
                                                                    const rangeId = range.id || range._id;
                                                                    
                                                                    const isSelected = selectedRange?.id === rangeId;
                                                                    
                                                                    return (
                                                                        <tr 
                                                                            key={rangeId || index}
                                                                            onClick={() => handleRangeSelect(range)}
                                                                            className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                                                                isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                                                                            }`}
                                                                        >
                                                                            <td className="px-2 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm  text-gray-700 dark:text-gray-300">
                                                                                <div className="flex items-center">
                                                                                    <span className="font-medium">{index + 1}</span>
                                                                                    {isSelected && (
                                                                                        <div className="ml-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-2 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                                                {fromRange}
                                                                            </td>
                                                                            <td className="px-2 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                                                                                {toRange}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 md:mt-2">
                                                    Tap on any row to select a range and view its price
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="p-3 md:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                                                    {loading ? 'Loading bill ranges...' : 'No bill ranges found for this bill. Please add ranges first.'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Selected Range Price Information */}
                                        {selectedRange && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                                                    Price for Selected Range
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Range</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {selectedRange.fromRange || selectedRange.from_range || selectedRange.from || 0} - 
                                                            {selectedRange.toRange || selectedRange.to_range || selectedRange.to || '∞'}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Month</p>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {currentMonthName} {formData.year}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Unit Price</p>
                                                        <p className="font-medium text-green-600 dark:text-green-400">
                                                            {rangePrice ? (
                                                                <>Rs. {rangePrice.unitprice || rangePrice.uniprice || '0.00'}/unit</>
                                                            ) : (
                                                                <span className="text-yellow-600 dark:text-yellow-400 italic">
                                                                    Not set for this month
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Fixed Amount</p>
                                                        <p className="font-medium text-green-600 dark:text-green-400">
                                                            {rangePrice && rangePrice.fixedamount ? (
                                                                <>Rs. {rangePrice.fixedamount}</>
                                                            ) : (
                                                                <span className="text-gray-500 dark:text-gray-400 italic">
                                                                    Rs. 0.00
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!rangePrice && (
                                                    <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded">
                                                        <p className="text-xs text-yellow-700 dark:text-yellow-400">
                                                            ⚠️ No price set for this range in {currentMonthName} {formData.year}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* All Prices Summary */}
                                        {billPrices.length > 0 && (
                                            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Price Summary for {currentMonthName} {formData.year}
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    <div className="flex items-center">
                                                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            Prices set: {billPrices.length}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            Missing prices: {billRanges.length - billPrices.length}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            Total ranges: {billRanges.length}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Calculate Button */}
                                        <button
                                            type="button"
                                            onClick={handleCalculate}
                                            disabled={!formData.used_units || parseFloat(formData.used_units) <= 0}
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base"
                                        >
                                            <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                            Calculate Bill
                                        </button>

                                        {/* Total Amount Display */}
                                        {formData.total_amount && (
                                            <div className="p-3 md:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base">Total Amount:</span>
                                                    <span className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                                                        Rs. {parseFloat(formData.total_amount).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => navigate('/measurable-bills')}
                                                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center text-sm md:text-base"
                                            >
                                                <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleGenerateBill}
                                                disabled={!calculation || generatingBill}
                                                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm md:text-base"
                                            >
                                                {generatingBill ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Generating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Generate Bill
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Calculation Preview */}
                            <div className="lg:col-span-1">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6 lg:sticky lg:top-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">
                                        Calculation Preview
                                    </h3>
                                    
                                    {calculation ? (
                                        <div className="space-y-3 md:space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400 text-sm">Previous Reading:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {formData.previous_reading} units
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600 dark:text-gray-400 text-sm">Current Reading:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {formData.current_reading} units
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                                                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Used Units:</span>
                                                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                                                        {calculation.used_units} units
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {/* Calculation Breakdown */}
                                            {calculationDetails.length > 0 && (
                                                <div className="space-y-2 md:space-y-3">
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Sequential Breakdown:
                                                    </p>
                                                    <div className="space-y-2 max-h-60 md:max-h-80 overflow-y-auto pr-1">
                                                        {calculationDetails.map((detail, index) => (
                                                            <div key={index} className="text-xs bg-gray-50 dark:bg-gray-700 p-2 md:p-3 rounded-lg">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="font-medium">Range {detail.range}:</span>
                                                                    <span className="font-medium">{detail.units} units</span>
                                                                </div>
                                                                <div className="text-gray-600 dark:text-gray-400 mb-2 text-xs">
                                                                    {detail.calculation}
                                                                </div>
                                                                <div className="flex justify-between items-center font-medium text-gray-700 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                                    <span>Range Amount:</span>
                                                                    <span className="text-green-600 dark:text-green-400">
                                                                        Rs. {detail.rangeAmount.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="pt-2 md:pt-3 border-t border-gray-300 dark:border-gray-600">
                                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                                            <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Total Amount:</span>
                                                            <span className="font-bold text-lg md:text-xl text-green-600 dark:text-green-400">
                                                                Rs. {calculation.total_amount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 md:py-8">
                                            <div className="text-gray-400 dark:text-gray-500 mb-2 text-2xl">
                                                📊
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                Enter current reading to see calculation preview
                                            </p>
                                        </div>
                                    )}

                                    {/* Missing Prices Warning */}
                                    {billRanges.length > 0 && billPrices.length < billRanges.length && (
                                        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-yellow-200 dark:border-yellow-800">
                                            <p className="text-xs md:text-sm text-yellow-600 dark:text-yellow-400">
                                                ⚠️ {billRanges.length - billPrices.length} range(s) missing price for {currentMonthName} {formData.year}
                                            </p>
                                        </div>
                                    )}

                                    {/* Debug Info */}
                                    <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <details className="text-xs">
                                            <summary className="cursor-pointer text-gray-500 dark:text-gray-400 flex items-center">
                                                <span>Debug Info</span>
                                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </summary>
                                            <div className="mt-2 space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Bill Ranges:</span>
                                                    <span>{billRanges.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Bill Prices:</span>
                                                    <span>{billPrices.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Month (Number):</span>
                                                    <span>{formData.month}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Month (Name):</span>
                                                    <span>{currentMonthName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Year:</span>
                                                    <span>{formData.year}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Used Units:</span>
                                                    <span>{formData.used_units || '0'}</span>
                                                </div>
                                                {billPrices.length > 0 && (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span>Prices Month Values:</span>
                                                            <span>{[...new Set(billPrices.map(p => p.month))].join(', ')}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Prices Year Values:</span>
                                                            <span>{[...new Set(billPrices.map(p => p.year))].join(', ')}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <ToastContainer 
                position="top-center" 
                autoClose={3000}
                className="mt-12 md:mt-0"
            />
        </div>
    );
}