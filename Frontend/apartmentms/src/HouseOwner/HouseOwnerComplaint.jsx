// HouseOwnerComplaint.jsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';
import HouseOwnerSidebar from '../components/HouseOwnerSidebar';
import HouseOwnerNavbar from '../components/HouseOwnerNavbar';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Plus, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  AlertTriangle,
  Home,
  Building2,
  Wrench,
  Zap,
  Shield,
  Users,
  Settings,
  Check,
  Tag
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function HouseOwnerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    apartment_id: '',
    floor_id: '',
    house_id: '',
  });
  const [errors, setErrors] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });
  const { auth } = useContext(AuthContext);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [houseInfo, setHouseInfo] = useState(null);

  // Fetch house owner's information including location and categories
  const fetchHouseOwnerInfo = async () => {
    try {
      // Fetch categories
      const categoriesRes = await api.get('/categories', {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data || []);
      }

      // Fetch house owner's house information
      const houseRes = await api.get('/houses/owner/me', {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      
      if (houseRes.data.success && houseRes.data.data.length > 0) {
        const houseData = houseRes.data.data[0];
        setHouseInfo(houseData);
        setFormData(prev => ({
          ...prev,
          apartment_id: houseData.apartment_id,
          floor_id: houseData.floor_id,
          house_id: houseData.id
        }));
      } else {
        toast.warning('No house information found. Please contact your apartment administrator.');
      }
    } catch (err) {
      console.error('Failed to fetch house owner info:', err);
      toast.error('Failed to load your information. Please try again.');
    }
  };

  // Fetch complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/my-complaints', {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        },
        params: filters
      });
      
      if (res.data.success) {
        setComplaints(res.data.data || []);
        setFilteredComplaints(res.data.data || []);
        setStatistics(res.data.statistics || {
          total: 0,
          pending: 0,
          resolved: 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
      toast.error('Failed to load complaints. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.accessToken) {
      fetchHouseOwnerInfo();
      fetchComplaints();
    }
  }, [auth.accessToken, filters]);

  // Apply filters locally
  useEffect(() => {
    if (!complaints.length) {
      setFilteredComplaints([]);
      return;
    }

    let filtered = [...complaints];

    if (filters.status !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === filters.status);
    }

    setFilteredComplaints(filtered);
  }, [complaints, filters]);

  // Handle create complaint
  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category_id) newErrors.category_id = 'Please select a category';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check if house info is available
    if (!formData.house_id) {
      toast.error('No house information found. Please contact your apartment administrator.');
      return;
    }

    try {
      const res = await api.post('/complaints', {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id,
        apartment_id: formData.apartment_id,
        floor_id: formData.floor_id,
        house_id: formData.house_id,
      }, {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.data.success) {
        toast.success('Complaint filed successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchComplaints();
      }
    } catch (err) {
      console.error('Failed to create complaint:', err);
      const errorMsg = err.response?.data?.message || 'Failed to create complaint';
      toast.error(errorMsg);
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
        setShowViewModal(false);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category_id: '',
      apartment_id: houseInfo?.apartment_id || '',
      floor_id: houseInfo?.floor_id || '',
      house_id: houseInfo?.id || '',
    });
    setErrors({});
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="text-yellow-600 dark:text-yellow-400 mr-2" size={16} />;
      case 'In Progress':
        return <Wrench className="text-blue-600 dark:text-blue-400 mr-2" size={16} />;
      case 'Resolved':
        return <CheckCircle className="text-green-600 dark:text-green-400 mr-2" size={16} />;
      case 'Closed':
        return <Shield className="text-gray-600 dark:text-gray-400 mr-2" size={16} />;
      case 'Rejected':
        return <AlertTriangle className="text-red-600 dark:text-red-400 mr-2" size={16} />;
      default:
        return <FileText className="text-gray-600 dark:text-gray-400 mr-2" size={16} />;
    }
  };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'General';
  };

  // Get category color by ID
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'gray';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !complaints.length) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen">
        <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} md:ml-64`}>
          <HouseOwnerNavbar />
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading complaints...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen">
      <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
      
      <div className={`
        flex-1 flex flex-col overflow-hidden 
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} 
        w-full transition-all duration-300
      `}>
        <HouseOwnerNavbar />
        
        <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 md:mb-6 gap-4'>
              <div className='flex items-center'>
                <AlertCircle size={32} className='text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0'/>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
                    My Complaints
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                    Report and track maintenance issues
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => setShowCreateModal(true)}
                className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={!houseInfo}
              >
                <Plus size={20} />
                <span>File New Complaint</span>
              </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 md:mb-6">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">Resolved</p>
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

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">
                  Filter Complaints
                </h3>
                <div className="flex items-center space-x-2">
                  <Filter size={18} className="text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {filteredComplaints.length} of {complaints.length} complaints
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border text-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
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
            </div>

            {/* Complaints List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No complaints found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {complaints.length === 0 ? 'You haven\'t filed any complaints yet.' : 'No complaints match your filter criteria.'}
                  </p>
                  {complaints.length === 0 && (
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!houseInfo}
                    >
                      File Your First Complaint
                    </button>
                  )}
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
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredComplaints.map((complaint) => (
                        <tr key={complaint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-4 py-4">
                            <div>
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  {complaint.complaint_number}
                                </span>
                                {complaint.category_name && (
                                  <span 
                                    className="ml-2 px-2 py-1 text-xs font-semibold rounded-full"
                                    style={{ 
                                      backgroundColor: `${getCategoryColor(complaint.category_id)}20`,
                                      color: getCategoryColor(complaint.category_id)
                                    }}
                                  >
                                    {complaint.category_name}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white font-semibold mt-2">
                                {complaint.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                {complaint.description}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                <Building2 size={12} className="mr-1" />
                                {complaint.apartment_name} • Floor {complaint.floor_number} • House {complaint.house_number}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              {getStatusIcon(complaint.status)}
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                                {complaint.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatDate(complaint.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewComplaint(complaint)}
                                className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                title="View Details"
                              >
                                <FileText size={16} />
                              </button>
                              
                              {complaint.status === 'In Progress' && (
                                <button
                                  onClick={() => handleUpdateStatus(complaint.id, 'Resolved')}
                                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                                  title="Mark as Resolved"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              
                              {complaint.status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(complaint.id, 'In Progress')}
                                  className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                                  title="Mark as In Progress"
                                >
                                  <Clock size={16} />
                                </button>
                              )}
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

      {/* Create Complaint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  File New Complaint
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                >
                  ✖
                </button>
              </div>

              {!houseInfo ? (
                <div className="text-center py-8">
                  <Home className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={40} />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No House Information Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Please contact your apartment administrator to assign a house to your account.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateComplaint}>
                  {/* House Information Display */}
                  <div className="mb-6">
                    {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location (Auto-detected)
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <Home className="text-purple-600 dark:text-purple-400 mr-3" size={20} />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            House {houseInfo.house_id}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Floor {houseInfo.floor_number} • {houseInfo.apartment_name}
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Your house information is automatically detected from your profile.
                    </p> */}
                  </div>

                  {/* Category Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Complaint Category *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category_id}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, category_id: e.target.value }));
                          if (errors.category_id) {
                            setErrors(prev => ({ ...prev, category_id: '' }));
                          }
                        }}
                        className="w-full px-3 py-2 pl-10 border border-gray-300 text-gray-700 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white appearance-none"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <Tag className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                    {errors.category_id && (
                      <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>
                    )}
                    {categories.length === 0 && (
                      <p className="text-yellow-600 text-sm mt-1">
                        No categories available. Please contact your administrator.
                      </p>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Complaint Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, title: e.target.value }));
                        if (errors.title) {
                          setErrors(prev => ({ ...prev, title: '' }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of the issue"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                        if (errors.description) {
                          setErrors(prev => ({ ...prev, description: '' }));
                        }
                      }}
                      rows={4}
                      className="w-full px-3 py-2 border text-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Please provide detailed information about the issue..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Be specific about the issue. Include details like location, severity, and any photos if possible.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Submit Complaint
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* View Complaint Modal */}
      {showViewModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Complaint Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                >
                  ✖
                </button>
              </div>

              {/* Complaint Header */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedComplaint.complaint_number}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                        {selectedComplaint.status}
                      </span>
                      {selectedComplaint.category_name && (
                        <span 
                          className="px-2 py-1 text-xs font-semibold rounded-full"
                          style={{ 
                            backgroundColor: `${getCategoryColor(selectedComplaint.category_id)}20`,
                            color: getCategoryColor(selectedComplaint.category_id)
                          }}
                        >
                          {selectedComplaint.category_name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-3">
                      {selectedComplaint.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Complaint Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Location Details
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Building2 className="text-purple-600 dark:text-purple-400 mr-3" size={18} />
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          {selectedComplaint.apartment_name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Apartment Complex
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Home className="text-purple-600 dark:text-purple-400 mr-3" size={18} />
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">
                          Floor {selectedComplaint.floor_number} • House {selectedComplaint.house_number}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Your Unit
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Timeline
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Filed:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatDate(selectedComplaint.created_at)}
                        </span>
                      </div>
                      {selectedComplaint.assigned_at && (
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-600 dark:text-gray-400">Assigned:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatDate(selectedComplaint.assigned_at)}
                          </span>
                        </div>
                      )}
                      {selectedComplaint.resolved_at && (
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-600 dark:text-gray-400">Resolved:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatDate(selectedComplaint.resolved_at)}
                          </span>
                        </div>
                      )}
                      {selectedComplaint.updated_at && (
                        <div className="flex justify-between mt-1">
                          <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatDate(selectedComplaint.updated_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Technician */}
              {selectedComplaint.assigned_to_name && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                    Assigned Technician
                  </h4>
                  <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <Users className="text-blue-600 dark:text-blue-400 mr-3" size={20} />
                    <div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {selectedComplaint.assigned_to_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {selectedComplaint.assigned_to_role}
                      </div>
                      {selectedComplaint.assignment_notes && (
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic border-l-2 border-blue-500 pl-2">
                          Note: {selectedComplaint.assignment_notes}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Description
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Update Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedComplaint.status === 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'Closed')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Confirm Resolution & Close
                    </button>
                  )}
                  
                  {selectedComplaint.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'In Progress')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Mark as In Progress
                    </button>
                  )}

                  {selectedComplaint.status === 'In Progress' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'Resolved')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Mark as Resolved
                    </button>
                  )}
                  
                  {selectedComplaint.status === 'Closed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'Pending')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                    >
                      Reopen Complaint
                    </button>
                  )}
                  
                  {selectedComplaint.status === 'Resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedComplaint.id, 'In Progress')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Issue Not Resolved
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer
        position="top-center" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="mt-14 md:mt-0"
        toastClassName="text-sm md:text-base"
      />
    </div>
  );
}