// // // BillPaymentSettle.jsx
// // import React, { useState, useEffect } from 'react';
// // import { Search, Filter, Download, Eye, Edit, DollarSign, Calendar, Home, Building, Receipt, Trash2, CheckCircle, Clock, RefreshCw, PlusCircle, X } from 'lucide-react';
// // import api from '../api/axios';
// // import { toast, ToastContainer } from 'react-toastify';
// // import Sidebar from '../components/Sidebar';
// // import Navbar from '../components/Navbar';
// // import UpdateBillPayments from './UpdateBillPayments';

// // export default function BillPaymentSettle() {
// //   const [allBills, setAllBills] = useState([]); 
// //   const [filteredBills, setFilteredBills] = useState([]);
// //   const [totalPendingAmount, setTotalPendingAmount] = useState(0);
// //   const [totalPartialAmount, setTotalPartialAmount] = useState(0);
// //   const [loading, setLoading] = useState(false);
  
// //   // Step-by-step selection state
// //   const [selectionStep, setSelectionStep] = useState(1); 
// //   const [filters, setFilters] = useState({
// //     year: new Date().getFullYear(),
// //     month: '',
// //     apartment_id: '',
// //     floor_id: '',
// //     house_id: '',
// //     payment_status: 'Pending,Partial' // Default filter for both statuses
// //   });
  
// //   const [apartments, setApartments] = useState([]);
// //   const [floors, setFloors] = useState([]);
// //   const [houses, setHouses] = useState([]);
// //   const [selectedHouseInfo, setSelectedHouseInfo] = useState(null);
// //   const [loadingApartments, setLoadingApartments] = useState(false);
// //   const [loadingFloors, setLoadingFloors] = useState(false);
// //   const [loadingHouses, setLoadingHouses] = useState(false);
// //   const [selectedPayment, setSelectedPayment] = useState(null);
// //   const [showUpdateModal, setShowUpdateModal] = useState(false);
// //   const [showTotalPaymentModal, setShowTotalPaymentModal] = useState(false);
// //   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

// //   const months = [
// //     'January', 'February', 'March', 'April', 'May', 'June', 
// //     'July', 'August', 'September', 'October', 'November', 'December'
// //   ];
  
// //   const years = [2023, 2024, 2025, 2026];

// //   // Status filter options
// //   const statusOptions = [
// //     { value: 'Pending', label: 'Pending Only', color: 'bg-yellow-500' },
// //     { value: 'Partial', label: 'Partial Only', color: 'bg-blue-500' },
// //     { value: 'Pending,Partial', label: 'Both Pending & Partial', color: 'bg-gradient-to-r from-yellow-500 to-blue-500' }
// //   ];

// //   // Load apartments based on selected year/month
// //   const loadApartments = async () => {
// //     if (!filters.year || !filters.month) {
// //       toast.error('Please select both year and month first');
// //       return;
// //     }

// //     try {
// //       setLoadingApartments(true);
// //       const response = await api.get('/apartments');
// //       if (response.data.success) {
// //         setApartments(response.data.data || []);
// //         setSelectionStep(2); 
// //       } else {
// //         setApartments([]);
// //       }
// //     } catch (error) {
// //       console.error('Error loading apartments:', error);
// //       toast.error('Failed to load apartments');
// //       setApartments([]);
// //     } finally {
// //       setLoadingApartments(false);
// //     }
// //   };

// //   // Load floors based on selected apartment
// //   const loadFloorsByApartment = async (apartmentId) => {
// //     if (!apartmentId) {
// //       setFloors([]);
// //       return;
// //     }
    
// //     try {
// //       setLoadingFloors(true);
// //       const response = await api.get(`/floors?apartment_id=${apartmentId}`);
// //       if (response.data.success) {
// //         setFloors(response.data.data || []);
// //         setSelectionStep(3); // Move to floor selection step
// //       } else {
// //         setFloors([]);
// //       }
// //     } catch (error) {
// //       console.error('Error loading floors:', error);
// //       toast.error('Failed to load floors');
// //       setFloors([]);
// //     } finally {
// //       setLoadingFloors(false);
// //     }
// //   };

// //   // Load houses based on selected floor
// //   const loadHousesByFloor = async (floorId) => {
// //     if (!floorId || !filters.apartment_id) {
// //       setHouses([]);
// //       return;
// //     }

// //     try {
// //       setLoadingHouses(true);
// //       const response = await api.get(
// //         `/houses?floor_id=${floorId}&apartment_id=${filters.apartment_id}`
// //       );

// //       if (response.data.success) {
// //         setHouses(response.data.data || []);
// //         setSelectionStep(4); // Move to house selection step
// //       } else {
// //         setHouses([]);
// //       }
// //     } catch (error) {
// //       console.error("Error loading houses:", error);
// //       toast.error("Failed to load houses");
// //       setHouses([]);
// //     } finally {
// //       setLoadingHouses(false);
// //     }
// //   };

// //   // Load bills for selected house based on status filter
// //   const loadBillsForHouse = async (houseId) => {
// //     if (!houseId || !filters.apartment_id || !filters.floor_id || !filters.month || !filters.year) {
// //       toast.error('Please complete all selections first');
// //       return;
// //     }

// //     try {
// //       setLoading(true);
      
// //       // Get the selected house information
// //       const selectedHouse = houses.find(h => h.id === houseId);
// //       const apartment = apartments.find(a => a.id === filters.apartment_id);
// //       const floor = floors.find(f => f.id === filters.floor_id);
      
// //       if (selectedHouse && apartment && floor) {
// //         setSelectedHouseInfo({
// //           houseNumber: selectedHouse.house_id,
// //           apartmentName: apartment.name,
// //           floorNumber: floor.floor_id,
// //           houseId: selectedHouse.id
// //         });
// //       }

// //       // API call to get bills for this house, month, and year
// //       // Split multiple statuses if provided
// //       const statusArray = filters.payment_status.split(',');
      
// //       let billsData = [];
      
// //       // Fetch bills for each status
// //       for (const status of statusArray) {
// //         const params = new URLSearchParams({
// //           house_id: houseId,
// //           apartment_id: filters.apartment_id,
// //           floor_id: filters.floor_id,
// //           month: filters.month,
// //           year: filters.year,
// //           payment_status: status.trim()
// //         });

// //         const response = await api.get(`/bill-payments?${params}`);
        
// //         if (response.data.success) {
// //           billsData = [...billsData, ...(response.data.data || [])];
// //         }
// //       }
      
// //       setAllBills(billsData);
// //       updateFilteredBills(billsData);
      
// //       // Calculate total amounts
// //       const pendingTotal = billsData
// //         .filter(bill => bill.payment_status === 'Pending')
// //         .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
      
// //       const partialTotal = billsData
// //         .filter(bill => bill.payment_status === 'Partial')
// //         .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
      
// //       setTotalPendingAmount(pendingTotal);
// //       setTotalPartialAmount(partialTotal);
      
// //       // Move to bills display step
// //       setSelectionStep(5);
      
// //       const pendingCount = billsData.filter(b => b.payment_status === 'Pending').length;
// //       const partialCount = billsData.filter(b => b.payment_status === 'Partial').length;
      
// //       if (billsData.length > 0) {
// //         let message = `Found ${pendingCount} pending and ${partialCount} partial bills for House ${selectedHouse?.house_id}`;
// //         toast.success(message);
// //       } else {
// //         toast.info('No bills found for the selected criteria');
// //       }
// //     } catch (error) {
// //       console.error('Error loading bills:', error);
// //       toast.error('Failed to load bills');
// //       setAllBills([]);
// //       setFilteredBills([]);
// //       setTotalPendingAmount(0);
// //       setTotalPartialAmount(0);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Update filtered bills based on status filter
// //   const updateFilteredBills = (bills = allBills) => {
// //     const statusArray = filters.payment_status.split(',');
// //     const filtered = bills.filter(bill => 
// //       statusArray.includes(bill.payment_status)
// //     );
// //     setFilteredBills(filtered);
// //   };

// //   // Handle status filter change
// //   const handleStatusFilterChange = (status) => {
// //     setFilters(prev => ({
// //       ...prev,
// //       payment_status: status
// //     }));
    
// //     // Update filtered bills
// //     updateFilteredBills();
    
// //     // Recalculate totals based on filtered statuses
// //     const statusArray = status.split(',');
// //     const billsToCalculate = allBills.filter(bill => 
// //       statusArray.includes(bill.payment_status)
// //     );
    
// //     const pendingTotal = billsToCalculate
// //       .filter(bill => bill.payment_status === 'Pending')
// //       .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
// //     const partialTotal = billsToCalculate
// //       .filter(bill => bill.payment_status === 'Partial')
// //       .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
// //     setTotalPendingAmount(pendingTotal);
// //     setTotalPartialAmount(partialTotal);
// //   };

// //   // Handle year/month selection
// //   const handleYearMonthSelect = () => {
// //     if (!filters.year || !filters.month) {
// //       toast.error('Please select both year and month');
// //       return;
// //     }
// //     loadApartments();
// //   };

// //   // Handle apartment selection
// //   const handleApartmentSelect = (apartmentId) => {
// //     setFilters(prev => ({
// //       ...prev,
// //       apartment_id: apartmentId,
// //       floor_id: '',
// //       house_id: ''
// //     }));
// //     loadFloorsByApartment(apartmentId);
// //   };

// //   // Handle floor selection
// //   const handleFloorSelect = (floorId) => {
// //     setFilters(prev => ({
// //       ...prev,
// //       floor_id: floorId,
// //       house_id: ''
// //     }));
// //     loadHousesByFloor(floorId);
// //   };

// //   // Handle house selection
// //   const handleHouseSelect = (houseId) => {
// //     setFilters(prev => ({
// //       ...prev,
// //       house_id: houseId
// //     }));
// //     loadBillsForHouse(houseId);
// //   };

// //   // Reset the flow
// //   const resetFlow = () => {
// //     setSelectionStep(1);
// //     setFilters({
// //       year: new Date().getFullYear(),
// //       month: '',
// //       apartment_id: '',
// //       floor_id: '',
// //       house_id: '',
// //       payment_status: 'Pending,Partial'
// //     });
// //     setApartments([]);
// //     setFloors([]);
// //     setHouses([]);
// //     setAllBills([]);
// //     setFilteredBills([]);
// //     setTotalPendingAmount(0);
// //     setTotalPartialAmount(0);
// //     setSelectedHouseInfo(null);
// //   };

