// import React, { useState, useEffect, useContext } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import api from '../../api/axios';
// import Sidebar from '../../components/Sidebar';
// import Navbar from '../../components/Navbar';
// import { AuthContext } from '../../contexts/AuthContext';

// export default function CalculateMeasurableBill() {
//     const { bill_id } = useParams();
//     const navigate = useNavigate();
//     const { auth } = useContext(AuthContext);
    
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const [billRanges, setBillRanges] = useState([]);
//     const [billPrices, setBillPrices] = useState([]);
//     const [apartments, setApartments] = useState([]);
//     const [floors, setFloors] = useState([]);
//     const [houses, setHouses] = useState([]);
//     const [loadingFloors, setLoadingFloors] = useState(false);
//     const [loadingHouses, setLoadingHouses] = useState(false);
    
//     // Form state
//     const [formData, setFormData] = useState({
//         apartment_id: '',
//         floor_id: '',
//         house_id: '',
//         month: new Date().getMonth() + 1,
//         year: new Date().getFullYear(),
//         used_units: ''
//     });
    
//     const [calculation, setCalculation] = useState(null);

//     // Load user's assigned apartments
//     const loadUserApartments = async () => {
//         try {
//       setLoading(true);
//       const response = await api.get(`/user-apartments/users/${auth.user.id}/apartments`);
      
//       if (response.data.success) {
//         setApartments(response.data.data || []);
//       } else {
//         toast.error('Failed to load apartments');
//         setApartments([]);
//       }
//     } catch (error) {
//       console.error('Error fetching apartments:', error);
//       toast.error('Error loading your apartments');
//       setApartments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//     // Load bill ranges
//     const loadBillRanges = async () => {
//         try {
//             setLoading(true);
//             const result = await api.get(`/billranges?bill_id=${bill_id}`);
//             if (result.data.success && Array.isArray(result.data.data)) {
//                 const filtered = result.data.data.filter(range => range.bill_id === bill_id);
//                 setBillRanges(filtered);
//             } else {
//                 setBillRanges([]);
//             }
//         } catch (err) {
//             console.error("Error loading bill ranges:", err);
//             setError("Failed to load bill ranges.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Load bill prices
//     const loadBillPrices = async () => {
//         try {
//             const res = await api.get(`/billprice?bill_id=${bill_id}`);
//             if (res.data.success) {
//                 setBillPrices(res.data.data || []);
//             }
//         } catch (err) {
//             console.error("Error loading bill prices:", err);
//         }
//     };

//     // Load floors based on selected apartment
//     const loadFloorsByApartment = async (apartmentId) => {
//         if (!apartmentId) {
//             setFloors([]);
//             setHouses([]);
//             return;
//         }
        
//         try {
//             setLoadingFloors(true);
//             const response = await api.get(`/floors?apartment_id=${apartmentId}`);
//             if (response.data.success) {
//                 setFloors(response.data.data || []);
//             } else {
//                 setFloors([]);
//             }
//         } catch (error) {
//             console.error('Error loading floors:', error);
//             setFloors([]);
//         } finally {
//             setLoadingFloors(false);
//         }
//     };

//     // Load houses based on selected floor
//     const loadHousesByFloor = async (floorId) => {
//         if (!floorId || !formData.apartment_id) {
//             setHouses([]);
//             return;
//         }

//         try {
//             setLoadingHouses(true);
//             const response = await api.get(
//                 `/houses?floor_id=${floorId}&apartment_id=${formData.apartment_id}`
//             );
//             if (response.data.success) {
//                 setHouses(response.data.data || []);
//             } else {
//                 setHouses([]);
//             }
//         } catch (error) {
//             console.error("Error loading houses:", error);
//             setHouses([]);
//         } finally {
//             setLoadingHouses(false);
//         }
//     };

//     useEffect(() => {
//         loadUserApartments();
//         loadBillRanges();
//         loadBillPrices();
//     }, [bill_id]);

//     // Handle apartment selection
//   const handleApartmentChange = (apartmentId) => {
//     setFilters(prev => ({
//       ...prev,
//       apartment_id: apartmentId,
//       floor_id: '',
//       house_id: ''
//     }));
//     loadFloorsByApartment(apartmentId);
//   };

