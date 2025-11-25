// import React, { useState, useEffect } from 'react';
// import { Loader, ChevronDown, ChevronUp, DollarSign, Receipt } from 'lucide-react';
// import api from '../api/axios';
// import { toast, ToastContainer } from 'react-toastify';
// import Sidebar from '../components/Sidebar';
// import Navbar from '../components/Navbar';

// export default function BillPayments() {
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [apartments, setApartments] = useState([]);
//   const [floors, setFloors] = useState({});
//   const [houses, setHouses] = useState({});
//   const [expandedApartments, setExpandedApartments] = useState({});
//   const [expandedFloors, setExpandedFloors] = useState({});
//   const [loadingApartments, setLoadingApartments] = useState(false);
//   const [loadingFloors, setLoadingFloors] = useState({});
//   const [loadingHouses, setLoadingHouses] = useState({});
//   const [loadingBills, setLoadingBills] = useState(false);
//   const [bills, setBills] = useState([]);

//   // Load apartments
//   const loadApartments = async () => {
//     try {
//       setLoadingApartments(true);
//       const result = await api.get('/apartments');
//       if (result.data.success) {
//         setApartments(result.data.data || []);
//       }
//     } catch (err) {
//       console.error('Error loading apartments:', err);
//       toast.error('Failed to load apartments');
//     } finally {
//       setLoadingApartments(false);
//     }
//   };

//   // Load floors for a specific apartment
//   const loadFloorsForApartment = async (apartmentId) => {
//     if (!apartmentId) return;
    
//     try {
//       setLoadingFloors(prev => ({ ...prev, [apartmentId]: true }));
//       const result = await api.get(`/floors?apartment_id=${apartmentId}`);
//       if (result.data.success) {
//         const floorsData = result.data.data || [];
//         setFloors(prev => ({
//           ...prev,
//           [apartmentId]: floorsData
//         }));
//       }
//     } catch (err) {
//       console.error('Error loading floors:', err);
//       toast.error('Failed to load floors');
//     } finally {
//       setLoadingFloors(prev => ({ ...prev, [apartmentId]: false }));
//     }
//   };

//   // Load houses for a specific floor
//   const loadHousesForFloor = async (apartmentId, floorId) => {
//     if (!apartmentId || !floorId) return;
    
//     try {
//       setLoadingHouses(prev => ({ ...prev, [floorId]: true }));
//       const result = await api.get(`/houses?apartment_id=${apartmentId}&floor_id=${floorId}`);
//       if (result.data.success) {
//         const housesData = result.data.data || [];
//         setHouses(prev => ({
//           ...prev,
//           [floorId]: housesData
//         }));
//       }
//     } catch (err) {
//       console.error('Error loading houses:', err);
//       toast.error('Failed to load houses');
//     } finally {
//       setLoadingHouses(prev => ({ ...prev, [floorId]: false }));
//     }
//   };

//   // Toggle apartment expansion
//   const toggleApartment = async (apartment) => {
//     const isExpanded = expandedApartments[apartment.id];
    
//     // Load floors if not already loaded
//     if (!isExpanded && !floors[apartment.id]) {
//       await loadFloorsForApartment(apartment.id);
//     }
    
//     setExpandedApartments(prev => ({
//       ...prev,
//       [apartment.id]: !isExpanded
//     }));
//   };

//   // Toggle floor expansion
//   const toggleFloor = async (apartmentId, floor) => {
//     const floorKey = `${apartmentId}-${floor.id}`;
//     const isExpanded = expandedFloors[floorKey];
    
//     // Load houses if not already loaded
//     if (!isExpanded && !houses[floor.id]) {
//       await loadHousesForFloor(apartmentId, floor.id);
//     }
    
//     setExpandedFloors(prev => ({
//       ...prev,
//       [floorKey]: !isExpanded
//     }));
//   };

//   // Load apartments on component mount
//   useEffect(() => {
//     loadApartments();
//   }, []);

