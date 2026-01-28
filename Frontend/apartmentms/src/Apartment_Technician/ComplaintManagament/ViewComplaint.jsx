// ViewComplaint.jsx
import React, { useState, useEffect, useContext } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Filter, 
  Search,
  Wrench,
  Timer,
  CalendarClock,
  User,
  Building2
} from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../api/axios';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';

export default function ViewComplaint() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    apartment_id: 'all',
    category: 'all'
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0
  });
  const { auth } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [apartments, setApartments] = useState([]);

  // Load apartments for filtering
  const loadApartments = async () => {
    try {
      const result = await api.get('/apartments');
      if (result.data.success) {
        setApartments(result.data.data || []);
      }
    } catch (err) {
      console.error('Error loading apartments:', err);
      toast.error('Failed to load apartments');
    }
  };

  // Fetch all complaints for admin view
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints', {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        },
        params: filters
      });
      
      if (res.data.success) {
        const complaintsData = res.data.data || [];
        setComplaints(complaintsData);
        setFilteredComplaints(complaintsData);
        calculateStatistics(complaintsData);
        
        // Extract unique categories from complaints data
        if (complaintsData.length > 0) {
          const uniqueCategories = [...new Set(
            complaintsData
              .map(c => c.category)
              .filter(category => category && category.trim() !== '')
              .sort()
          )];
          
          if (!uniqueCategories.includes('General')) {
            uniqueCategories.unshift('General');
          }
          
          setCategories(uniqueCategories);
        }
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.accessToken) {
      loadApartments();
      fetchComplaints();
    }
  }, [auth.accessToken, filters]);

  // Apply search filter
  useEffect(() => {
    if (!complaints.length) {
      setFilteredComplaints([]);
      return;
    }

    let filtered = [...complaints];

    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(complaint => 
        complaint.complaint_number?.toLowerCase().includes(term) ||
        complaint.title?.toLowerCase().includes(term) ||
        (complaint.houseowner_name && complaint.houseowner_name.toLowerCase().includes(term)) ||
        (complaint.apartment_name && complaint.apartment_name.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === filters.status);
    }

    // Apply apartment filter
    if (filters.apartment_id !== 'all') {
      filtered = filtered.filter(complaint => complaint.apartment_id === filters.apartment_id);
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === filters.category);
    }

    setFilteredComplaints(filtered);
  }, [complaints, searchTerm, filters]);

  const calculateStatistics = (data) => {
    const total = data.length;
    const pending = data.filter(c => c.status === 'Pending').length;
    const in_progress = data.filter(c => c.status === 'In Progress').length;
    const resolved = data.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    
    setStatistics({
      total,
      pending,
      in_progress,
      resolved
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'water':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'electricity':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'gas':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'plumbing':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      case 'carpentry':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Calculate time difference
  const calculateTimeDifference = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A';
    
    try {
      const start = new Date(startDate);
      const end = endDate === 'now' ? new Date() : new Date(endDate);
      const diffMs = end - start;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffDays > 0) {
        return `${diffDays}d ${diffHours}h`;
      } else if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}m`;
      } else {
        return 'Just now';
      }
    } catch {
      return 'N/A';
    }
  };

  // Format work time if available
  const formatWorkTime = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Handle status update
  const handleUpdateStatus = async (complaintId, newStatus) => {
    try {
      const res = await api.patch(`/complaints/${complaintId}/status`, {
        status: newStatus
      }, {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });

      if (res.data.success) {
        fetchComplaints();
        toast.success(`Complaint marked as ${newStatus}!`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      apartment_id: 'all',
      category: 'all'
    });
  };

  const loadRatings = async (complaintId) => {
    try {
      const res = await api.get(`/ratings/get-rating/${complaintId}/rating`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      if (res.data.success) {
        return res.data.data;
      }
    } catch (err) {
      console.error('Failed to load ratings:', err);
      toast.error('Failed to load ratings');
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading complaints...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar/>
        <div className='flex-1 overflow-y-auto p-6'>
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 gap-4'>
              <div className='flex items-center'>
                <AlertCircle size={32} className='text-purple-600 dark:text-purple-400 mr-3'/>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    All Complaints
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View and manage all complaints
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Complaints</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                      {statistics.total}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <FileText size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                      {statistics.pending}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {statistics.in_progress}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Wrench size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Resolved/Closed</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {statistics.resolved}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">
                  Filter & Search Complaints
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredComplaints.length} of {complaints.length} complaints
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by complaint number, title, or house owner..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Apartment Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Apartment
                  </label>
                  <select
                    value={filters.apartment_id}
                    onChange={(e) => setFilters(prev => ({ ...prev, apartment_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Apartments</option>
                    {apartments.map((apartment) => (
                      <option key={apartment.id} value={apartment.id}>
                        {apartment.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Category
                  </label>
                  <select
                    value={filters.category_id || 'all'}
                    onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters Button */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No complaints found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {complaints.length === 0 ? 'No complaints have been filed yet.' : 'No complaints match your filter criteria.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Complaint Details
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Location
                        </th>            
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Timeline & Rating
                        </th>
                        {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th> */}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {complaint.complaint_number}
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white font-semibold mt-1">
                                {complaint.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {complaint.description}
                              </div>
                              <div className="flex items-center mt-1">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(complaint.category)}`}>
                                  {complaint.category || 'General'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                By: {complaint.houseowner_name || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Created: {formatDate(complaint.created_at)}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {complaint.apartment_name || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Floor {complaint.floor_number} • House {complaint.house_number}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {complaint.resolved_at ? (
                                <>
                                  <div className="text-sm text-gray-900 dark:text-white flex items-center">
                                    <CalendarClock size={14} className="mr-1" />
                                    Resolved: {formatDate(complaint.resolved_at)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Duration: {calculateTimeDifference(complaint.created_at, complaint.resolved_at)}
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Open for: {calculateTimeDifference(complaint.created_at, 'now')}
                                </div>
                              )}
                              {complaint.total_work_time > 0 && (
                                <div className="text-xs text-green-600 dark:text-green-400 flex items-center">
                                  <Timer size={12} className="mr-1" />
                                  Work Time: {formatWorkTime(complaint.total_work_time)}
                                </div>
                              )}
                            </div>
                          </td>
                          {/* <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              // View Details Button
                            </div>
                          </td> */}
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
      <ToastContainer
        position="top-center" 
        autoClose={3000}
        className="mt-14 md:mt-0"
        toastClassName="text-sm md:text-base"
      />
    </div>
  );
}