//   // Handle floor selection
//   const handleFloorChange = (floorId) => {
//     setFilters(prev => ({
//       ...prev,
//       floor_id: floorId,
//       house_id: ''
//     }));
//     loadHousesByFloor(floorId);
//   };

//   // Handle house selection
//   const handleHouseChange = (houseId) => {
//     setFilters(prev => ({
//       ...prev,
//       house_id: houseId
//     }));
//   };

//     useEffect(() => {
//         loadFloorsByApartment(formData.apartment_id);
//     }, [formData.apartment_id]);

//     useEffect(() => {
//         loadHousesByFloor(formData.floor_id);
//     }, [formData.floor_id]);



//     // Calculate bill amount based on ranges and units
//     const calculateBillAmount = (usedUnits) => {
//         if (!billRanges.length || !billPrices.length) return 0;

//         let remainingUnits = usedUnits;
//         let totalAmount = 0;

//         // Sort ranges by min_units to process in order
//         const sortedRanges = [...billRanges].sort((a, b) => a.min_units - b.min_units);

//         for (const range of sortedRanges) {
//             const rangePrice = billPrices.find(price => price.billrange_id === range.id);
//             if (!rangePrice) continue;

//             const rangeUnits = range.max_units ? 
//                 Math.min(remainingUnits, range.max_units - range.min_units + 1) : 
//                 remainingUnits;

//             if (rangeUnits > 0) {
//                 const rangeAmount = (rangeUnits * rangePrice.unit_price) + (rangePrice.fixed_amount || 0);
//                 totalAmount += rangeAmount;
//                 remainingUnits -= rangeUnits;
//             }

//             if (remainingUnits <= 0) break;
//         }

//         return totalAmount;
//     };

//     // Handle form input changes
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));

//         // Recalculate when units change
//         if (name === 'used_units' && value) {
//             const amount = calculateBillAmount(parseFloat(value));
//             setCalculation({
//                 used_units: parseFloat(value),
//                 total_amount: amount,
//                 calculated_at: new Date().toISOString()
//             });
//         }
//     };

//     // Submit bill calculation
//     const handleSubmit = async (e) => {
//         e.preventDefault();
        
//         if (!calculation) {
//             setError('Please enter used units to calculate');
//             return;
//         }

//         try {
//             setLoading(true);
//             setError(null);

//             const billPaymentData = {
//                 company_id: auth?.user?.company_id,
//                 apartment_id: formData.apartment_id,
//                 floor_id: formData.floor_id,
//                 house_id: formData.house_id,
//                 bill_id: bill_id,
//                 generate_bills_id_int: null, // Can be null for measurable bills
//                 payment_status: 'Pending',
//                 pendingAmount: calculation.total_amount,
//                 paidAmount: 0.00,
//                 due_date: new Date(formData.year, formData.month, 15).toISOString().split('T')[0], // 15th of selected month
//                 used_units: calculation.used_units,
//                 calculated_amount: calculation.total_amount,
//                 bill_month: formData.month,
//                 bill_year: formData.year
//             };

//             const response = await api.post('/billpayments', billPaymentData);
            
//             if (response.data.success) {
//                 alert('Bill calculated and saved successfully!');
//                 navigate('/measurable-bills');
//             } else {
//                 setError(response.data.message || 'Failed to save bill calculation');
//             }
//         } catch (err) {
//             console.error('Error saving bill calculation:', err);
//             setError(err.response?.data?.message || 'Failed to save bill calculation');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Generate month options
//     const monthOptions = [
//         { value: 1, label: 'January' }, { value: 2, label: 'February' },
//         { value: 3, label: 'March' }, { value: 4, label: 'April' },
//         { value: 5, label: 'May' }, { value: 6, label: 'June' },
//         { value: 7, label: 'July' }, { value: 8, label: 'August' },
//         { value: 9, label: 'September' }, { value: 10, label: 'October' },
//         { value: 11, label: 'November' }, { value: 12, label: 'December' }
//     ];