//   const loadBills = async () => {
//         try {
//             setLoadingBills(true);
//             setError(null);
//             const result = await api.get('/bills');
//             if (result.data.success && Array.isArray(result.data.data)) {
//                 setBills(result.data.data);
//             } else {
//                 setBills([]);
//             }
//         } catch (err) {
//             console.error('Error loading bills:', err);
//             setError('Failed to load bills. Please try again.');
//         } finally {
//             setLoadingBills(false);
//         }
//     };

//     useEffect(() => {
//         loadBills();
//     }, []);



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
//                 <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bill Payments</h1>
//               </div>
//             </div>

//             {/* Hierarchical Apartments -> Floors -> Houses View */}
//             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
//               <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
//                 Select Apartment, Floor and House
//               </h2>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">
//                 Click on apartments to view floors, then click on floors to view houses.
//               </p>

//               {/* Apartments List */}
//               <div className="space-y-3">
//                 {loadingApartments ? (
//                   <div className="flex items-center justify-center p-8">
//                     <Loader size={24} className="animate-spin mr-3 text-purple-600" />
//                     <span className="text-gray-600 dark:text-gray-400">Loading apartments...</span>
//                   </div>
//                 ) : apartments.length === 0 ? (
//                   <div className="text-center py-8 text-gray-500 dark:text-gray-400">
//                     No apartments found.
//                   </div>
//                 ) : (
//                   apartments.map(apartment => (
//                     <div key={apartment.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      
//                       {/* Apartment Header */}
//                       <div 
//                         className="flex items-center justify-between p-4 cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
//                         onClick={() => toggleApartment(apartment)}
//                       >
//                         <div className="flex items-center">
//                           <span className="font-medium text-gray-800 dark:text-white">
//                             {apartment.name}
//                           </span>
//                           {apartment.location && (
//                             <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
//                               ({apartment.location})
//                             </span>
//                           )}
//                         </div>
//                         <div className="flex items-center">
//                           {loadingFloors[apartment.id] && (
//                             <Loader size={16} className="animate-spin mr-2 text-purple-600" />
//                           )}
//                           <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors">
//                             {expandedApartments[apartment.id] ? (
//                               <ChevronUp size={20} className="text-purple-600" />
//                             ) : (
//                               <ChevronDown size={20} className="text-purple-600" />
//                             )}
//                           </button>
//                         </div>
//                       </div>

//                       {/* Floors List - Shown when apartment is expanded */}
//                       {expandedApartments[apartment.id] && (
//                         <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
//                           {loadingFloors[apartment.id] ? (
//                             <div className="flex items-center justify-center p-4">
//                               <Loader size={16} className="animate-spin mr-2 text-purple-600" />
//                               <span className="text-sm text-gray-600 dark:text-gray-400">Loading floors...</span>
//                             </div>
//                           ) : (
//                             <div className="space-y-2 p-3">
//                               {(floors[apartment.id] || []).length === 0 ? (
//                                 <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
//                                   No floors found for this apartment.
//                                 </div>
//                               ) : (
//                                 (floors[apartment.id] || []).map(floor => (
//                                   <div key={floor.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                    
//                                     {/* Floor Header */}
//                                     <div 
//                                       className="flex items-center justify-between p-3 cursor-pointer bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
//                                       onClick={() => toggleFloor(apartment.id, floor)}
//                                     >
//                                       <span className="font-medium text-gray-800 dark:text-white">
//                                         Floor: {floor.floor_id}
//                                       </span>
//                                       <div className="flex items-center">
//                                         {loadingHouses[floor.id] && (
//                                           <Loader size={14} className="animate-spin mr-2 text-purple-600" />
//                                         )}
//                                         <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-400 rounded transition-colors">
//                                           {expandedFloors[`${apartment.id}-${floor.id}`] ? (
//                                             <ChevronUp size={18} className="text-purple-600" />
//                                           ) : (
//                                             <ChevronDown size={18} className="text-purple-600" />
//                                           )}
//                                         </button>
//                                       </div>
//                                     </div>