// //   // Handle individual bill payment
// //   const handleUpdatePayment = (payment) => {
// //     setSelectedPayment(payment);
// //     setShowUpdateModal(true);
// //   };

// //   // Handle total amount payment
// //   const handleTotalPayment = () => {
// //     setShowTotalPaymentModal(true);
// //   };

// //   const handleCloseModal = () => {
// //     setShowUpdateModal(false);
// //     setShowTotalPaymentModal(false);
// //     setSelectedPayment(null);
// //   };

// //   // Handle payment update from modal
// //   const handlePaymentUpdate = (updatedPayment) => {
// //     // Update the bills list
// //     const updatedBills = allBills.map(bill => 
// //       bill.id === updatedPayment.id ? updatedPayment : bill
// //     );
    
// //     setAllBills(updatedBills);
// //     updateFilteredBills(updatedBills);
    
// //     // Recalculate totals
// //     const pendingTotal = updatedBills
// //       .filter(bill => bill.payment_status === 'Pending')
// //       .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
// //     const partialTotal = updatedBills
// //       .filter(bill => bill.payment_status === 'Partial')
// //       .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
// //     setTotalPendingAmount(pendingTotal);
// //     setTotalPartialAmount(partialTotal);
    
// //     handleCloseModal();
    
// //     if (updatedPayment.payment_status === 'Paid') {
// //       toast.success('Payment completed successfully!');
// //     }
// //   };

// //   // Handle total payment for all filtered bills
// //   const handleTotalPaymentSubmit = async () => {
// //     try {
// //       setLoading(true);
      
// //       // Mark all filtered bills as paid
// //       const paymentPromises = filteredBills.map(bill =>
// //         api.patch(`/bill-payments/${bill.id}/status`, {
// //           payment_status: 'Paid',
// //           paidAmount: parseFloat(bill.paidAmount) + parseFloat(bill.pendingAmount),
// //           pendingAmount: 0,
// //           paid_at: new Date().toISOString()
// //         })
// //       );

// //       await Promise.all(paymentPromises);
      
// //       const totalAmount = totalPendingAmount + totalPartialAmount;
// //       toast.success(`Successfully paid ${filteredBills.length} bills totaling $${totalAmount.toFixed(2)}`);
      
// //       // Clear the bills
// //       setAllBills([]);
// //       setFilteredBills([]);
// //       setTotalPendingAmount(0);
// //       setTotalPartialAmount(0);
// //       setShowTotalPaymentModal(false);
      
// //     } catch (error) {
// //       console.error('Error processing total payment:', error);
// //       toast.error('Failed to process total payment');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // Get status color
// //   const getStatusColor = (status) => {
// //     switch (status) {
// //       case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
// //       case 'Partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
// //       case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
// //       case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
// //       case 'Refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
// //       default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
// //     }
// //   };

// //   // Get status icon
// //   const getStatusIcon = (status) => {
// //     switch (status) {
// //       case 'Paid': return <CheckCircle size={16} className="text-green-600" />;
// //       case 'Partial': return <Clock size={16} className="text-blue-600" />;
// //       case 'Pending': return <Clock size={16} className="text-yellow-600" />;
// //       default: return null;
// //     }
// //   };

// //   return (
// //     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
// //       <Sidebar onCollapse={setIsSidebarCollapsed} />
// //       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
// //         <Navbar/>
// //         <div className='flex-1 overflow-y-auto p-6'>
// //           <div className="mx-auto max-w-7xl">
// //             {/* Header */}
// //             <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6'>
// //               <div className='flex items-center'>
// //                 <Receipt size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
// //                 <div>
// //                   <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bill Payments Settlement</h1>
// //                   <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
// //                     Select criteria to view and pay pending & partial bills
// //                   </p>
// //                 </div>
// //               </div>
// //               <button
// //                 onClick={resetFlow}
// //                 className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
// //               >
// //                 Start Over
// //               </button>
// //             </div>

// //             {/* Step-by-step selection */}
// //             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
// //               <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
// //                 Step {selectionStep}: {selectionStep === 1 && 'Select Period'}
// //                 {selectionStep === 2 && 'Select Apartment'}
// //                 {selectionStep === 3 && 'Select Floor'}
// //                 {selectionStep === 4 && 'Select House'}
// //                 {selectionStep === 5 && 'View Bills'}
// //               </h2>

// //               {/* Progress indicators */}
// //               <div className="flex items-center justify-between mb-8">
// //                 {[1, 2, 3, 4, 5].map((step) => (
// //                   <div key={step} className="flex flex-col items-center">
// //                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
// //                       selectionStep >= step 
// //                         ? 'bg-purple-600 text-white' 
// //                         : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
// //                     }`}>
// //                       {step}
// //                     </div>
// //                     <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
// //                       {step === 1 && 'Period'}
// //                       {step === 2 && 'Apartment'}
// //                       {step === 3 && 'Floor'}
// //                       {step === 4 && 'House'}
// //                       {step === 5 && 'Bills'}
// //                     </span>
// //                   </div>
// //                 ))}
// //               </div>

// //               {/* Step 1: Year/Month Selection */}
// //               {selectionStep === 1 && (
// //                 <div className="space-y-6">
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                         Select Year
// //                       </label>
// //                       <select
// //                         value={filters.year}
// //                         onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
// //                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
// //                       >
// //                         {years.map(year => (
// //                           <option key={year} value={year}>{year}</option>
// //                         ))}
// //                       </select>
// //                     </div>

// //                     <div>
// //                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                         Select Month
// //                       </label>
// //                       <select
// //                         value={filters.month}
// //                         onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
// //                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
// //                       >
// //                         <option value="">Select Month</option>
// //                         {months.map(month => (
// //                           <option key={month} value={month}>{month}</option>
// //                         ))}
// //                       </select>
// //                     </div>
// //                   </div>

// //                   <div className="flex justify-end">
// //                     <button
// //                       onClick={handleYearMonthSelect}
// //                       disabled={!filters.year || !filters.month}
// //                       className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// //                     >
// //                       Next: Select Apartment
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Step 2: Apartment Selection */}
// //               {selectionStep === 2 && (
// //                 <div className="space-y-6">
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                       Select Apartment
// //                     </label>
// //                     <select
// //                       value={filters.apartment_id}
// //                       onChange={(e) => handleApartmentSelect(e.target.value)}
// //                       disabled={loadingApartments}
// //                       className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
// //                     >
// //                       <option value="">Select Apartment</option>
// //                       {apartments.map(apartment => (
// //                         <option key={apartment.id} value={apartment.id}>
// //                           {apartment.name}
// //                         </option>
// //                       ))}
// //                     </select>
// //                     {loadingApartments && (
// //                       <p className="text-xs text-gray-500 mt-1">Loading apartments...</p>
// //                     )}
// //                   </div>

// //                   <div className="flex justify-between">
// //                     <button
// //                       onClick={() => setSelectionStep(1)}
// //                       className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
// //                     >
// //                       Back
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Step 3: Floor Selection */}
// //               {selectionStep === 3 && (
// //                 <div className="space-y-6">
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                       Select Floor
// //                     </label>
// //                     <select
// //                       value={filters.floor_id}
// //                       onChange={(e) => handleFloorSelect(e.target.value)}
// //                       disabled={!filters.apartment_id || loadingFloors}
// //                       className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
// //                     >
// //                       <option value="">Select Floor</option>
// //                       {floors.map(floor => (
// //                         <option key={floor.id} value={floor.id}>
// //                           Floor {floor.floor_id}
// //                         </option>
// //                       ))}
// //                     </select>
// //                     {loadingFloors && (
// //                       <p className="text-xs text-gray-500 mt-1">Loading floors...</p>
// //                     )}
// //                   </div>

// //                   <div className="flex justify-between">
// //                     <button
// //                       onClick={() => setSelectionStep(2)}
// //                       className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
// //                     >
// //                       Back
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Step 4: House Selection */}
// //               {selectionStep === 4 && (
// //                 <div className="space-y-6">
// //                   <div>
// //                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
// //                       Select House
// //                     </label>
// //                     <select
// //                       value={filters.house_id}
// //                       onChange={(e) => handleHouseSelect(e.target.value)}
// //                       disabled={!filters.floor_id || loadingHouses}
// //                       className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
// //                     >
// //                       <option value="">Select House</option>
// //                       {houses.map(house => (
// //                         <option key={house.id} value={house.id}>
// //                           House {house.house_id}
// //                         </option>
// //                       ))}
// //                     </select>
// //                     {loadingHouses && (
// //                       <p className="text-xs text-gray-500 mt-1">Loading houses...</p>
// //                     )}
// //                   </div>

// //                   <div className="flex justify-between">
// //                     <button
// //                       onClick={() => setSelectionStep(3)}
// //                       className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
// //                     >
// //                       Back
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Step 5: Bills Display */}
// //               {selectionStep === 5 && selectedHouseInfo && (
// //                 <div>
// //                   {/* House Information Header */}
// //                   <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
// //                     <div>
// //                       <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
// //                         <Home className="mr-2 text-purple-600" size={24} />
// //                         Bills for House {selectedHouseInfo.houseNumber}
// //                       </h2>
// //                       <p className="text-gray-600 dark:text-gray-400">
// //                         {selectedHouseInfo.apartmentName} • Floor {selectedHouseInfo.floorNumber} • {filters.month} {filters.year}
// //                       </p>
// //                     </div>
                    
// //                     {/* Status Filter */}
// //                     <div className="flex flex-wrap gap-2">
// //                       {statusOptions.map((option) => (
// //                         <button
// //                           key={option.value}
// //                           onClick={() => handleStatusFilterChange(option.value)}
// //                           className={`px-3 py-1 text-sm rounded-lg border ${
// //                             filters.payment_status === option.value
// //                               ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
// //                               : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
// //                           } hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1`}
// //                         >
// //                           <div className={`w-2 h-2 rounded-full ${option.color}`}></div>
// //                           {option.label}
// //                         </button>
// //                       ))}
// //                     </div>
// //                   </div>