//     // Generate year options (current year and previous 2 years)
//     const currentYear = new Date().getFullYear();
//     const yearOptions = [
//         currentYear - 2,
//         currentYear - 1,
//         currentYear,
//         currentYear + 1
//     ];

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
//             <Sidebar />
            
//             <div className="flex-1 flex flex-col lg:ml-0">
//                 <Navbar />
                
//                 <main className="flex-1 p-6 ml-16">
//                     <div className="max-w-4xl mx-auto">
//                         {/* Header */}
//                         <div className="mb-6">
//                             <button 
//                                 onClick={() => navigate('/measurable-bills')}
//                                 className="mb-4 flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
//                             >
//                                 ← Back to Measurable Bills
//                             </button>
//                             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
//                                 Calculate Bill
//                             </h1>
//                             <p className="text-gray-600 dark:text-gray-400 mt-1">
//                                 Calculate bill amount based on used units
//                             </p>
//                         </div>

//                         {error && (
//                             <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                                 <p className="text-red-600 dark:text-red-400">{error}</p>
//                             </div>
//                         )}

//                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                             {/* Calculation Form */}
//                             <div className="lg:col-span-2">
//                                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//                                     <form onSubmit={handleSubmit} className="space-y-4">
//                                         {/* Month and Year Selection */}
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div>
//                                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                     Month
//                                                 </label>
//                                                 <select
//                                                     name="month"
//                                                     value={formData.month}
//                                                     onChange={handleInputChange}
//                                                     className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                                     required
//                                                 >
//                                                     {monthOptions.map(month => (
//                                                         <option key={month.value} value={month.value}>
//                                                             {month.label}
//                                                         </option>
//                                                     ))}
//                                                 </select>
//                                             </div>
//                                             <div>
//                                                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                     Year
//                                                 </label>
//                                                 <select
//                                                     name="year"
//                                                     value={formData.year}
//                                                     onChange={handleInputChange}
//                                                     className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                                     required
//                                                 >
//                                                     {yearOptions.map(year => (
//                                                         <option key={year} value={year}>
//                                                             {year}
//                                                         </option>
//                                                     ))}
//                                                 </select>
//                                             </div>
//                                         </div>

//                                         {/* Apartment Selection */}
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Apartment
//                                             </label>
//                                             <select
//                                                 name="apartment_id"
//                                                 value={formData.apartment_id}
//                                                 onChange={handleInputChange}
//                                                 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                                 required
//                                             >
//                                                 <option value="">Select Apartment</option>
//                                                 {apartments.map(apartment => (
//                                                     <option key={apartment.id} value={apartment.id}>
//                                                         {apartment.name}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                         </div>

//                                         {/* Floor Selection */}
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Floor
//                                             </label>
//                                             <select
//                                                 name="floor_id"
//                                                 value={formData.floor_id}
//                                                 onChange={handleInputChange}
//                                                 disabled={!formData.apartment_id || loadingFloors}
//                                                 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
//                                                 required
//                                             >
//                                                 <option value="">Select Floor</option>
//                                                 {floors.map(floor => (
//                                                     <option key={floor.id} value={floor.id}>
//                                                         {floor.floor_number}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                             {loadingFloors && (
//                                                 <p className="text-xs text-gray-500 mt-1">Loading floors...</p>
//                                             )}
//                                         </div>

//                                         {/* House Selection */}
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 House
//                                             </label>
//                                             <select
//                                                 name="house_id"
//                                                 value={formData.house_id}
//                                                 onChange={handleInputChange}
//                                                 disabled={!formData.floor_id || loadingHouses}
//                                                 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
//                                                 required
//                                             >
//                                                 <option value="">Select House</option>
//                                                 {houses.map(house => (
//                                                     <option key={house.id} value={house.id}>
//                                                         {house.house_number}
//                                                     </option>
//                                                 ))}
//                                             </select>
//                                             {loadingHouses && (
//                                                 <p className="text-xs text-gray-500 mt-1">Loading houses...</p>
//                                             )}
//                                         </div>

//                                         {/* Used Units Input */}
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                                                 Used Units
//                                             </label>
//                                             <input
//                                                 type="number"
//                                                 name="used_units"
//                                                 value={formData.used_units}
//                                                 onChange={handleInputChange}
//                                                 placeholder="Enter used units"
//                                                 min="0"
//                                                 step="0.01"
//                                                 className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                                                 required
//                                             />
//                                         </div>