//                                     {/* Houses List - Shown when floor is expanded */}
//                                     {expandedFloors[`${apartment.id}-${floor.id}`] && (
//                                       <div className="bg-white dark:bg-gray-500 border-t border-gray-200 dark:border-gray-400">
//                                         {loadingHouses[floor.id] ? (
//                                           <div className="flex items-center justify-center p-3">
//                                             <Loader size={14} className="animate-spin mr-2 text-purple-600" />
//                                             <span className="text-xs text-gray-600 dark:text-gray-400">Loading houses...</span>
//                                           </div>
//                                         ) : (
//                                           <div className="p-4">
//                                             {(houses[floor.id] || []).length === 0 ? (
//                                               <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
//                                                 No houses found on this floor.
//                                               </div>
//                                             ) : (
//                                               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
//                                                 {(houses[floor.id] || []).map(house => (
//                                                   <div 
//                                                     key={house.id} 
//                                                     className="p-3 bg-gray-50 dark:bg-gray-400 rounded-lg border border-gray-200 dark:border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors"
//                                                   >
//                                                     <div className="text-sm font-medium text-gray-800 dark:text-gray-900">
//                                                       {house.house_id}
//                                                     </div>
//                                                     <div className="text-xs text-gray-600 dark:text-gray-700 mt-1 capitalize">
//                                                       Status: {house.status || 'N/A'}
//                                                     </div>
//                                                     {house.tenant_name && (
//                                                       <div className="text-xs text-gray-600 dark:text-gray-700 mt-1">
//                                                         Tenant: {house.tenant_name}
//                                                       </div>
//                                                     )}
//                                                   </div>
//                                                 ))}
//                                               </div>
//                                             )}
//                                           </div>
//                                         )}
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>

//               {/* Summary Information */}
//               {/* <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
//                   <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//                     <div className="font-semibold text-blue-700 dark:text-blue-300">
//                       {apartments.length}
//                     </div>
//                     <div className="text-blue-600 dark:text-blue-400">
//                       Apartments
//                     </div>
//                   </div>
//                   <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
//                     <div className="font-semibold text-green-700 dark:text-green-300">
//                       {Object.values(floors).flat().length}
//                     </div>
//                     <div className="text-green-600 dark:text-green-400">
//                       Total Floors
//                     </div>
//                   </div>
//                   <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
//                     <div className="font-semibold text-purple-700 dark:text-purple-300">
//                       {Object.values(houses).flat().length}
//                     </div>
//                     <div className="text-purple-600 dark:text-purple-400">
//                       Total Houses
//                     </div>
//                   </div>
//                 </div>
//               </div> */}
//             </div>
//           </div>
//         </div>
//       </div>
//       <ToastContainer position="top-center" autoClose={3000} />
//     </div>
//   );
// }