// //                   {/* Amount Summary Cards */}
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
// //                     <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
// //                       <div className="flex items-center mb-2">
// //                         <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
// //                         <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Pending Bills</h3>
// //                       </div>
// //                       <div className="text-yellow-800 dark:text-yellow-300 font-bold text-2xl">
// //                         ${totalPendingAmount.toFixed(2)}
// //                       </div>
// //                       <div className="text-yellow-600 dark:text-yellow-400 text-sm">
// //                         {allBills.filter(b => b.payment_status === 'Pending').length} bills
// //                       </div>
// //                     </div>
                    
// //                     <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
// //                       <div className="flex items-center mb-2">
// //                         <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
// //                         <h3 className="font-medium text-blue-800 dark:text-blue-300">Partial Bills</h3>
// //                       </div>
// //                       <div className="text-blue-800 dark:text-blue-300 font-bold text-2xl">
// //                         ${totalPartialAmount.toFixed(2)}
// //                       </div>
// //                       <div className="text-blue-600 dark:text-blue-400 text-sm">
// //                         {allBills.filter(b => b.payment_status === 'Partial').length} bills
// //                       </div>
// //                     </div>
// //                   </div>

// //                   {loading ? (
// //                     <div className="flex justify-center items-center py-12">
// //                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
// //                       <span className="ml-3 text-gray-600 dark:text-gray-400">Loading bills...</span>
// //                     </div>
// //                   ) : filteredBills.length === 0 ? (
// //                     <div className="text-center py-8">
// //                       <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
// //                       <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
// //                         No Bills Found
// //                       </h3>
// //                       <p className="text-gray-500 dark:text-gray-400">
// //                         No bills found for the selected status filter.
// //                       </p>
// //                       <button
// //                         onClick={() => handleStatusFilterChange('Pending,Partial')}
// //                         className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
// //                       >
// //                         Show All Bills
// //                       </button>
// //                     </div>
// //                   ) : (
// //                     <div>
// //                       {/* Pay All Button */}
// //                       <div className="mb-6 flex justify-end">
// //                         <button
// //                           onClick={handleTotalPayment}
// //                           disabled={filteredBills.length === 0}
// //                           className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
// //                         >
// //                           <DollarSign size={18} />
// //                           Pay All ({filteredBills.length} bills) - ${(totalPendingAmount + totalPartialAmount).toFixed(2)}
// //                         </button>
// //                       </div>

// //                       {/* Bills Table */}
// //                       <div className="overflow-x-auto">
// //                         <table className="w-full">
// //                           <thead className="bg-gray-50 dark:bg-gray-700">
// //                             <tr>
// //                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
// //                                 Status
// //                               </th>
// //                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
// //                                 Bill Name
// //                               </th>
// //                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
// //                                 Bill Type
// //                               </th>
// //                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
// //                                 Unit Price
// //                               </th>
// //                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
// //                                 Paid Amount
// //                               </th>
// //                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
// //                                 Pending Amount
// //                               </th>
// //                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
// //                                 Actions
// //                               </th>
// //                             </tr>
// //                           </thead>
// //                           <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
// //                             {filteredBills.map((bill) => (
// //                               <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
// //                                 <td className="px-4 py-3">
// //                                   <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(bill.payment_status)}`}>
// //                                     {getStatusIcon(bill.payment_status)}
// //                                     {bill.payment_status}
// //                                   </span>
// //                                 </td>
// //                                 <td className="px-4 py-3">
// //                                   <div className="font-medium text-gray-900 dark:text-white">
// //                                     {bill.bill_name}
// //                                   </div>
// //                                 </td>
// //                                 <td className="px-4 py-3">
// //                                   <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
// //                                     {bill.billtype}
// //                                   </span>
// //                                 </td>
// //                                 <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
// //                                   ${bill.unitPrice || '0.00'}
// //                                 </td>
// //                                 <td className="px-4 py-3 text-green-600 dark:text-green-400">
// //                                   ${bill.paidAmount || '0.00'}
// //                                 </td>
// //                                 <td className="px-4 py-3">
// //                                   <span className="font-bold text-red-600 dark:text-red-400">
// //                                     ${bill.pendingAmount || '0.00'}
// //                                   </span>
// //                                 </td>
// //                                 <td className="px-4 py-3">
// //                                   <div className="flex space-x-2">
// //                                     <button
// //                                       onClick={() => handleUpdatePayment(bill)}
// //                                       className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30"
// //                                       title="Update Payment"
// //                                     >
// //                                       <DollarSign size={18} />
// //                                     </button>
// //                                   </div>
// //                                 </td>
// //                               </tr>
// //                             ))}
// //                           </tbody>
// //                         </table>
// //                       </div>

// //                       <div className="mt-6 flex justify-between">
// //                         <button
// //                           onClick={() => setSelectionStep(4)}
// //                           className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
// //                         >
// //                           Back to House Selection
// //                         </button>
// //                         <button
// //                           onClick={resetFlow}
// //                           className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
// //                         >
// //                           Check Another House
// //                         </button>
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Individual Payment Modal */}
// //       {showUpdateModal && (
// //         <UpdateBillPayments
// //           payment={selectedPayment}
// //           onClose={handleCloseModal}
// //           onUpdate={handlePaymentUpdate}
// //         />
// //       )}

// //       {/* Total Payment Modal */}
// //       {showTotalPaymentModal && (
// //         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
// //           <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
// //             <div className="p-6">
// //               <div className="flex items-center mb-4">
// //                 <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
// //                   <DollarSign className="text-green-600 dark:text-green-400" size={24} />
// //                 </div>
// //                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
// //                   Pay All Selected Bills
// //                 </h3>
// //               </div>

// //               <p className="text-gray-600 dark:text-gray-300 mb-6">
// //                 You are about to pay all {filteredBills.length} selected bills for House {selectedHouseInfo?.houseNumber}.
// //               </p>

// //               <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
// //                 <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
// //                   Payment Summary
// //                 </h4>
// //                 <div className="space-y-2 text-sm">
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-600 dark:text-gray-400">Total Bills:</span>
// //                     <span className="font-medium">{filteredBills.length} bills</span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-600 dark:text-gray-400">Pending Amount:</span>
// //                     <span className="font-medium text-yellow-600 dark:text-yellow-400">${totalPendingAmount.toFixed(2)}</span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-600 dark:text-gray-400">Partial Amount:</span>
// //                     <span className="font-medium text-blue-600 dark:text-blue-400">${totalPartialAmount.toFixed(2)}</span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-600 dark:text-gray-400">House:</span>
// //                     <span className="font-medium">
// //                       {selectedHouseInfo?.apartmentName} - House {selectedHouseInfo?.houseNumber}
// //                     </span>
// //                   </div>
// //                   <div className="flex justify-between">
// //                     <span className="text-gray-600 dark:text-gray-400">Period:</span>
// //                     <span className="font-medium">{filters.month} {filters.year}</span>
// //                   </div>
// //                   <div className="flex justify-between border-t pt-2">
// //                     <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
// //                     <span className="font-bold text-green-600 dark:text-green-400 text-lg">
// //                       ${(totalPendingAmount + totalPartialAmount).toFixed(2)}
// //                     </span>
// //                   </div>
// //                 </div>
// //               </div>

// //               <div className="flex justify-end space-x-3">
// //                 <button
// //                   onClick={() => setShowTotalPaymentModal(false)}
// //                   disabled={loading}
// //                   className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   onClick={handleTotalPaymentSubmit}
// //                   disabled={loading}
// //                   className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
// //                 >
// //                   {loading ? (
// //                     <>
// //                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
// //                       Processing...
// //                     </>
// //                   ) : (
// //                     `Pay $${(totalPendingAmount + totalPartialAmount).toFixed(2)}`
// //                   )}
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       <ToastContainer position="top-center" autoClose={3000} />
// //     </div>
// //   );
// // }

// import React, { useState, useEffect } from 'react';
// import { Search, Filter, Download, Eye, Edit, DollarSign, Calendar, Home, Building, Receipt, Trash2, CheckCircle, Clock, RefreshCw, PlusCircle, X } from 'lucide-react';
// import api from '../api/axios';
// import { toast, ToastContainer } from 'react-toastify';
// import Sidebar from '../components/Sidebar';
// import Navbar from '../components/Navbar';
// import UpdateBillPayments from './UpdateBillPayments';

// export default function BillPaymentSettle() {
//   const [allBills, setAllBills] = useState([]); // Changed from pendingBills
//   const [filteredBills, setFilteredBills] = useState([]);
//   const [totalPendingAmount, setTotalPendingAmount] = useState(0);
//   const [totalPartialAmount, setTotalPartialAmount] = useState(0);
//   const [loading, setLoading] = useState(false);
  
//   // Step-by-step selection state
//   const [selectionStep, setSelectionStep] = useState(1); // 1: Year/Month, 2: Apartment, 3: Floor, 4: House, 5: Pending Bills
//   const [filters, setFilters] = useState({
//     year: new Date().getFullYear(),
//     month: '',
//     apartment_id: '',
//     floor_id: '',
//     house_id: '',
//     payment_status: 'Pending,Partial' // Default filter for both statuses
//   });
  
//   const [apartments, setApartments] = useState([]);
//   const [floors, setFloors] = useState([]);
//   const [houses, setHouses] = useState([]);
//   const [selectedHouseInfo, setSelectedHouseInfo] = useState(null);
//   const [loadingApartments, setLoadingApartments] = useState(false);
//   const [loadingFloors, setLoadingFloors] = useState(false);
//   const [loadingHouses, setLoadingHouses] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [showUpdateModal, setShowUpdateModal] = useState(false);
//   const [showTotalPaymentModal, setShowTotalPaymentModal] = useState(false);
//   const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [partialPaymentAmount, setPartialPaymentAmount] = useState(0);
//   const [partialPaymentDate, setPartialPaymentDate] = useState('');

//   const months = [
//     'January', 'February', 'March', 'April', 'May', 'June', 
//     'July', 'August', 'September', 'October', 'November', 'December'
//   ];
  