//                                         {/* Submit Button */}
//                                         <button
//                                             type="submit"
//                                             disabled={loading || !calculation}
//                                             className="w-full bg-blue-600 dark:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                                         >
//                                             {loading ? 'Saving...' : 'Save Bill Calculation'}
//                                         </button>
//                                     </form>
//                                 </div>
//                             </div>

//                             {/* Calculation Preview */}
//                             <div className="lg:col-span-1">
//                                 <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
//                                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
//                                         Calculation Preview
//                                     </h3>
                                    
//                                     {calculation ? (
//                                         <div className="space-y-3">
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-600 dark:text-gray-400">Used Units:</span>
//                                                 <span className="font-semibold text-gray-900 dark:text-white">
//                                                     {calculation.used_units}
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between">
//                                                 <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
//                                                 <span className="font-semibold text-green-600 dark:text-green-400">
//                                                     Rs. {calculation.total_amount.toFixed(2)}
//                                                 </span>
//                                             </div>
//                                             <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
//                                                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                                                     This amount will be saved as Pending Amount in the bill payment record.
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     ) : (
//                                         <p className="text-gray-500 dark:text-gray-400 text-sm">
//                                             Enter used units to see calculation preview
//                                         </p>
//                                     )}

//                                     {/* Bill Ranges Info */}
//                                     {billRanges.length > 0 && (
//                                         <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
//                                             <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
//                                                 Bill Ranges:
//                                             </h4>
//                                             <div className="space-y-1 text-xs">
//                                                 {billRanges.map(range => {
//                                                     const price = billPrices.find(p => p.billrange_id === range.id);
//                                                     return (
//                                                         <div key={range.id} className="flex justify-between">
//                                                             <span className="text-gray-500 dark:text-gray-400">
//                                                                 {range.min_units} - {range.max_units || '∞'} units:
//                                                             </span>
//                                                             <span className="text-gray-700 dark:text-gray-300">
//                                                                 Rs. {price?.unit_price}/unit
//                                                                 {price?.fixed_amount ? ` + ${price.fixed_amount} fixed` : ''}
//                                                             </span>
//                                                         </div>
//                                                     );
//                                                 })}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </main>
//             </div>
//         </div>
//     );
// }

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import { AuthContext } from '../../contexts/AuthContext';

export default function CalculateMeasurableBill() {
    const { bill_id } = useParams();
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [billRanges, setBillRanges] = useState([]);
    const [billPrices, setBillPrices] = useState([]);
    const [apartments, setApartments] = useState([]);
    const [floors, setFloors] = useState([]);
    const [houses, setHouses] = useState([]);
    const [loadingFloors, setLoadingFloors] = useState(false);
    const [loadingHouses, setLoadingHouses] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        apartment_id: '',
        floor_id: '',
        house_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        used_units: ''
    });
    
    const [calculation, setCalculation] = useState(null);

    // Load user's assigned apartments
    const loadUserApartments = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/user-apartments/users/${auth.user.id}/apartments`);
            
            if (response.data.success) {
                setApartments(response.data.data || []);
            } else {
                console.error('Failed to load apartments');
                setApartments([]);
            }
        } catch (error) {
            console.error('Error fetching apartments:', error);
            setApartments([]);
        } finally {
            setLoading(false);
        }
    };

    // Load bill ranges
    const loadBillRanges = async () => {
        try {
            const result = await api.get(`/billranges?bill_id=${bill_id}`);
            if (result.data.success && Array.isArray(result.data.data)) {
                const filtered = result.data.data.filter(range => range.bill_id === bill_id);
                setBillRanges(filtered);
            } else {
                setBillRanges([]);
            }
        } catch (err) {
            console.error("Error loading bill ranges:", err);
            setError("Failed to load bill ranges.");
        }
    };

    // Load bill prices
    const loadBillPrices = async () => {
        try {
            const res = await api.get(`/billprice?bill_id=${bill_id}`);
            if (res.data.success) {
                setBillPrices(res.data.data || []);
            }
        } catch (err) {
            console.error("Error loading bill prices:", err);
        }
    };

    // Load floors based on selected apartment
    const loadFloorsByApartment = async (apartmentId) => {
        if (!apartmentId) {
            setFloors([]);
            setHouses([]);
            setFormData(prev => ({ ...prev, floor_id: '', house_id: '' }));
            return;
        }
        
        try {
            setLoadingFloors(true);
            console.log('Loading floors for apartment:', apartmentId);
            
            const response = await api.get(`/floors?apartment_id=${apartmentId}`);
            console.log('Floors API response:', response.data);
            
            if (response.data.success) {
                setFloors(response.data.data || []);
            } else {
                console.error('No floors data received');
                setFloors([]);
            }
        } catch (error) {
            console.error('Error loading floors:', error);
            console.error('Error details:', error.response?.data);
            setFloors([]);
        } finally {
            setLoadingFloors(false);
        }
    };

    // Load houses based on selected floor
    const loadHousesByFloor = async (floorId) => {
        if (!floorId || !formData.apartment_id) {
            setHouses([]);
            setFormData(prev => ({ ...prev, house_id: '' }));
            return;
        }

        try {
            setLoadingHouses(true);
            console.log('Loading houses for floor:', floorId, 'apartment:', formData.apartment_id);
            
            const response = await api.get(
                `/houses?floor_id=${floorId}&apartment_id=${formData.apartment_id}`
            );
            console.log('Houses API response:', response.data);
            
            if (response.data.success) {
                setHouses(response.data.data || []);
            } else {
                console.error('No houses data received');
                setHouses([]);
            }
        } catch (error) {
            console.error("Error loading houses:", error);
            console.error('Error details:', error.response?.data);
            setHouses([]);
        } finally {
            setLoadingHouses(false);
        }
    };

    useEffect(() => {
        loadUserApartments();
        loadBillRanges();
        loadBillPrices();
    }, [bill_id]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'apartment_id') {
            // When apartment changes, reset floor and house, and load floors
            setFormData(prev => ({
                ...prev,
                apartment_id: value,
                floor_id: '',
                house_id: ''
            }));
            loadFloorsByApartment(value);
        } 
        else if (name === 'floor_id') {
            // When floor changes, reset house and load houses
            setFormData(prev => ({
                ...prev,
                floor_id: value,
                house_id: ''
            }));
            loadHousesByFloor(value);
        }
        else if (name === 'house_id') {
            setFormData(prev => ({
                ...prev,
                house_id: value
            }));
        }
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Recalculate when units change
        if (name === 'used_units' && value) {
            const amount = calculateBillAmount(parseFloat(value));
            setCalculation({
                used_units: parseFloat(value),
                total_amount: amount,
                calculated_at: new Date().toISOString()
            });
        }
    };

    // Calculate bill amount based on ranges and units
    const calculateBillAmount = (usedUnits) => {
        if (!billRanges.length || !billPrices.length) return 0;

        let remainingUnits = usedUnits;
        let totalAmount = 0;

        // Sort ranges by min_units to process in order
        const sortedRanges = [...billRanges].sort((a, b) => a.min_units - b.min_units);

        for (const range of sortedRanges) {
            const rangePrice = billPrices.find(price => price.billrange_id === range.id);
            if (!rangePrice) continue;

            // Calculate units in this range
            let rangeUnits = 0;
            if (range.max_units) {
                // Range has max limit
                const availableUnitsInRange = range.max_units - range.min_units + 1;
                rangeUnits = Math.min(remainingUnits, availableUnitsInRange);
            } else {
                // No max limit (infinite range)
                rangeUnits = remainingUnits;
            }

            if (rangeUnits > 0) {
                const rangeAmount = (rangeUnits * rangePrice.unit_price) + (rangePrice.fixed_amount || 0);
                totalAmount += rangeAmount;
                remainingUnits -= rangeUnits;
            }

            if (remainingUnits <= 0) break;
        }

        return totalAmount;
    };

    // Submit bill calculation
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!calculation) {
            setError('Please enter used units to calculate');
            return;
        }

        // Validate all required fields
        if (!formData.apartment_id || !formData.floor_id || !formData.house_id) {
            setError('Please select apartment, floor, and house');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const billPaymentData = {
                company_id: auth?.user?.company_id,
                apartment_id: formData.apartment_id,
                floor_id: formData.floor_id,
                house_id: formData.house_id,
                bill_id: bill_id,
                generate_bills_id_int: null,
                payment_status: 'Pending',
                pendingAmount: calculation.total_amount,
                paidAmount: 0.00,
                due_date: new Date(formData.year, formData.month - 1, 15).toISOString().split('T')[0], // Month is 0-indexed
                used_units: calculation.used_units,
                calculated_amount: calculation.total_amount,
                bill_month: formData.month,
                bill_year: formData.year
            };

            console.log('Submitting bill payment:', billPaymentData);

            const response = await api.post('/billpayments', billPaymentData);
            
            if (response.data.success) {
                alert('Bill calculated and saved successfully!');
                navigate('/measurable-bills');
            } else {
                setError(response.data.message || 'Failed to save bill calculation');
            }
        } catch (err) {
            console.error('Error saving bill calculation:', err);
            console.error('Error details:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to save bill calculation');
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
        currentYear - 2,
        currentYear - 1,
        currentYear,
        currentYear + 1
    ];

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
                                Calculate Bill
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Calculate bill amount based on used units
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-600 dark:text-red-400">{error}</p>
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

                                        {/* Apartment Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Apartment
                                            </label>
                                            <select
                                                name="apartment_id"
                                                value={formData.apartment_id}
                                                onChange={handleInputChange}
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                required
                                            >
                                                <option value="">Select Apartment</option>
                                                {apartments.map(apartment => (
                                                    <option key={apartment.id} value={apartment.id}>
                                                        {apartment.name || `Apartment ${apartment.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Floor Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Floor
                                            </label>
                                            <select
                                                name="floor_id"
                                                value={formData.floor_id}
                                                onChange={handleInputChange}
                                                disabled={!formData.apartment_id || loadingFloors}
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                                required
                                            >
                                                <option value="">Select Floor</option>
                                                {floors.map(floor => (
                                                    <option key={floor.id} value={floor.id}>
                                                        {floor.floor_id || `Floor ${floor.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingFloors && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading floors...</p>
                                            )}
                                            {!loadingFloors && formData.apartment_id && floors.length === 0 && (
                                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">No floors found for this apartment</p>
                                            )}
                                        </div>

                                        {/* House Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                House
                                            </label>
                                            <select
                                                name="house_id"
                                                value={formData.house_id}
                                                onChange={handleInputChange}
                                                disabled={!formData.floor_id || loadingHouses}
                                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                                                required
                                            >
                                                <option value="">Select House</option>
                                                {houses.map(house => (
                                                    <option key={house.id} value={house.id}>
                                                        {house.house_id || `House ${house.id}`}
                                                    </option>
                                                ))}
                                            </select>
                                            {loadingHouses && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading houses...</p>
                                            )}
                                            {!loadingHouses && formData.floor_id && houses.length === 0 && (
                                                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">No houses found for this floor</p>
                                            )}
                                        </div>

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
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Used Units:</span>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {calculation.used_units}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    Rs. {calculation.total_amount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    This amount will be saved as Pending Amount in the bill payment record.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            Enter used units to see calculation preview
                                        </p>
                                    )}

                                    {/* Bill Ranges Info */}
                                    {billRanges.length > 0 && (
                                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Bill Ranges:
                                            </h4>
                                            <div className="space-y-1 text-xs">
                                                {billRanges.map(range => {
                                                    const price = billPrices.find(p => p.billrange_id === range.id);
                                                    return (
                                                        <div key={range.id} className="flex justify-between">
                                                            <span className="text-gray-500 dark:text-gray-400">
                                                                {range.min_units} - {range.max_units || '∞'} units:
                                                            </span>
                                                            <span className="text-gray-700 dark:text-gray-300">
                                                                Rs. {price?.unit_price}/unit
                                                                {price?.fixed_amount ? ` + ${price.fixed_amount} fixed` : ''}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}