// components/BillPayments.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, DollarSign, Calendar, Home, Building } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const BillPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState({});
    const [filters, setFilters] = useState({
        payment_status: '',
        apartment_id: '',
        bill_id: '',
        month: '',
        year: new Date().getFullYear()
    });
    const [apartments, setApartments] = useState([]);
    const [bills, setBills] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const loadPayments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await api.get(`/bill-payments?${params}`);
            if (response.data.success) {
                setPayments(response.data.data);
            }
        } catch (error) {
            console.error('Error loading payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const loadSummary = async () => {
        try {
            const response = await api.get('/bill-payments/summary');
            if (response.data.success) {
                const summaryData = {};
                response.data.data.forEach(item => {
                    summaryData[item.payment_status] = item;
                });
                setSummary(summaryData);
            }
        } catch (error) {
            console.error('Error loading summary:', error);
        }
    };

    const loadApartments = async () => {
        try {
            const response = await api.get('/apartments');
            if (response.data.success) {
                setApartments(response.data.data || []);
            }
        } catch (error) {
            console.error('Error loading apartments:', error);
        }
    };

    const loadBills = async () => {
        try {
            const response = await api.get('/bills');
            if (response.data.success) {
                setBills(response.data.data || []);
            }
        } catch (error) {
            console.error('Error loading bills:', error);
        }
    };

    useEffect(() => {
        loadPayments();
        loadSummary();
        loadApartments();
        loadBills();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleStatusUpdate = async (paymentId, newStatus) => {
        try {
            const response = await api.patch(`/bill-payments/${paymentId}/status`, {
                payment_status: newStatus
            });
            
            if (response.data.success) {
                toast.success('Payment status updated successfully');
                loadPayments();
                loadSummary();
            }
        } catch (error) {
            console.error('Error updating payment status:', error);
            toast.error('Failed to update payment status');
        }
    };

    const clearFilters = () => {
        setFilters({
            payment_status: '',
            apartment_id: '',
            bill_id: '',
            month: '',
            year: new Date().getFullYear()
        });
        setSearchTerm('');
    };

    const filteredPayments = payments.filter(payment => {
        const searchLower = searchTerm.toLowerCase();
        return (
            payment.bill_name?.toLowerCase().includes(searchLower) ||
            payment.apartment_name?.toLowerCase().includes(searchLower) ||
            payment.house_number?.toString().includes(searchTerm) ||
            payment.month?.toLowerCase().includes(searchLower)
        );
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
            case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
            case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
            case 'Refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
        }
    };

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    
    const years = [2023, 2024, 2025, 2026];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {payments.length}
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-500" />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${summary.Paid?.total_paid || 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {summary.Paid?.count || 0} payments
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${summary.Pending?.total_pending || 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {summary.Pending?.count || 0} payments
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {summary.Failed?.count || 0}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                ${summary.Failed?.total_paid || 0} paid
                            </p>
                        </div>
                        <div className="h-8 w-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    {/* Search */}
                    <div className="md:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search payments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            value={filters.payment_status}
                            onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                        </select>
                    </div>

                    {/* Apartment Filter */}
                    <div>
                        <select
                            value={filters.apartment_id}
                            onChange={(e) => handleFilterChange('apartment_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Apartments</option>
                            {apartments.map(apartment => (
                                <option key={apartment.id} value={apartment.id}>
                                    {apartment.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Month Filter */}
                    <div>
                        <select
                            value={filters.month}
                            onChange={(e) => handleFilterChange('month', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Months</option>
                            {months.map(month => (
                                <option key={month} value={month}>{month}</option>
                            ))}
                        </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                        <select
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                    >
                        Clear Filters
                    </button>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Filter size={16} />
                        <span>{filteredPayments.length} payments found</span>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading payments...</span>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="text-center py-12">
                        <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No payments found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {payments.length === 0 ? 'No payments have been recorded yet.' : 'No payments match your search criteria.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Bill & Location
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Period
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Amounts
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {payment.bill_name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    <Building size={12} className="inline mr-1" />
                                                    {payment.apartment_name} 
                                                    <Home size={12} className="inline mx-1" />
                                                    Floor {payment.floor_id} - House {payment.house_number}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-white">
                                                {payment.month} {payment.year}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div className="text-green-600 dark:text-green-400">
                                                    Paid: ${payment.paidAmount}
                                                </div>
                                                <div className="text-red-600 dark:text-red-400">
                                                    Pending: ${payment.pendingAmount}
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                    Unit Price: ${payment.unitPrice}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.payment_status)}`}>
                                                {payment.payment_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {payment.paid_at 
                                                ? new Date(payment.paid_at).toLocaleDateString()
                                                : new Date(payment.created_at).toLocaleDateString()
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                {payment.payment_status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(payment.id, 'Paid')}
                                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                        title="Mark as Paid"
                                                    >
                                                        <DollarSign size={16} />
                                                    </button>
                                                )}
                                                {payment.payment_status === 'Paid' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(payment.id, 'Pending')}
                                                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                        title="Mark as Pending"
                                                    >
                                                        <Calendar size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
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
        </div>
    );
};

export default BillPayments;