//   const years = [2023, 2024, 2025, 2026];

//   // Status filter options
//   const statusOptions = [
//     { value: 'Pending', label: 'Pending Only', color: 'bg-yellow-500' },
//     { value: 'Partial', label: 'Partial Only', color: 'bg-blue-500' },
//     { value: 'Pending,Partial', label: 'Both Pending & Partial', color: 'bg-gradient-to-r from-yellow-500 to-blue-500' }
//   ];

//   // Load apartments based on selected year/month
//   const loadApartments = async () => {
//     if (!filters.year || !filters.month) {
//       toast.error('Please select both year and month first');
//       return;
//     }

//     try {
//       setLoadingApartments(true);
//       const response = await api.get('/apartments');
//       if (response.data.success) {
//         setApartments(response.data.data || []);
//         setSelectionStep(2); // Move to apartment selection step
//       } else {
//         setApartments([]);
//       }
//     } catch (error) {
//       console.error('Error loading apartments:', error);
//       toast.error('Failed to load apartments');
//       setApartments([]);
//     } finally {
//       setLoadingApartments(false);
//     }
//   };

//   // Load floors based on selected apartment
//   const loadFloorsByApartment = async (apartmentId) => {
//     if (!apartmentId) {
//       setFloors([]);
//       return;
//     }
    
//     try {
//       setLoadingFloors(true);
//       const response = await api.get(`/floors?apartment_id=${apartmentId}`);
//       if (response.data.success) {
//         setFloors(response.data.data || []);
//         setSelectionStep(3); // Move to floor selection step
//       } else {
//         setFloors([]);
//       }
//     } catch (error) {
//       console.error('Error loading floors:', error);
//       toast.error('Failed to load floors');
//       setFloors([]);
//     } finally {
//       setLoadingFloors(false);
//     }
//   };

//   // Load houses based on selected floor
//   const loadHousesByFloor = async (floorId) => {
//     if (!floorId || !filters.apartment_id) {
//       setHouses([]);
//       return;
//     }

//     try {
//       setLoadingHouses(true);
//       const response = await api.get(
//         `/houses?floor_id=${floorId}&apartment_id=${filters.apartment_id}`
//       );

//       if (response.data.success) {
//         setHouses(response.data.data || []);
//         setSelectionStep(4); // Move to house selection step
//       } else {
//         setHouses([]);
//       }
//     } catch (error) {
//       console.error("Error loading houses:", error);
//       toast.error("Failed to load houses");
//       setHouses([]);
//     } finally {
//       setLoadingHouses(false);
//     }
//   };

//   // Load bills for selected house based on status filter
//   const loadBillsForHouse = async (houseId) => {
//     if (!houseId || !filters.apartment_id || !filters.floor_id || !filters.month || !filters.year) {
//       toast.error('Please complete all selections first');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       // Get the selected house information
//       const selectedHouse = houses.find(h => h.id === houseId);
//       const apartment = apartments.find(a => a.id === filters.apartment_id);
//       const floor = floors.find(f => f.id === filters.floor_id);
      
//       if (selectedHouse && apartment && floor) {
//         setSelectedHouseInfo({
//           houseNumber: selectedHouse.house_id,
//           apartmentName: apartment.name,
//           floorNumber: floor.floor_id,
//           houseId: selectedHouse.id
//         });
//       }

//       // API call to get bills for this house, month, and year
//       // Split multiple statuses if provided
//       const statusArray = filters.payment_status.split(',');
      
//       let billsData = [];
      
//       // Fetch bills for each status
//       for (const status of statusArray) {
//         const params = new URLSearchParams({
//           house_id: houseId,
//           apartment_id: filters.apartment_id,
//           floor_id: filters.floor_id,
//           month: filters.month,
//           year: filters.year,
//           payment_status: status.trim()
//         });

//         const response = await api.get(`/bill-payments?${params}`);
        
//         if (response.data.success) {
//           billsData = [...billsData, ...(response.data.data || [])];
//         }
//       }
      
//       setAllBills(billsData);
//       updateFilteredBills(billsData);
      
//       // Calculate total amounts
//       const pendingTotal = billsData
//         .filter(bill => bill.payment_status === 'Pending')
//         .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
      
//       const partialTotal = billsData
//         .filter(bill => bill.payment_status === 'Partial')
//         .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
      
//       setTotalPendingAmount(pendingTotal);
//       setTotalPartialAmount(partialTotal);
      
//       // Reset partial payment amount
//       setPartialPaymentAmount(0);
//       setPartialPaymentDate('');
      
//       // Move to bills display step
//       setSelectionStep(5);
      
//       const pendingCount = billsData.filter(b => b.payment_status === 'Pending').length;
//       const partialCount = billsData.filter(b => b.payment_status === 'Partial').length;
      
//       if (billsData.length > 0) {
//         let message = `Found ${pendingCount} pending and ${partialCount} partial bills for House ${selectedHouse?.house_id}`;
//         toast.success(message);
//       } else {
//         toast.info('No bills found for the selected criteria');
//       }
//     } catch (error) {
//       console.error('Error loading bills:', error);
//       toast.error('Failed to load bills');
//       setAllBills([]);
//       setFilteredBills([]);
//       setTotalPendingAmount(0);
//       setTotalPartialAmount(0);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update filtered bills based on status filter
//   const updateFilteredBills = (bills = allBills) => {
//     const statusArray = filters.payment_status.split(',');
//     const filtered = bills.filter(bill => 
//       statusArray.includes(bill.payment_status)
//     );
//     setFilteredBills(filtered);
//   };

//   // Handle status filter change
//   const handleStatusFilterChange = (status) => {
//     setFilters(prev => ({
//       ...prev,
//       payment_status: status
//     }));
    
//     // Update filtered bills
//     updateFilteredBills();
    
//     // Recalculate totals based on filtered statuses
//     const statusArray = status.split(',');
//     const billsToCalculate = allBills.filter(bill => 
//       statusArray.includes(bill.payment_status)
//     );
    
//     const pendingTotal = billsToCalculate
//       .filter(bill => bill.payment_status === 'Pending')
//       .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
//     const partialTotal = billsToCalculate
//       .filter(bill => bill.payment_status === 'Partial')
//       .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
//     setTotalPendingAmount(pendingTotal);
//     setTotalPartialAmount(partialTotal);
//   };

//   // Handle year/month selection
//   const handleYearMonthSelect = () => {
//     if (!filters.year || !filters.month) {
//       toast.error('Please select both year and month');
//       return;
//     }
//     loadApartments();
//   };

//   // Handle apartment selection
//   const handleApartmentSelect = (apartmentId) => {
//     setFilters(prev => ({
//       ...prev,
//       apartment_id: apartmentId,
//       floor_id: '',
//       house_id: ''
//     }));
//     loadFloorsByApartment(apartmentId);
//   };

//   // Handle floor selection
//   const handleFloorSelect = (floorId) => {
//     setFilters(prev => ({
//       ...prev,
//       floor_id: floorId,
//       house_id: ''
//     }));
//     loadHousesByFloor(floorId);
//   };

//   // Handle house selection
//   const handleHouseSelect = (houseId) => {
//     setFilters(prev => ({
//       ...prev,
//       house_id: houseId
//     }));
//     loadBillsForHouse(houseId);
//   };

//   // Reset the flow
//   const resetFlow = () => {
//     setSelectionStep(1);
//     setFilters({
//       year: new Date().getFullYear(),
//       month: '',
//       apartment_id: '',
//       floor_id: '',
//       house_id: '',
//       payment_status: 'Pending,Partial'
//     });
//     setApartments([]);
//     setFloors([]);
//     setHouses([]);
//     setAllBills([]);
//     setFilteredBills([]);
//     setTotalPendingAmount(0);
//     setTotalPartialAmount(0);
//     setSelectedHouseInfo(null);
//     setPartialPaymentAmount(0);
//     setPartialPaymentDate('');
//   };

//   // Handle individual bill payment
//   const handleUpdatePayment = (payment) => {
//     setSelectedPayment(payment);
//     setShowUpdateModal(true);
//   };

//   // Handle total amount payment
//   const handleTotalPayment = () => {
//     setShowTotalPaymentModal(true);
//   };

//   // Handle partial payment for all bills
//   const handlePartialPayment = () => {
//     // Set default partial payment amount to 50% of total
//     const defaultAmount = ((totalPendingAmount + totalPartialAmount) * 0.5).toFixed(2);
//     setPartialPaymentAmount(defaultAmount);
//     setPartialPaymentDate(new Date().toISOString().split('T')[0]);
//     setShowPartialPaymentModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowUpdateModal(false);
//     setShowTotalPaymentModal(false);
//     setShowPartialPaymentModal(false);
//     setSelectedPayment(null);
//   };

//   // Handle payment update from modal
//   const handlePaymentUpdate = (updatedPayment) => {
//     // Update the bills list
//     const updatedBills = allBills.map(bill => 
//       bill.id === updatedPayment.id ? updatedPayment : bill
//     );
    
//     setAllBills(updatedBills);
//     updateFilteredBills(updatedBills);
    
//     // Recalculate totals
//     const pendingTotal = updatedBills
//       .filter(bill => bill.payment_status === 'Pending')
//       .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
//     const partialTotal = updatedBills
//       .filter(bill => bill.payment_status === 'Partial')
//       .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
//     setTotalPendingAmount(pendingTotal);
//     setTotalPartialAmount(partialTotal);
    
//     handleCloseModal();
    
//     if (updatedPayment.payment_status === 'Paid') {
//       toast.success('Payment completed successfully!');
//     }
//   };

//   // Helper function to format currency
//   const formatCurrency = (value) => {
//     const numValue = typeof value === 'string' ? parseFloat(value) : value;
//     return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
//   };

//   // Handle total payment for all filtered bills
//   const handleTotalPaymentSubmit = async () => {
//     try {
//       setLoading(true);
      
//       // Mark all filtered bills as paid
//       const paymentPromises = filteredBills.map(bill =>
//         api.patch(`/bill-payments/${bill.id}/status`, {
//           payment_status: 'Paid',
//           paidAmount: parseFloat(bill.paidAmount) + parseFloat(bill.pendingAmount),
//           pendingAmount: 0,
//           paid_at: new Date().toISOString()
//         })
//       );

