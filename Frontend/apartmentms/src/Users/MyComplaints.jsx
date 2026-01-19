import React, { useState, useEffect, useContext } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Filter, 
  Search, 
  MapPin,
  Home,
  Building2,
  User,
  Wrench,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all'
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0
  });
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch technician's assigned complaints
  const fetchMyComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/complaints/my-complaints/technician', {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        },
        params: filters
      });
      
      if (response.data.success) {
        setComplaints(response.data.data || []);
        if (response.data.statistics) {
          setStatistics(response.data.statistics);
        }
      } else {
        console.error('Failed to load complaints:', response.data.message);
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.accessToken) {
      fetchMyComplaints();
    }
  }, [auth?.accessToken, filters]);

  // Filter complaints based on search
  const filteredComplaints = complaints.filter(complaint =>
    complaint.complaint_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.houseowner_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
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

  // Get status badge style
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

  // Get category color
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'electrical':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'plumbing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'carpentry':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'painting':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cleaning':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
      case 'security':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Handle view complaint details
  const handleViewComplaint = (complaintId) => {
    navigate(`/complaints/${complaintId}`);
  };

  // Handle update status
  // const handleUpdateStatus = async (complaintId, newStatus) => {
  //   try {
  //     const res = await api.patch(`/complaints/${complaintId}/status`, {
  //       status: newStatus
  //     }, {
  //       headers: { 
  //         Authorization: `Bearer ${auth.accessToken}`
  //       }
  //     });

  //     if (res.data.success) {
  //       fetchMyComplaints();
  //       alert(`Complaint marked as ${newStatus}!`);
  //     }
  //   } catch (err) {
  //     console.error('Failed to update status:', err);
  //     alert(err.response?.data?.message || 'Failed to update status');
  //   }
  // };

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
              <AlertCircle size={28} className="text-purple-600 dark:text-purple-400 mr-2" />
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">My Complaints</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Complaints assigned to you
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {statistics.total}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center">
                <AlertCircle size={40} className="text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Complaints</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    View all complaints assigned to you
                  </p>
                </div>
              </div>
              {/* <div className="flex space-x-6 text-right">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Complaints</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statistics.total}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {statistics.in_progress}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {statistics.pending}
                  </p>
                </div>
              </div> */}
            </div>

            {/* Statistics Cards - Mobile */}
            <div className="lg:hidden grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                      {statistics.total}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <AlertCircle size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      {statistics.in_progress}
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Wrench size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search 
                      size={20} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type="text"
                      placeholder="Search complaints by number, title, or house owner..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 lg:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base lg:text-sm"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Complaints Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-300">Loading complaints...</span>
                </div>
              ) : filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    {searchTerm ? 'No matching complaints found' : 'No complaints assigned'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : 'You have not been assigned to any complaints yet'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile List View */}
                  <div className="lg:hidden space-y-4">
                    {filteredComplaints.map((complaint) => (
                      <div
                        key={complaint.id}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-700"
                      >
                        {/* Complaint Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                              <AlertCircle size={18} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                                {complaint.complaint_number}
                              </h3>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 truncate">
                                {complaint.title}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                                  {complaint.status}
                                </span>
                                {complaint.category && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(complaint.category)}`}>
                                    {complaint.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Location Info */}
                        <div className="mb-3">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin size={14} className="mr-2" />
                            <span>
                              {complaint.apartment_name || 'Unknown'} • Floor {complaint.floor_number} • House {complaint.house_number}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <User size={14} className="mr-2" />
                            <span>House Owner: {complaint.houseowner_name || 'Unknown'}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>

                        {/* Dates and Actions */}
                        <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-600 pt-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Created: {formatDate(complaint.created_at)}
                            </p>
                            {complaint.assigned_at && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Assigned: {formatDate(complaint.assigned_at)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
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
                            Created Date
                          </th>
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
                                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                  {complaint.title}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                  {complaint.description}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  House Owner: {complaint.houseowner_name || 'Unknown'}
                                </div>
                                {complaint.category && (
                                  <span className={`mt-2 inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(complaint.category)}`}>
                                    {complaint.category}
                                  </span>
                                )}
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
                              <div className="text-sm text-gray-900 dark:text-white">
                                {formatDate(complaint.created_at)}
                              </div>
                              {complaint.assigned_at && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Assigned: {formatDate(complaint.assigned_at)}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Floating Action Button */}
            {filteredComplaints.length > 3 && (
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
    </div>
  );
}