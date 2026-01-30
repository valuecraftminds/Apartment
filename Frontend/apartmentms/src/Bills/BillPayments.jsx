import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, DollarSign, Calendar, Home, Building, Receipt, Trash2, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import Sidebar from '../components/sidebar';
import Navbar from '../components/navbar';
import UpdateBillPayments from './UpdateBillPayments';

export default function BillPayments() {
  const [payments, setPayments] = useState([]);
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

  // Load apartments (no need to filter by bill type for now)
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

  //load houses
  const loadHousesByFloor = async (floorId) => {
    if (!floorId || !filters.apartment_id) {
      setHouses([]);
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


  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      //console.log('Loading payments with filters:', Object.fromEntries(params));
      const response = await api.get(`/bill-payments?${params}`);
      if (response.data.success) {
        setPayments(response.data.data);
        //console.log('Payments loaded:', response.data.data.length);
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
    loadApartments(); // Load apartments on initial load
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
    // Don't reload apartments based on bill type for now
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
  };

  // Handle floor selection
  const handleFloorChange = (floorId) => {
    setFilters(prev => ({
      ...prev,
      floor_id: floorId,
      house_id: ''
    }));
    loadHousesByFloor(floorId);
  };

  // Handle house selection
  const handleHouseChange = (houseId) => {
    setFilters(prev => ({
      ...prev,
      house_id: houseId
    }));
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
            // Reload summary
            loadSummary();
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

  // Generate PDF invoice for a single payment
  const generateInvoice = async (payment) => {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Header
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('INVOICE', pageWidth / 2, 20, { align: 'center' });

      // Invoice No and Print Date (3-digit)
      const invoiceNo = String(new Date().getTime() % 1000).padStart(3, '0');
      const printDate = new Date().toISOString().split('T')[0];
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Invoice No: ${invoiceNo}`, 15, 32);
      pdf.text(`Print Date: ${printDate}`, pageWidth - 15, 32, { align: 'right' });

      // House details
      pdf.setFontSize(11);
      pdf.text(`Apartment: ${payment.apartment_name || ''}`, 15, 44);
      if (payment.floor_id) pdf.text(`Floor: ${payment.floor_id}`, 15, 52);
      if (payment.house_number) pdf.text(`House: ${payment.house_number}`, 15, 60);

      // Table header
      const tableTop = 74;
      const colX = [15, 110, 150]; // Description, Due Amount, Paid Amount
      pdf.setDrawColor(0);
      pdf.setFillColor(240, 240, 240);
      pdf.rect(15, tableTop - 8, pageWidth - 30, 8, 'F');
      pdf.setFontSize(11);
      pdf.setTextColor(40);
      pdf.text('Description', colX[0], tableTop - 2);
      pdf.text('Due Amount', colX[1], tableTop - 2);
      pdf.text('Paid Amount', colX[2], tableTop - 2);

      // Row values
      const desc = payment.bill_name || payment.bill_id || 'Charge';
      const dueAmount = Number(payment.unitPrice ?? ((Number(payment.paidAmount || 0) + Number(payment.pendingAmount || 0))));
      const paidAmount = Number(payment.paidAmount || 0);

      const rowY = tableTop + 8;
      pdf.setFontSize(10);
      pdf.setTextColor(0);
      pdf.text(String(desc), colX[0], rowY);
      pdf.text(dueAmount.toFixed(2), colX[1], rowY);
      pdf.text(paidAmount.toFixed(2), colX[2], rowY);

      // Totals
      const totalY = rowY + 18;
      pdf.setFont(undefined, 'bold');
      pdf.text('Total Paid:', colX[1], totalY);
      pdf.text(paidAmount.toFixed(2), colX[2], totalY);

      // Thanks quote
      pdf.setFont(undefined, 'normal');
      pdf.setFontSize(10);
      pdf.text('Thank you for your business!', 15, totalY + 18);

      const fileName = `INVOICE_${invoiceNo}_${(payment.apartment_name || 'apartment').replace(/\s+/g, '_')}_${payment.month || ''}_${payment.year || ''}.pdf`;
      pdf.save(fileName);
      toast.success('Invoice downloaded');
    } catch (err) {
      console.error('Invoice generation failed', err);
      toast.error('Failed to generate invoice');
    }
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
    handleCloseModal();
    loadSummary(); // Reload summary to reflect changes
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
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bill Payments Review</h1>
              </div>
            </div> 

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-4">
                {/* Search */}
                <div className="md:col-span-2">
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

                {/* Bill Type Filter */}
                <div>
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

                {/* Apartment Filter */}
                <div>
                  <select
                    value={filters.apartment_id}
                    onChange={(e) => handleApartmentChange(e.target.value)}
                    disabled={loadingApartments}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="">All Apartments</option>
                    {apartments.map(apartment => (
                      <option key={apartment.id} value={apartment.id}>
                        {apartment.name}
                      </option>
                    ))}
                  </select>
                  {loadingApartments && (
                    <p className="text-xs text-gray-500 mt-1">Loading apartments...</p>
                  )}
                </div>

                {/* Floor Filter */}
                <div>
                  <select
                    value={filters.floor_id}
                    onChange={(e) => handleFloorChange(e.target.value)}
                    disabled={!filters.apartment_id || loadingFloors}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="">All Floors</option>
                    {floors.map(floor => (
                      <option key={floor.id} value={floor.id}>
                        Floor {floor.floor_id}
                      </option>
                    ))}
                  </select>
                  {loadingFloors && (
                    <p className="text-xs text-gray-500 mt-1">Loading floors...</p>
                  )}
                </div>

                {/* House Filter */}
                <div>
                  <select
                    value={filters.house_id}
                    onChange={(e) => handleHouseChange(e.target.value)}
                    disabled={!filters.floor_id || loadingHouses}
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                  >
                    <option value="">All Houses</option>
                    {houses.map(house => (
                      <option key={house.id} value={house.id}>
                        House {house.house_id}
                      </option>
                    ))}
                  </select>
                  {loadingHouses && (
                    <p className="text-xs text-gray-500 mt-1">Loading houses...</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Status Filter */}
                <div>
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

                {/* Month Filter */}
                <div>
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

                {/* Year Filter */}
                {/* <div>
                  <select
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div> */}
                {/* Year Input */}
                <div>
                  <input
                    type="number"
                    value={filters.year}
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                    min="2025"
                    max="2030"
                    className="w-full px-3 py-2 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter year"
                    required
                  />
                </div>

                {/* Clear Filters Button */}
                <div>
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredPayments.length} of {payments.length} payments
                </div>
                
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
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
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
                                {payment.bill_name} ({payment.billtype})
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
                          {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {payment.payment_status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdatePayment(payment)}
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
                                 onClick={() => handleDeleteClick(payment)}
                                disabled={deletingId === payment.id}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete Payment"
                              >
                                {deletingId === payment.id ? (
                                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td> */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-1">
                              {/* Mark as Paid for Pending status */}
                              {/* {payment.payment_status === 'Pending' && (
                                <div className="relative group">
                                  <button
                                    onClick={() => handleUpdatePayment(payment)}
                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 transition-all duration-200"
                                    title="Mark as Paid"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                    Mark as Paid
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                  </div>
                                </div>
                              )} */}
                              
                              {/* Mark as Pending for Paid status */}
                              {/* {payment.payment_status === 'Paid' && (
                                <div className="relative group">
                                  <button
                                    onClick={() => handleStatusUpdate(payment.id, 'Pending')}
                                    className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-all duration-200"
                                    title="Mark as Pending"
                                  >
                                    <Clock size={18} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                    Mark as Pending
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                  </div>
                                </div>
                              )} */}
                              
                              {/* Edit Partial payment */}
                              {/* {payment.payment_status === 'Partial' && (
                                <div className="relative group">
                                  <button
                                    onClick={() => handleUpdatePayment(payment)}
                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200"
                                    title="Edit Partial Payment"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                    Edit Partial
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                  </div>
                                </div>
                              )} */}
                              
                              {/* Retry Failed payment */}
                              {/* {payment.payment_status === 'Failed' && (
                                <div className="relative group">
                                  <button
                                    onClick={() => handleStatusUpdate(payment.id, 'Pending')}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200"
                                    title="Retry Payment"
                                  >
                                    <RefreshCw size={18} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                    Retry Payment
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                  </div>
                                </div>
                              )} */}
                              
                              {/* Edit Refunded payment */}
                              {/* {payment.payment_status === 'Refunded' && (
                                <div className="relative group">
                                  <button
                                    onClick={() => handleUpdatePayment(payment)}
                                    className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 p-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-200"
                                    title="Edit Refund"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                    Edit Refund
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                  </div>
                                </div>
                              )} */}
                              
                              {/* Generic Edit button for other statuses */}
                              {/* {!['Partial', 'Refunded'].includes(payment.payment_status) && (
                                <div className="relative group">
                                  <button
                                    onClick={() => handleUpdatePayment(payment)}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
                                    title="Edit Payment"
                                  >
                                    <Edit size={18} />
                                  </button>
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                    Edit Payment
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                  </div>
                                </div>
                              )} */}
                              
                              {/* Delete button */}
                              <div className="relative group">
                                <button
                                  onClick={() => generateInvoice(payment)}
                                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-all duration-200"
                                  title="Download Invoice"
                                >
                                  <Download size={18} />
                                </button>
                                
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                  Download Invoice
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                </div>
                              </div>
                              <div className="relative group">
                                <button
                                  onClick={() => handleDeleteClick(payment)}
                                  disabled={deletingId === payment.id}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete Payment"
                                >
                                  {deletingId === payment.id ? (
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Trash2 size={18} />
                                  )}
                                </button>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                                  Delete Payment
                                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-700"></div>
                                </div>
                              </div>
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
                              <div className="flex justify-between">
                                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                  <span className={`font-medium ${paymentToDelete.payment_status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                      {paymentToDelete.payment_status}
                                  </span>
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
                              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                          >
                              {deletingId === paymentToDelete.id ? (
                                  <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                      Deleting...
                                  </>
                              ) : (
                                  'Delete Payment'
                              )}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}