//       await Promise.all(paymentPromises);
      
//       const totalAmount = totalPendingAmount + totalPartialAmount;
//       toast.success(`Successfully paid ${filteredBills.length} bills totaling $${totalAmount.toFixed(2)}`);
      
//       // Clear the bills
//       setAllBills([]);
//       setFilteredBills([]);
//       setTotalPendingAmount(0);
//       setTotalPartialAmount(0);
//       setShowTotalPaymentModal(false);
      
//     } catch (error) {
//       console.error('Error processing total payment:', error);
//       toast.error('Failed to process total payment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle partial payment for all filtered bills
//   const handlePartialPaymentSubmit = async () => {
//     try {
//       setLoading(true);
      
//       const totalAmount = totalPendingAmount + totalPartialAmount;
//       const paymentAmount = parseFloat(partialPaymentAmount);
      
//       if (paymentAmount <= 0) {
//         toast.error('Payment amount must be greater than 0');
//         return;
//       }
      
//       if (paymentAmount > totalAmount) {
//         toast.error(`Payment amount cannot exceed total amount of $${formatCurrency(totalAmount)}`);
//         return;
//       }
      
//       // Distribute the partial payment across all bills proportionally
//       const billsWithDistribution = filteredBills.map(bill => {
//         const billPendingAmount = parseFloat(bill.pendingAmount) || 0;
//         const billProportion = billPendingAmount / totalAmount;
//         const billPayment = paymentAmount * billProportion;
        
//         return {
//           ...bill,
//           additionalPayment: billPayment
//         };
//       });
      
//       // Update each bill with its share of the partial payment
//       const paymentPromises = billsWithDistribution.map(bill => {
//         const newPaidAmount = parseFloat(bill.paidAmount) + bill.additionalPayment;
//         const newPendingAmount = parseFloat(bill.pendingAmount) - bill.additionalPayment;
        
//         let newStatus = 'Partial';
//         if (newPendingAmount <= 0.01) {
//           newStatus = 'Paid';
//         } else if (newPaidAmount > 0) {
//           newStatus = 'Partial';
//         }
        
//         return api.patch(`/bill-payments/${bill.id}/status`, {
//           payment_status: newStatus,
//           paidAmount: newPaidAmount,
//           paid_at: partialPaymentDate || new Date().toISOString().split('T')[0]
//         });
//       });

//       await Promise.all(paymentPromises);
      
//       toast.success(`Successfully paid $${formatCurrency(paymentAmount)} across ${filteredBills.length} bills`);
      
//       // Reload bills to get updated amounts
//       await loadBillsForHouse(filters.house_id);
      
//       setShowPartialPaymentModal(false);
      
//     } catch (error) {
//       console.error('Error processing partial payment:', error);
//       toast.error('Failed to process partial payment');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
//       case 'Partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
//       case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
//       case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
//       case 'Refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
//       default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
//     }
//   };

//   // Get status icon
//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'Paid': return <CheckCircle size={16} className="text-green-600" />;
//       case 'Partial': return <Clock size={16} className="text-blue-600" />;
//       case 'Pending': return <Clock size={16} className="text-yellow-600" />;
//       default: return null;
//     }
//   };

//   // Calculate total amount for all filtered bills
//   const totalAmount = totalPendingAmount + totalPartialAmount;

//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
//       <Sidebar onCollapse={setIsSidebarCollapsed} />
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
//         <Navbar/>
//         <div className='flex-1 overflow-y-auto p-6'>
//           <div className="mx-auto max-w-7xl">
//             {/* Header */}
//             <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6'>
//               <div className='flex items-center'>
//                 <Receipt size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bill Payments Settlement</h1>
//                   <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                     Select criteria to view and pay pending & partial bills
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={resetFlow}
//                 className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//               >
//                 Start Over
//               </button>
//             </div>

//             {/* Step-by-step selection */}
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
//               <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
//                 Step {selectionStep}: {selectionStep === 1 && 'Select Period'}
//                 {selectionStep === 2 && 'Select Apartment'}
//                 {selectionStep === 3 && 'Select Floor'}
//                 {selectionStep === 4 && 'Select House'}
//                 {selectionStep === 5 && 'View Bills'}
//               </h2>

//               {/* Progress indicators */}
//               <div className="flex items-center justify-between mb-8">
//                 {[1, 2, 3, 4, 5].map((step) => (
//                   <div key={step} className="flex flex-col items-center">
//                     <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                       selectionStep >= step 
//                         ? 'bg-purple-600 text-white' 
//                         : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
//                     }`}>
//                       {step}
//                     </div>
//                     <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
//                       {step === 1 && 'Period'}
//                       {step === 2 && 'Apartment'}
//                       {step === 3 && 'Floor'}
//                       {step === 4 && 'House'}
//                       {step === 5 && 'Bills'}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               {/* Step 1: Year/Month Selection */}
//               {selectionStep === 1 && (
//                 <div className="space-y-6">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Select Year
//                       </label>
//                       <select
//                         value={filters.year}
//                         onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
//                         className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
//                       >
//                         {years.map(year => (
//                           <option key={year} value={year}>{year}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                         Select Month
//                       </label>
//                       <select
//                         value={filters.month}
//                         onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
//                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
//                       >
//                         <option value="">Select Month</option>
//                         {months.map(month => (
//                           <option key={month} value={month}>{month}</option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="flex justify-end">
//                     <button
//                       onClick={handleYearMonthSelect}
//                       disabled={!filters.year || !filters.month}
//                       className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Next: Select Apartment
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Step 2: Apartment Selection */}
//               {selectionStep === 2 && (
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Select Apartment
//                     </label>
//                     <select
//                       value={filters.apartment_id}
//                       onChange={(e) => handleApartmentSelect(e.target.value)}
//                       disabled={loadingApartments}
//                       className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
//                     >
//                       <option value="">Select Apartment</option>
//                       {apartments.map(apartment => (
//                         <option key={apartment.id} value={apartment.id}>
//                           {apartment.name}
//                         </option>
//                       ))}
//                     </select>
//                     {loadingApartments && (
//                       <p className="text-xs text-gray-500 mt-1">Loading apartments...</p>
//                     )}
//                   </div>

//                   <div className="flex justify-between">
//                     <button
//                       onClick={() => setSelectionStep(1)}
//                       className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                     >
//                       Back
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Step 3: Floor Selection */}
//               {selectionStep === 3 && (
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Select Floor
//                     </label>
//                     <select
//                       value={filters.floor_id}
//                       onChange={(e) => handleFloorSelect(e.target.value)}
//                       disabled={!filters.apartment_id || loadingFloors}
//                       className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
//                     >
//                       <option value="">Select Floor</option>
//                       {floors.map(floor => (
//                         <option key={floor.id} value={floor.id}>
//                           Floor {floor.floor_id}
//                         </option>
//                       ))}
//                     </select>
//                     {loadingFloors && (
//                       <p className="text-xs text-gray-500 mt-1">Loading floors...</p>
//                     )}
//                   </div>

//                   <div className="flex justify-between">
//                     <button
//                       onClick={() => setSelectionStep(2)}
//                       className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                     >
//                       Back
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Step 4: House Selection */}
//               {selectionStep === 4 && (
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                       Select House
//                     </label>
//                     <select
//                       value={filters.house_id}
//                       onChange={(e) => handleHouseSelect(e.target.value)}
//                       disabled={!filters.floor_id || loadingHouses}
//                       className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
//                     >
//                       <option value="">Select House</option>
//                       {houses.map(house => (
//                         <option key={house.id} value={house.id}>
//                           House {house.house_id}
//                         </option>
//                       ))}
//                     </select>
//                     {loadingHouses && (
//                       <p className="text-xs text-gray-500 mt-1">Loading houses...</p>
//                     )}
//                   </div>

//                   <div className="flex justify-between">
//                     <button
//                       onClick={() => setSelectionStep(3)}
//                       className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                     >
//                       Back
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Step 5: Bills Display */}
//               {selectionStep === 5 && selectedHouseInfo && (
//                 <div>
//                   {/* House Information Header */}
//                   <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
//                     <div>
//                       <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
//                         <Home className="mr-2 text-purple-600" size={24} />
//                         Bills for House {selectedHouseInfo.houseNumber}
//                       </h2>
//                       <p className="text-gray-600 dark:text-gray-400">
//                         {selectedHouseInfo.apartmentName} • Floor {selectedHouseInfo.floorNumber} • {filters.month} {filters.year}
//                       </p>
//                     </div>
                    
//                     {/* Status Filter */}
//                     <div className="flex flex-wrap gap-2">
//                       {statusOptions.map((option) => (
//                         <button
//                           key={option.value}
//                           onClick={() => handleStatusFilterChange(option.value)}
//                           className={`px-3 py-1 text-sm rounded-lg border ${
//                             filters.payment_status === option.value
//                               ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
//                               : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
//                           } hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1`}
//                         >
//                           <div className={`w-2 h-2 rounded-full ${option.color}`}></div>
//                           {option.label}
//                         </button>
//                       ))}
//                     </div>
//                   </div>

//                   {/* Amount Summary Cards */}
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                     <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
//                       <div className="flex items-center mb-2">
//                         <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
//                         <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Pending Bills</h3>
//                       </div>
//                       <div className="text-yellow-800 dark:text-yellow-300 font-bold text-2xl">
//                         ${formatCurrency(totalPendingAmount)}
//                       </div>
//                       <div className="text-yellow-600 dark:text-yellow-400 text-sm">
//                         {allBills.filter(b => b.payment_status === 'Pending').length} bills
//                       </div>
//                     </div>
                    
//                     <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
//                       <div className="flex items-center mb-2">
//                         <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
//                         <h3 className="font-medium text-blue-800 dark:text-blue-300">Partial Bills</h3>
//                       </div>
//                       <div className="text-blue-800 dark:text-blue-300 font-bold text-2xl">
//                         ${formatCurrency(totalPartialAmount)}
//                       </div>
//                       <div className="text-blue-600 dark:text-blue-400 text-sm">
//                         {allBills.filter(b => b.payment_status === 'Partial').length} bills
//                       </div>
//                     </div>

