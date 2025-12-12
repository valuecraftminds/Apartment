import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, DollarSign, Calendar, Home, Building, Receipt, Trash2, CheckCircle, Clock, RefreshCw, PlusCircle, X } from 'lucide-react';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import UpdateBillPayments from './UpdateBillPayments';

export default function BillPaymentSettle() {
  const [payments, setPayments] = useState([]);
  const [pendingBills, setPendingBills] = useState([]); // Filtered pending bills
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({});
  const [filters, setFilters] = useState({
    billtype: '', 
    apartment_id: '',
    floor_id: '',
    house_id: '',
    payment_status: '',
    month: '',
    year: new Date().getFullYear()
  });
  
  const [apartments, setApartments] = useState([]);
  const [floors, setFloors] = useState([]);
  const [houses, setHouses] = useState([]);
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingHouses, setLoadingHouses] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [showPendingBills, setShowPendingBills] = useState(false);
  const [selectedHouseInfo, setSelectedHouseInfo] = useState(null);

  // Load all bills (to get bill types)
  const loadBills = async () => {
    try {
      const response = await api.get('/bills');
      if (response.data.success) {
        setBills(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.error('Failed to load bills');
    }
  };

  // Load apartments
  const loadApartments = async () => {
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

  // Load floors based on selected apartment
  const loadFloorsByApartment = async (apartmentId) => {
    if (!apartmentId) {
      setFloors([]);
      setHouses([]);
      setPendingBills([]);
      setTotalPendingAmount(0);
      setSelectedHouseInfo(null);
      return;
    }
    
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
    if (!floorId || !filters.apartment_id) {
      setHouses([]);
      setPendingBills([]);
      setTotalPendingAmount(0);
      setSelectedHouseInfo(null);
      return;
    }

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

  // NEW: Filter pending bills from existing payments for selected house
  const filterPendingBillsForHouse = (houseId) => {
    if (!houseId) {
      setPendingBills([]);
      setTotalPendingAmount(0);
      setSelectedHouseInfo(null);
      return;
    }

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

    // Filter payments to get only pending bills for this house
    const pendingBillsData = payments.filter(payment => 
      payment.house_id === houseId && 
      payment.payment_status === 'Pending'
    );
    
    setPendingBills(pendingBillsData);
    
    // Calculate total pending amount
    const total = pendingBillsData.reduce((sum, bill) => {
      return sum + (parseFloat(bill.pendingAmount) || 0);
    }, 0);
    setTotalPendingAmount(total);
    
    // Show the pending bills section
    setShowPendingBills(true);
    
    toast.success(`Found ${pendingBillsData.length} pending bills for House ${selectedHouse?.house_id}`);
  };

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      console.log('Loading payments with filters:', Object.fromEntries(params));
      const response = await api.get(`/bill-payments?${params}`);
      if (response.data.success) {
        setPayments(response.data.data);
        console.log('Payments loaded:', response.data.data.length);
        
        // If a house is selected, update pending bills
        if (filters.house_id) {
          filterPendingBillsForHouse(filters.house_id);
        }
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      console.error('Payment loading error details:', error.response?.data);
      toast.error('Failed to load payments. Check console for details.');
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

  useEffect(() => {
    loadBills();
    loadApartments();
    loadSummary();
    loadPayments();
  }, []);

  useEffect(() => {
    loadPayments();
  }, [filters]);

  // Handle bill type selection
  const handleBillTypeChange = (billtype) => {
    setFilters({
      billtype: billtype,
      apartment_id: '',
      floor_id: '',
      house_id: '',
      payment_status: filters.payment_status,
      month: filters.month,
      year: filters.year
    });
    setShowPendingBills(false);
  };

  // Handle apartment selection
  const handleApartmentChange = (apartmentId) => {
    setFilters(prev => ({
      ...prev,
      apartment_id: apartmentId,
      floor_id: '',
      house_id: ''
    }));
    loadFloorsByApartment(apartmentId);
    setShowPendingBills(false);
  };

  // Handle floor selection
  const handleFloorChange = (floorId) => {
    setFilters(prev => ({
      ...prev,
      floor_id: floorId,
      house_id: ''
    }));
    loadHousesByFloor(floorId);
    setShowPendingBills(false);
  };

  // Handle house selection - filter pending bills
  const handleHouseChange = (houseId) => {
    setFilters(prev => ({
      ...prev,
      house_id: houseId
    }));
    
    if (houseId) {
      filterPendingBillsForHouse(houseId);
    } else {
      setShowPendingBills(false);
      setPendingBills([]);
      setTotalPendingAmount(0);
      setSelectedHouseInfo(null);
    }
  };

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
        // Update pending bills if we're viewing a specific house
        if (filters.house_id) {
          filterPendingBillsForHouse(filters.house_id);
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  // Handle delete payment
  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setShowDeleteModal(true);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;

    try {
        setDeletingId(paymentToDelete.id);
        const response = await api.delete(`/bill-payments/${paymentToDelete.id}`);
        
        if (response.data.success) {
            toast.success('Payment deleted successfully');
            // Remove from local state
            setPayments(prev => prev.filter(payment => payment.id !== paymentToDelete.id));
            // Also remove from pending bills if present
            setPendingBills(prev => prev.filter(bill => bill.id !== paymentToDelete.id));
            // Reload summary
            loadSummary();
            // Recalculate total pending amount
            if (filters.house_id) {
              filterPendingBillsForHouse(filters.house_id);
            }
        }
    } catch (error) {
        console.error('Error deleting payment:', error);
        toast.error(error.response?.data?.message || 'Failed to delete payment');
    } finally {
        setDeletingId(null);
        setShowDeleteModal(false);
        setPaymentToDelete(null);
    }
  };

  // Function to close pending bills view
  const closePendingBillsView = () => {
    setShowPendingBills(false);
    setPendingBills([]);
    setTotalPendingAmount(0);
    setSelectedHouseInfo(null);
  };

  const clearFilters = () => {
    setFilters({
      billtype: '',
      apartment_id: '',
      floor_id: '',
      house_id: '',
      payment_status: '',
      month: '',
      year: new Date().getFullYear()
    });
    setSearchTerm('');
    setFloors([]);
    setHouses([]);
    setShowPendingBills(false);
    setPendingBills([]);
    setTotalPendingAmount(0);
    setSelectedHouseInfo(null);
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
      case 'Partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      case 'Refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
    }
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const years = [2023, 2024, 2025, 2026];

  // Get unique bill types from bills
  const billTypes = [...new Set(bills.map(bill => bill.billtype))].filter(type => type);

  // Handle opening update payment modal
  const handleUpdatePayment = (payment) => {
    setSelectedPayment(payment);
    setShowUpdateModal(true);
  };

  // Handle closing update payment modal
  const handleCloseModal = () => {
    setShowUpdateModal(false);
    setSelectedPayment(null);
  };

  // Handle payment update from modal
  const handlePaymentUpdate = (updatedPayment) => {
    setPayments(prev => prev.map(payment => 
      payment.id === updatedPayment.id ? updatedPayment : payment
    ));
    
    // Also update in pending bills if present
    setPendingBills(prev => prev.map(bill => 
      bill.id === updatedPayment.id ? updatedPayment : bill
    ));
    
    handleCloseModal();
    loadSummary();
    // Recalculate total pending amount
    if (filters.house_id) {
      const total = pendingBills.reduce((sum, bill) => {
        return sum + (parseFloat(bill.pendingAmount) || 0);
      }, 0);
      setTotalPendingAmount(total);
    }
  };

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
                    Manage payments and view pending bills by house
                  </p>
                </div>
              </div>
            </div> 

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Filter & Select House</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Apartment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Apartment
                  </label>
                  <select
                    value={filters.apartment_id}
                    onChange={(e) => handleApartmentChange(e.target.value)}
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
                </div>

                {/* Floor Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Floor
                  </label>
                  <select
                    value={filters.floor_id}
                    onChange={(e) => handleFloorChange(e.target.value)}
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
                </div>

                {/* House Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select House
                  </label>
                  <select
                    value={filters.house_id}
                    onChange={(e) => handleHouseChange(e.target.value)}
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
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bill Type
                  </label>
                  <select
                    value={filters.billtype}
                    onChange={(e) => handleBillTypeChange(e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Bill Types</option>
                    {billTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month
                  </label>
                  <select
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Months</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.payment_status}
                    onChange={(e) => handleFilterChange('payment_status', e.target.value)}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-gray-700 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Bills Section - Shows when a house is selected */}
            {showPendingBills && selectedHouseInfo && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                      <Home className="mr-2 text-purple-600" size={24} />
                      Pending Bills for House {selectedHouseInfo.houseNumber}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedHouseInfo.apartmentName} • Floor {selectedHouseInfo.floorNumber}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <div className="text-yellow-800 dark:text-yellow-300 font-bold text-xl">
                        ${totalPendingAmount.toFixed(2)}
                      </div>
                      <div className="text-yellow-600 dark:text-yellow-400 text-sm">Total Pending</div>
                    </div>
                    <button
                      onClick={closePendingBillsView}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={20} className="text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {pendingBills.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Pending Bills
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      All bills for this house have been paid.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
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
                            Unit Price
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
                        {pendingBills.map((bill) => (
                          <tr key={bill.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              ${bill.unitPrice || '0.00'}
                            </td>
                            <td className="px-4 py-3 text-green-600 dark:text-green-400">
                              ${bill.paidAmount || '0.00'}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-red-600 dark:text-red-400">
                                ${bill.pendingAmount || '0.00'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleUpdatePayment(bill)}
                                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30"
                                  title="Pay Bill"
                                >
                                  <DollarSign size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(bill)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
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
            )}

            {/* All Payments Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  All Payments ({filteredPayments.length})
                </h3>
              </div>

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
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Bill & Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Period
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Amounts
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {payment.bill_name} ({payment.billtype})
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {payment.apartment_name} • Floor {payment.floor_id} • House {payment.house_number}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-900 dark:text-white">
                              {payment.month} {payment.year}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-green-600 dark:text-green-400">
                                Paid: ${payment.paidAmount}
                              </div>
                              <div className="text-red-600 dark:text-red-400">
                                Pending: ${payment.pendingAmount}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.payment_status)}`}>
                              {payment.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            {payment.paid_at 
                              ? new Date(payment.paid_at).toLocaleDateString()
                              : new Date(payment.created_at).toLocaleDateString()
                            }
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleUpdatePayment(payment)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(payment)}
                                disabled={deletingId === payment.id}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 size={18} />
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
        </div>
      </div>
      
      {/* Update Payment Modal */}
      {showUpdateModal && (
        <UpdateBillPayments
          payment={selectedPayment}
          onClose={handleCloseModal}
          onUpdate={handlePaymentUpdate}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && paymentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg mr-3">
                  <Trash2 className="text-red-600 dark:text-red-400" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Payment
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete this payment record? This action cannot be undone.
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">
                  Payment Details
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Bill:</span>
                    <span className="font-medium">{paymentToDelete.bill_name} ({paymentToDelete.billtype})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="font-medium">{paymentToDelete.apartment_name} - House {paymentToDelete.house_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">${paymentToDelete.paidAmount} paid</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPaymentToDelete(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  disabled={deletingId === paymentToDelete.id}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePayment}
                  disabled={deletingId === paymentToDelete.id}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deletingId === paymentToDelete.id ? 'Deleting...' : 'Delete Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  )
}