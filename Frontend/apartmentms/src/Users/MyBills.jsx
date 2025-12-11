import React, { useState, useEffect, useContext } from 'react';
import { Receipt, FileText, DollarSign, BarChart, Loader, Search, Calendar, CheckCircle, XCircle, ArrowBigRight } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function MyBills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch user's assigned bills
  const fetchUserBills = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/user-bills/users/${auth.user.id}/bills`);
      
      if (response.data.success) {
        setBills(response.data.data || []);
      } else {
        toast.error('Failed to load bills');
        setBills([]);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Error loading your bills');
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.user?.id) {
      fetchUserBills();
    }
  }, [auth?.user?.id]);

  // Filter bills based on search
  const filteredBills = bills.filter(bill =>
    bill.bill_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billtype?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get bill type badge
  const getBillTypeBadge = (billType) => {
    const types = {
      'measurable': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: <BarChart size={12} className="inline mr-1" /> }
    };
    
    return types[billType?.toLowerCase()] || { 
      class: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      icon: <FileText size={12} className="inline mr-1" />
    };
  };

  // Calculate statistics
  const stats = {
    totalBills: bills.length,
    measurableBills: bills.filter(bill => bill.billtype?.toLowerCase() === 'measurable').length
  };

  const handleArrowClick = (billId) => {
    navigate(`/house-bill-meter/${billId}`);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onCollapse={setIsSidebarCollapsed} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        lg:hidden fixed left-0 top-0 h-full z-50
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onCollapse={setIsSidebarCollapsed} />
      </div>

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Navbar */}
        <Navbar />
        
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Receipt size={28} className="text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">My Bills</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  View all bills assigned to you
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {stats.totalBills}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center">
                <Receipt size={40} className="text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Bills</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    View all bills assigned to you
                  </p>
                </div>
              </div>
              <div className="flex space-x-6 text-right">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Bills</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.totalBills}
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 mb-6">
              <div className="relative">
                <Search 
                  size={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <input
                  type="text"
                  placeholder="Search bills by name, type, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 lg:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base lg:text-sm"
                />
              </div>
            </div>

            {/* Bills Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size={32} className="animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Loading bills...</span>
                </div>
              ) : filteredBills.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    {searchTerm ? 'No matching bills found' : 'No bills assigned'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : 'You have not been assigned to any bills yet'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile List View */}
                  <div className="lg:hidden space-y-4">
                    {filteredBills.map((bill) => {
                      const typeBadge = getBillTypeBadge(bill.billtype);
                      
                      return (
                        <div
                          key={bill.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-700"
                        >
                          {/* Bill Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3 flex-1">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <Receipt size={18} className="text-purple-600 dark:text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                                  {bill.bill_name}
                                </h3>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeBadge.class}`}>
                                    {typeBadge.icon}
                                    {bill.billtype || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        
                        <div className='flex'>
                          {/* Metered Indicator */}
                          {bill.is_metered && (
                            <div className="mb-3">
                              <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                                <BarChart size={12} className="inline mr-1" />
                                Metered Bill
                              </span>
                            </div>
                          )}
                          <div className='ml-auto flex gap-6'>
                            <button 
                             onClick={() => handleArrowClick(bill.id)}
                            className='items-center gap-6 px-4 py-2 mb-1 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                                <ArrowBigRight size={16}/>
                            </button>
                          </div>
                        </div>


                          {/* Assigned Date */}
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Assigned: {formatDate(bill.assigned_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Grid View */}
                  <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBills.map((bill) => {
                      const typeBadge = getBillTypeBadge(bill.billtype);
                      
                      return (
                        <div
                          key={bill.id}
                          className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-700"
                        >
                          {/* Bill Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <Receipt size={20} className="text-purple-600 dark:text-purple-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                  {bill.bill_name}
                                </h3>
                                <div className="flex space-x-2 mt-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeBadge.class}`}>
                                    {typeBadge.icon}
                                    {bill.billtype || 'Unknown'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>   
                          
                          <div className='flex'>
                          {/* Metered Indicator */}
                          {bill.is_metered && (
                            <div className="mb-4">
                              <span className="px-3 py-1 text-sm bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                                <BarChart size={14} className="inline mr-2" />
                                Metered Bill
                              </span>
                            </div>
                          )}
                          <div className='flex ml-auto gap-3'>
                            <button 
                             onClick={() => handleArrowClick(bill.id)}
                            className='items-center gap-3 px-4 py-1 mb-1 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                                <ArrowBigRight size={18}/>
                            </button>
                            </div>
                          </div>

                          {/* Assigned Date */}
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Assigned on: {formatDate(bill.assigned_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Floating Search Button */}
            {filteredBills.length > 3 && (
              <div className="lg:hidden fixed bottom-6 right-6 z-30">
                <button
                  onClick={() => {
                    document.querySelector('input[type="text"]')?.focus();
                  }}
                  className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}