//                     {/* <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
//                       <div className="flex items-center mb-2">
//                         <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
//                         <h3 className="font-medium text-purple-800 dark:text-purple-300">Total Amount</h3>
//                       </div>
//                       <div className="text-purple-800 dark:text-purple-300 font-bold text-2xl">
//                         ${formatCurrency(totalAmount)}
//                       </div>
//                       <div className="text-purple-600 dark:text-purple-400 text-sm">
//                         {filteredBills.length} bills selected
//                       </div>
//                     </div> */}
//                   </div>

//                   {loading ? (
//                     <div className="flex justify-center items-center py-12">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
//                       <span className="ml-3 text-gray-600 dark:text-gray-400">Loading bills...</span>
//                     </div>
//                   ) : filteredBills.length === 0 ? (
//                     <div className="text-center py-8">
//                       <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
//                       <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
//                         No Bills Found
//                       </h3>
//                       <p className="text-gray-500 dark:text-gray-400">
//                         No bills found for the selected status filter.
//                       </p>
//                       <button
//                         onClick={() => handleStatusFilterChange('Pending,Partial')}
//                         className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                       >
//                         Show All Bills
//                       </button>
//                     </div>
//                   ) : (
//                     <div>
//                       {/* Payment Buttons */}
//                       <div className="mb-6 flex flex-wrap gap-3 justify-end">
//                         <button
//                           onClick={handlePartialPayment}
//                           disabled={filteredBills.length === 0 || totalAmount <= 0}
//                           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           <DollarSign size={18} />
//                           Pay Partial Amount
//                         </button>
                        
//                         <button
//                           onClick={handleTotalPayment}
//                           disabled={filteredBills.length === 0}
//                           className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           <DollarSign size={18} />
//                           Pay All in Full
//                         </button>
//                       </div>

//                       {/* Bills Table */}
//                       <div className="overflow-x-auto">
//                         <table className="w-full">
//                           <thead className="bg-gray-50 dark:bg-gray-700">
//                             <tr>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                                 Status
//                               </th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                                 Bill Name
//                               </th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                                 Bill Type
//                               </th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                                 Unit Price
//                               </th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                                 Paid Amount
//                               </th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                                 Pending Amount
//                               </th>
//                               <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
//                                 Actions
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                             {filteredBills.map((bill) => (
//                               <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
//                                 <td className="px-4 py-3">
//                                   <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(bill.payment_status)}`}>
//                                     {getStatusIcon(bill.payment_status)}
//                                     {bill.payment_status}
//                                   </span>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   <div className="font-medium text-gray-900 dark:text-white">
//                                     {bill.bill_name}
//                                   </div>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
//                                     {bill.billtype}
//                                   </span>
//                                 </td>
//                                 <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
//                                   ${formatCurrency(bill.unitPrice)}
//                                 </td>
//                                 <td className="px-4 py-3 text-green-600 dark:text-green-400">
//                                   ${formatCurrency(bill.paidAmount)}
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   <span className="font-bold text-red-600 dark:text-red-400">
//                                     ${formatCurrency(bill.pendingAmount)}
//                                   </span>
//                                 </td>
//                                 <td className="px-4 py-3">
//                                   <div className="flex space-x-2">
//                                     <button
//                                       onClick={() => handleUpdatePayment(bill)}
//                                       className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30"
//                                       title="Update Payment"
//                                     >
//                                       <DollarSign size={18} />
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>

//                       <div className="mt-6 flex justify-between">
//                         <button
//                           onClick={() => setSelectionStep(4)}
//                           className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                         >
//                           Back to House Selection
//                         </button>
//                         <button
//                           onClick={resetFlow}
//                           className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                         >
//                           Check Another House
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Individual Payment Modal */}
//       {showUpdateModal && (
//         <UpdateBillPayments
//           payment={selectedPayment}
//           onClose={handleCloseModal}
//           onUpdate={handlePaymentUpdate}
//         />
//       )}

//       {/* Total Payment Modal */}
//       {showTotalPaymentModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
//             <div className="p-6">
//               <div className="flex items-center mb-4">
//                 <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
//                   <DollarSign className="text-green-600 dark:text-green-400" size={24} />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                   Pay All Bills in Full
//                 </h3>
//               </div>

//               <p className="text-gray-600 dark:text-gray-300 mb-6">
//                 You are about to fully pay all {filteredBills.length} selected bills for House {selectedHouseInfo?.houseNumber}.
//               </p>

//               <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
//                 <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
//                   Payment Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Total Bills:</span>
//                     <span className="font-medium text-gray-600 dark:text-gray-400">{filteredBills.length} bills</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Pending Amount:</span>
//                     <span className="font-medium text-yellow-600 dark:text-yellow-400">${formatCurrency(totalPendingAmount)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Partial Amount:</span>
//                     <span className="font-medium text-blue-600 dark:text-blue-400">${formatCurrency(totalPartialAmount)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">House:</span>
//                     <span className="font-medium text-gray-600 dark:text-gray-400">
//                       {selectedHouseInfo?.apartmentName} - House {selectedHouseInfo?.houseNumber}
//                     </span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Period:</span>
//                     <span className="font-medium text-gray-600 dark:text-gray-400">{filters.month} {filters.year}</span>
//                   </div>
//                   <div className="flex justify-between border-t pt-2">
//                     <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
//                     <span className="font-bold text-green-600 dark:text-green-400 text-lg">
//                       ${formatCurrency(totalAmount)}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex justify-end space-x-3">
//                 <button
//                   onClick={() => setShowTotalPaymentModal(false)}
//                   disabled={loading}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleTotalPaymentSubmit}
//                   disabled={loading}
//                   className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                       Processing...
//                     </>
//                   ) : (
//                     `Pay $${formatCurrency(totalAmount)}`
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Partial Payment Modal */}
//       {showPartialPaymentModal && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
//             <div className="p-6">
//               <div className="flex items-center mb-4">
//                 <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
//                   <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                   Pay Partial Amount
//                 </h3>
//               </div>

//               <p className="text-gray-600 dark:text-gray-300 mb-6">
//                 Enter the amount you want to pay across all {filteredBills.length} bills for House {selectedHouseInfo?.houseNumber}.
//                 The amount will be distributed proportionally among all bills.
//               </p>

//               <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
//                 <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
//                   Bill Summary
//                 </h4>
//                 <div className="space-y-2 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Total Bills:</span>
//                     <span className="font-medium text-gray-600 dark:text-gray-400">{filteredBills.length} bills</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">Total Amount Due:</span>
//                     <span className="font-bold text-blue-600 dark:text-blue-400">${formatCurrency(totalAmount)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-600 dark:text-gray-400">House:</span>
//                     <span className="font-medium text-gray-600 dark:text-gray-400">
//                       {selectedHouseInfo?.apartmentName} - House {selectedHouseInfo?.houseNumber}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <form onSubmit={(e) => {
//                 e.preventDefault();
//                 handlePartialPaymentSubmit();
//               }} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Payment Amount ($)
//                   </label>
//                   <div className="relative">
//                     <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                     <input
//                       type="number"
//                       step="0.01"
//                       min="0.01"
//                       max={totalAmount}
//                       value={partialPaymentAmount}
//                       onChange={(e) => setPartialPaymentAmount(e.target.value)}
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
//                       required
//                     />
//                   </div>
//                   <div className="flex justify-between text-xs mt-1">
//                     <p className="text-gray-500 dark:text-gray-400">
//                       Maximum: ${formatCurrency(totalAmount)}
//                     </p>
//                     <p className="text-blue-600 dark:text-blue-400">
//                       Remaining: ${formatCurrency(totalAmount - parseFloat(partialPaymentAmount || 0))}
//                     </p>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Payment Date
//                   </label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                     <input
//                       type="date"
//                       value={partialPaymentDate}
//                       onChange={(e) => setPartialPaymentDate(e.target.value)}
//                       className="w-full pl-10 pr-4 py-3 border text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Payment Preview */}
//                 <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
//                   <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-2">Payment Preview</h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">Amount to Pay:</span>
//                       <span className="font-bold text-blue-600 dark:text-blue-400">${formatCurrency(partialPaymentAmount)}</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-gray-600 dark:text-gray-400">Remaining After Payment:</span>
//                       <span className="font-bold text-orange-600 dark:text-orange-400">
//                         ${formatCurrency(totalAmount - parseFloat(partialPaymentAmount || 0))}
//                       </span>
//                     </div>
//                     {parseFloat(partialPaymentAmount || 0) > 0 && (
//                       <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
//                         Amount will be distributed proportionally across {filteredBills.length} bills
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex justify-end space-x-3 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => setShowPartialPaymentModal(false)}
//                     disabled={loading}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading || !partialPaymentAmount || parseFloat(partialPaymentAmount) <= 0}
//                     className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
//                   >
//                     {loading ? (
//                       <>
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                         Processing...
//                       </>
//                     ) : (
//                       `Pay $${formatCurrency(partialPaymentAmount)}`
//                     )}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}

//       <ToastContainer position="top-center" autoClose={3000} />
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, DollarSign, Calendar, Home, Building, Receipt, Trash2, CheckCircle, Clock, RefreshCw, PlusCircle, X } from 'lucide-react';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import UpdateBillPayments from './UpdateBillPayments';

export default function BillPaymentSettle() {
  const [allBills, setAllBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [totalPartialAmount, setTotalPartialAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Single page filter state
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: '', // Optional - can be empty
    apartment_id: '',
    floor_id: '',
    house_id: '',
    payment_status: 'Pending,Partial'
  });
  
  const [apartments, setApartments] = useState([]);
  const [floors, setFloors] = useState([]);
  const [houses, setHouses] = useState([]);
  const [selectedHouseInfo, setSelectedHouseInfo] = useState(null);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingHouses, setLoadingHouses] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showTotalPaymentModal, setShowTotalPaymentModal] = useState(false);
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState(0);
  const [partialPaymentDate, setPartialPaymentDate] = useState('');

  const months = [
    '', // Empty option for "All Months" or "Not Selected"
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString());

  // Status filter options
  const statusOptions = [
    { value: 'Pending', label: 'Pending Only', color: 'bg-yellow-500' },
    { value: 'Partial', label: 'Partial Only', color: 'bg-blue-500' },
    { value: 'Pending,Partial', label: 'Both Pending & Partial', color: 'bg-gradient-to-r from-yellow-500 to-blue-500' }
  ];

  // Load all apartments on component mount
  useEffect(() => {
    loadAllApartments();
  }, []);

  // Load apartments
  const loadAllApartments = async () => {
    try {
      setLoadingApartments(true);
      const response = await api.get('/apartments');
      if (response.data.success) {
        setApartments(response.data.data || []);
      } else {
        setApartments([]);
      }
    } catch (error) {
      console.error('Error loading apartments:', error);
      toast.error('Failed to load apartments');
      setApartments([]);
    } finally {
      setLoadingApartments(false);
    }
  };

  // Load floors when apartment is selected
  useEffect(() => {
    if (filters.apartment_id) {
      loadFloorsByApartment(filters.apartment_id);
    } else {
      setFloors([]);
      setHouses([]);
      setFilters(prev => ({ ...prev, floor_id: '', house_id: '' }));
    }
  }, [filters.apartment_id]);

  // Load houses when floor is selected
  useEffect(() => {
    if (filters.floor_id && filters.apartment_id) {
      loadHousesByFloor(filters.floor_id);
    } else {
      setHouses([]);
      setFilters(prev => ({ ...prev, house_id: '' }));
    }
  }, [filters.floor_id, filters.apartment_id]);

  // Load floors based on selected apartment
  const loadFloorsByApartment = async (apartmentId) => {
    try {
      setLoadingFloors(true);
      const response = await api.get(`/floors?apartment_id=${apartmentId}`);
      if (response.data.success) {
        setFloors(response.data.data || []);
      } else {
        setFloors([]);
      }
    } catch (error) {
      console.error('Error loading floors:', error);
      toast.error('Failed to load floors');
      setFloors([]);
    } finally {
      setLoadingFloors(false);
    }
  };

  // Load houses based on selected floor
  const loadHousesByFloor = async (floorId) => {
    try {
      setLoadingHouses(true);
      const response = await api.get(
        `/houses?floor_id=${floorId}&apartment_id=${filters.apartment_id}`
      );

      if (response.data.success) {
        setHouses(response.data.data || []);
      } else {
        setHouses([]);
      }
    } catch (error) {
      console.error("Error loading houses:", error);
      toast.error("Failed to load houses");
      setHouses([]);
    } finally {
      setLoadingHouses(false);
    }
  };

  // Load bills when house is selected (can be triggered manually or automatically)
  useEffect(() => {
    if (filters.house_id) {
      // Small delay to ensure all filters are set
      const timer = setTimeout(() => {
        loadBillsForHouse(filters.house_id);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [filters.house_id, filters.year, filters.month, filters.payment_status]);

  // Load bills for selected house based on status filter
  const loadBillsForHouse = async (houseId) => {
    if (!houseId || !filters.apartment_id || !filters.floor_id || !filters.year) {
      return;
    }

    try {
      setLoading(true);
      
      // Get the selected house information
      const selectedHouse = houses.find(h => h.id === houseId);
      const apartment = apartments.find(a => a.id === filters.apartment_id);
      const floor = floors.find(f => f.id === filters.floor_id);
      
      if (selectedHouse && apartment && floor) {
        setSelectedHouseInfo({
          houseNumber: selectedHouse.house_id,
          apartmentName: apartment.name,
          floorNumber: floor.floor_id,
          houseId: selectedHouse.id
        });
      }

      // API call to get bills for this house, month, and year
      // Split multiple statuses if provided
      const statusArray = filters.payment_status.split(',');
      
      let billsData = [];
      
      // Fetch bills for each status
      for (const status of statusArray) {
        const params = new URLSearchParams({
          house_id: houseId,
          apartment_id: filters.apartment_id,
          floor_id: filters.floor_id,
          year: filters.year,
          payment_status: status.trim()
        });

        // Only add month if it's selected
        if (filters.month) {
          params.append('month', filters.month);
        }

        const response = await api.get(`/bill-payments?${params}`);
        
        if (response.data.success) {
          billsData = [...billsData, ...(response.data.data || [])];
        }
      }
      
      setAllBills(billsData);
      updateFilteredBills(billsData);
      
      // Calculate total amounts
      const pendingTotal = billsData
        .filter(bill => bill.payment_status === 'Pending')
        .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
      
      const partialTotal = billsData
        .filter(bill => bill.payment_status === 'Partial')
        .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
      
      setTotalPendingAmount(pendingTotal);
      setTotalPartialAmount(partialTotal);
      
      // Reset partial payment amount
      setPartialPaymentAmount(0);
      setPartialPaymentDate('');
      
      const pendingCount = billsData.filter(b => b.payment_status === 'Pending').length;
      const partialCount = billsData.filter(b => b.payment_status === 'Partial').length;
      
      if (billsData.length > 0) {
        let message = `Found ${pendingCount} pending and ${partialCount} partial bills for House ${selectedHouse?.house_id}`;
        if (filters.month) {
          message += ` (${filters.month} ${filters.year})`;
        } else {
          message += ` (Year: ${filters.year})`;
        }
        toast.success(message);
      } else {
        toast.info('No bills found for the selected criteria');
      }
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.error('Failed to load bills');
      setAllBills([]);
      setFilteredBills([]);
      setTotalPendingAmount(0);
      setTotalPartialAmount(0);
    } finally {
      setLoading(false);
    }
  };

  // Update filtered bills based on status filter
  const updateFilteredBills = (bills = allBills) => {
    const statusArray = filters.payment_status.split(',');
    const filtered = bills.filter(bill => 
      statusArray.includes(bill.payment_status)
    );
    setFilteredBills(filtered);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setFilters(prev => ({
      ...prev,
      payment_status: status
    }));
    
    // Update filtered bills
    updateFilteredBills();
    
    // Recalculate totals based on filtered statuses
    const statusArray = status.split(',');
    const billsToCalculate = allBills.filter(bill => 
      statusArray.includes(bill.payment_status)
    );
    
    const pendingTotal = billsToCalculate
      .filter(bill => bill.payment_status === 'Pending')
      .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
    const partialTotal = billsToCalculate
      .filter(bill => bill.payment_status === 'Partial')
      .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
    setTotalPendingAmount(pendingTotal);
    setTotalPartialAmount(partialTotal);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      
      // Reset dependent fields when parent changes
      if (field === 'apartment_id') {
        newFilters.floor_id = '';
        newFilters.house_id = '';
      } else if (field === 'floor_id') {
        newFilters.house_id = '';
      }
      
      return newFilters;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      year: new Date().getFullYear().toString(),
      month: '',
      apartment_id: '',
      floor_id: '',
      house_id: '',
      payment_status: 'Pending,Partial'
    });
    setApartments([]);
    setFloors([]);
    setHouses([]);
    setAllBills([]);
    setFilteredBills([]);
    setTotalPendingAmount(0);
    setTotalPartialAmount(0);
    setSelectedHouseInfo(null);
    setPartialPaymentAmount(0);
    setPartialPaymentDate('');
    
    // Reload apartments
    loadAllApartments();
  };

  // Handle individual bill payment
  const handleUpdatePayment = (payment) => {
    setSelectedPayment(payment);
    setShowUpdateModal(true);
  };

  // Handle total amount payment
  const handleTotalPayment = () => {
    setShowTotalPaymentModal(true);
  };

  // Handle partial payment for all bills
  const handlePartialPayment = () => {
    // Set default partial payment amount to 50% of total
    const defaultAmount = ((totalPendingAmount + totalPartialAmount) * 0.5).toFixed(2);
    setPartialPaymentAmount(defaultAmount);
    setPartialPaymentDate(new Date().toISOString().split('T')[0]);
    setShowPartialPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setShowTotalPaymentModal(false);
    setShowPartialPaymentModal(false);
    setSelectedPayment(null);
  };

  // Handle payment update from modal
  const handlePaymentUpdate = (updatedPayment) => {
    // Update the bills list
    const updatedBills = allBills.map(bill => 
      bill.id === updatedPayment.id ? updatedPayment : bill
    );
    
    setAllBills(updatedBills);
    updateFilteredBills(updatedBills);
    
    // Recalculate totals
    const pendingTotal = updatedBills
      .filter(bill => bill.payment_status === 'Pending')
      .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
    const partialTotal = updatedBills
      .filter(bill => bill.payment_status === 'Partial')
      .reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0);
    
    setTotalPendingAmount(pendingTotal);
    setTotalPartialAmount(partialTotal);
    
    handleCloseModal();
    
    if (updatedPayment.payment_status === 'Paid') {
      toast.success('Payment completed successfully!');
    }
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  // Handle total payment for all filtered bills
  const handleTotalPaymentSubmit = async () => {
    try {
      setLoading(true);
      
      // Mark all filtered bills as paid
      const paymentPromises = filteredBills.map(bill =>
        api.patch(`/bill-payments/${bill.id}/status`, {
          payment_status: 'Paid',
          paidAmount: parseFloat(bill.paidAmount) + parseFloat(bill.pendingAmount),
          pendingAmount: 0,
          paid_at: new Date().toISOString()
        })
      );

      await Promise.all(paymentPromises);
      
      const totalAmount = totalPendingAmount + totalPartialAmount;
      toast.success(`Successfully paid ${filteredBills.length} bills totaling $${totalAmount.toFixed(2)}`);
      
      // Clear the bills and reload
      await loadBillsForHouse(filters.house_id);
      
      setShowTotalPaymentModal(false);
      
    } catch (error) {
      console.error('Error processing total payment:', error);
      toast.error('Failed to process total payment');
    } finally {
      setLoading(false);
    }
  };

  // Handle partial payment for all filtered bills
  const handlePartialPaymentSubmit = async () => {
    try {
      setLoading(true);
      
      const totalAmount = totalPendingAmount + totalPartialAmount;
      const paymentAmount = parseFloat(partialPaymentAmount);
      
      if (paymentAmount <= 0) {
        toast.error('Payment amount must be greater than 0');
        return;
      }
      
      if (paymentAmount > totalAmount) {
        toast.error(`Payment amount cannot exceed total amount of $${formatCurrency(totalAmount)}`);
        return;
      }
      
      // Distribute the partial payment across all bills proportionally
      const billsWithDistribution = filteredBills.map(bill => {
        const billPendingAmount = parseFloat(bill.pendingAmount) || 0;
        const billProportion = billPendingAmount / totalAmount;
        const billPayment = paymentAmount * billProportion;
        
        return {
          ...bill,
          additionalPayment: billPayment
        };
      });
      
      // Update each bill with its share of the partial payment
      const paymentPromises = billsWithDistribution.map(bill => {
        const newPaidAmount = parseFloat(bill.paidAmount) + bill.additionalPayment;
        const newPendingAmount = parseFloat(bill.pendingAmount) - bill.additionalPayment;
        
        let newStatus = 'Partial';
        if (newPendingAmount <= 0.01) {
          newStatus = 'Paid';
        } else if (newPaidAmount > 0) {
          newStatus = 'Partial';
        }
        
        return api.patch(`/bill-payments/${bill.id}/status`, {
          payment_status: newStatus,
          paidAmount: newPaidAmount,
          paid_at: partialPaymentDate || new Date().toISOString().split('T')[0]
        });
      });

      await Promise.all(paymentPromises);
      
      toast.success(`Successfully paid $${formatCurrency(paymentAmount)} across ${filteredBills.length} bills`);
      
      // Reload bills to get updated amounts
      await loadBillsForHouse(filters.house_id);
      
      setShowPartialPaymentModal(false);
      
    } catch (error) {
      console.error('Error processing partial payment:', error);
      toast.error('Failed to process partial payment');
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'Partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'Refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid': return <CheckCircle size={16} className="text-green-600" />;
      case 'Partial': return <Clock size={16} className="text-blue-600" />;
      case 'Pending': return <Clock size={16} className="text-yellow-600" />;
      default: return null;
    }
  };

  // Calculate total amount for all filtered bills
  const totalAmount = totalPendingAmount + totalPartialAmount;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar/>
        <div className='flex-1 overflow-y-auto p-6'>
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6'>
              <div className='flex items-center'>
                <Receipt size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bill Payments Settlement</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Filter and pay pending & partial bills
                  </p>
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>

            {/* Filter Section - All filters in one place */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Filter Bills
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Year Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    min="2000"
                    max="2100"
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter year"
                    required
                  />
                </div>

                {/* Month Selection (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month (Optional)
                  </label>
                  <select
                    value={filters.month}
                    onChange={(e) => handleInputChange('month', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Months / Last Due</option>
                    {months.slice(1).map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to see all bills for the year
                  </p>
                </div>

                {/* Apartment Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Apartment *
                  </label>
                  <select
                    value={filters.apartment_id}
                    onChange={(e) => handleInputChange('apartment_id', e.target.value)}
                    disabled={loadingApartments}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select Apartment</option>
                    {apartments.map(apartment => (
                      <option key={apartment.id} value={apartment.id}>
                        {apartment.name}
                      </option>
                    ))}
                  </select>
                  {loadingApartments && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading apartments...</p>
                  )}
                </div>

                {/* Floor Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Floor *
                  </label>
                  <select
                    value={filters.floor_id}
                    onChange={(e) => handleInputChange('floor_id', e.target.value)}
                    disabled={!filters.apartment_id || loadingFloors}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select Floor</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>
                        Floor {floor.floor_id}
                      </option>
                    ))}
                  </select>
                  {loadingFloors && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading floors...</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* House Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    House *
                  </label>
                  <select
                    value={filters.house_id}
                    onChange={(e) => handleInputChange('house_id', e.target.value)}
                    disabled={!filters.floor_id || loadingHouses}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="">Select House</option>
                    {houses.map(house => (
                      <option key={house.id} value={house.id}>
                        House {house.house_id}
                      </option>
                    ))}
                  </select>
                  {loadingHouses && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Loading houses...</p>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bill Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleStatusFilterChange(option.value)}
                        className={`px-3 py-1 text-sm rounded-lg border ${
                          filters.payment_status === option.value
                            ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        } hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-1`}
                      >
                        <div className={`w-2 h-2 rounded-full ${option.color}`}></div>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Manual Load Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => filters.house_id && loadBillsForHouse(filters.house_id)}
                  disabled={!filters.house_id || !filters.year || !filters.apartment_id || !filters.floor_id}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Load Bills
                </button>
              </div>
            </div>

            {/* Bills Display Section */}
            {selectedHouseInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
                {/* House Information Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                      <Home className="mr-2 text-purple-600" size={24} />
                      Bills for House {selectedHouseInfo.houseNumber}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedHouseInfo.apartmentName} • Floor {selectedHouseInfo.floorNumber}
                      {filters.month ? ` • ${filters.month} ${filters.year}` : ` • Year: ${filters.year}`}
                    </p>
                  </div>
                  
                  {/* Status Filter Reminder */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing: {filters.payment_status === 'Pending,Partial' ? 'Pending & Partial Bills' : 
                             filters.payment_status === 'Pending' ? 'Pending Bills Only' : 
                             'Partial Bills Only'}
                  </div>
                </div>

                {/* Amount Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-300">Pending Bills</h3>
                    </div>
                    <div className="text-yellow-800 dark:text-yellow-300 font-bold text-2xl">
                      ${formatCurrency(totalPendingAmount)}
                    </div>
                    <div className="text-yellow-600 dark:text-yellow-400 text-sm">
                      {allBills.filter(b => b.payment_status === 'Pending').length} bills
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">Partial Bills</h3>
                    </div>
                    <div className="text-blue-800 dark:text-blue-300 font-bold text-2xl">
                      ${formatCurrency(totalPartialAmount)}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400 text-sm">
                      {allBills.filter(b => b.payment_status === 'Partial').length} bills
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading bills...</span>
                  </div>
                ) : filteredBills.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Bills Found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No bills found for the selected criteria.
                    </p>
                    <button
                      onClick={() => handleStatusFilterChange('Pending,Partial')}
                      className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Show All Bills
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Payment Buttons */}
                    <div className="mb-6 flex flex-wrap gap-3 justify-end">
                      <button
                        onClick={handlePartialPayment}
                        disabled={filteredBills.length === 0 || totalAmount <= 0}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <DollarSign size={18} />
                        Pay Partial Amount
                      </button>
                      
                      <button
                        onClick={handleTotalPayment}
                        disabled={filteredBills.length === 0}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <DollarSign size={18} />
                        Pay All in Full
                      </button>
                    </div>

                    {/* Bills Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Bill Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Bill Type
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Month/Year
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Paid Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Pending Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredBills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(bill.payment_status)}`}>
                                  {getStatusIcon(bill.payment_status)}
                                  {bill.payment_status}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {bill.bill_name}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                  {bill.billtype}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                {bill.month} {bill.year}
                              </td>
                              <td className="px-4 py-3 text-green-600 dark:text-green-400">
                                ${formatCurrency(bill.paidAmount)}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-bold text-red-600 dark:text-red-400">
                                  ${formatCurrency(bill.pendingAmount)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleUpdatePayment(bill)}
                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30"
                                    title="Update Payment"
                                  >
                                    <DollarSign size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Individual Payment Modal */}
      {showUpdateModal && (
        <UpdateBillPayments
          payment={selectedPayment}
          onClose={handleCloseModal}
          onUpdate={handlePaymentUpdate}
        />
      )}

      {/* Total Payment Modal */}
      {showTotalPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
                  <DollarSign className="text-green-600 dark:text-green-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pay All Bills in Full
                </h3>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You are about to fully pay all {filteredBills.length} selected bills for House {selectedHouseInfo?.houseNumber}.
              </p>

              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                  Payment Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Bills:</span>
                    <span className="font-medium text-gray-600 dark:text-gray-400">{filteredBills.length} bills</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pending Amount:</span>
                    <span className="font-medium text-yellow-600 dark:text-yellow-400">${formatCurrency(totalPendingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Partial Amount:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">${formatCurrency(totalPartialAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">House:</span>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {selectedHouseInfo?.apartmentName} - House {selectedHouseInfo?.houseNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Period:</span>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {filters.month ? `${filters.month} ${filters.year}` : `Year: ${filters.year}`}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                      ${formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowTotalPaymentModal(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTotalPaymentSubmit}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    `Pay $${formatCurrency(totalAmount)}`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partial Payment Modal */}
      {showPartialPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                  <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Pay Partial Amount
                </h3>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Enter the amount you want to pay across all {filteredBills.length} bills for House {selectedHouseInfo?.houseNumber}.
                The amount will be distributed proportionally among all bills.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Bill Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Bills:</span>
                    <span className="font-medium text-gray-600 dark:text-gray-400">{filteredBills.length} bills</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Amount Due:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">${formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">House:</span>
                    <span className="font-medium text-gray-600 dark:text-gray-400">
                      {selectedHouseInfo?.apartmentName} - House {selectedHouseInfo?.houseNumber}
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                handlePartialPaymentSubmit();
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Amount ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={totalAmount}
                      value={partialPaymentAmount}
                      onChange={(e) => setPartialPaymentAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      required
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <p className="text-gray-500 dark:text-gray-400">
                      Maximum: ${formatCurrency(totalAmount)}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400">
                      Remaining: ${formatCurrency(totalAmount - parseFloat(partialPaymentAmount || 0))}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="date"
                      value={partialPaymentDate}
                      onChange={(e) => setPartialPaymentDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                      required
                    />
                  </div>
                </div>

                {/* Payment Preview */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-300 mb-2">Payment Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Amount to Pay:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">${formatCurrency(partialPaymentAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Remaining After Payment:</span>
                      <span className="font-bold text-orange-600 dark:text-orange-400">
                        ${formatCurrency(totalAmount - parseFloat(partialPaymentAmount || 0))}
                      </span>
                    </div>
                    {parseFloat(partialPaymentAmount || 0) > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
                        Amount will be distributed proportionally across {filteredBills.length} bills
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPartialPaymentModal(false)}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !partialPaymentAmount || parseFloat(partialPaymentAmount) <= 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      `Pay $${formatCurrency(partialPaymentAmount)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}