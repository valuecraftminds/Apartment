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
  Settings
} from 'lucide-react';

export default function HouseOwnerComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [houses, setHouses] = useState([]);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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

  // Fetch houses assigned to house owner
  const fetchHouses = async () => {
    try {
      const res = await api.get('/houses/owner/me', {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      
      if (res.data.success && res.data.data.length > 0) {
        const housesData = res.data.data;
        setHouses(housesData);
        
        // Select first house by default
        if (housesData.length > 0) {
          const firstHouse = housesData[0];
          setSelectedHouse(firstHouse);
          setFormData(prev => ({
            ...prev,
            apartment_id: firstHouse.apartment_id,
            floor_id: firstHouse.floor_id,
            house_id: firstHouse.id
          }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch houses:', err);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.accessToken) {
      fetchHouses();
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

  // In HouseOwnerComplaint.jsx, change handleCreateComplaint:
const handleCreateComplaint = async (e) => {
  e.preventDefault();
  
  // Validation
  const newErrors = {};
  if (!formData.title.trim()) newErrors.title = 'Title is required';
  if (!formData.description.trim()) newErrors.description = 'Description is required';
  if (!formData.house_id) newErrors.house = 'Please select a house';
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    const res = await api.post('/complaints', {
      title: formData.title,
      description: formData.description,
      apartment_id: formData.apartment_id,
      floor_id: formData.floor_id,
      house_id: formData.house_id,
      // Remove category and priority as they don't exist in DB
      // category: formData.category,
      // priority: formData.priority
    }, {
      headers: { 
        Authorization: `Bearer ${auth.accessToken}`,
        'Content-Type': 'application/json' // Send as JSON
      }
    });

    if (res.data.success) {
      setShowCreateModal(false);
      resetForm();
      fetchComplaints();
    }
  } catch (err) {
    console.error('Failed to create complaint:', err);
    alert(err.response?.data?.message || 'Failed to create complaint');
  }
};

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      apartment_id: selectedHouse?.apartment_id || '',
      floor_id: selectedHouse?.floor_id || '',
      house_id: selectedHouse?.id || '',
    });
    setErrors({});
  };

  // const handleFileChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     // Validate file size (5MB)
  //     if (file.size > 5 * 1024 * 1024) {
  //       alert('File size must be less than 5MB');
  //       return;
  //     }
      
  //     // Validate file type
  //     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 
  //                          'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  //     if (!allowedTypes.includes(file.type)) {
  //       alert('Only images, PDF and Word documents are allowed');
  //       return;
  //     }
      
  //     setFormData(prev => ({ ...prev, attachment: file }));
  //   }
  // };

  const handleHouseSelect = (house) => {
    setSelectedHouse(house);
    setFormData(prev => ({
      ...prev,
      apartment_id: house.apartment_id,
      floor_id: house.floor_id,
      house_id: house.id
    }));
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

  // const getPriorityColor = (priority) => {
  //   switch (priority) {
  //     case 'Emergency':
  //       return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  //     case 'High':
  //       return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
  //     case 'Medium':
  //       return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  //     case 'Low':
  //       return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  //     default:
  //       return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  //   }
  // };

  // const getCategoryIcon = (category) => {
  //   switch (category) {
  //     case 'Plumbing':
  //       return <Wrench className="text-blue-500" size={16} />;
  //     case 'Electrical':
  //       return <Zap className="text-yellow-500" size={16} />;
  //     case 'Security':
  //       return <Shield className="text-green-500" size={16} />;
  //     case 'Common Area':
  //       return <Users className="text-purple-500" size={16} />;
  //     default:
  //       return <Tool className="text-gray-500" size={16} />;
  //   }
  // };

  const handleViewComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

  // const handleDownloadAttachment = async (complaint) => {
  //   try {
  //     const response = await api.get(`/complaints/${complaint.id}/download`, {
  //       headers: { 
  //         Authorization: `Bearer ${auth.accessToken}`
  //       },
  //       responseType: 'blob'
  //     });
      
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.setAttribute('download', `complaint-${complaint.complaint_number}.${complaint.attachment_path.split('.').pop()}`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //   } catch (err) {
  //     console.error('Failed to download attachment:', err);
  //     alert('Failed to download attachment');
  //   }
  // };

  // const categories = [
  //   { value: 'Plumbing', label: 'Plumbing', icon: <Wrench size={16} /> },
  //   { value: 'Electrical', label: 'Electrical', icon: <Zap size={16} /> },
  //   { value: 'Structural', label: 'Structural', icon: <Building2 size={16} /> },
  //   { value: 'Common Area', label: 'Common Area', icon: <Users size={16} /> },
  //   { value: 'Security', label: 'Security', icon: <Shield size={16} /> },
  //   { value: 'Maintenance', label: 'Maintenance', icon: <Settings size={16} /> },
  //   { value: 'Other', label: 'Other', icon: <AlertCircle size={16} /> }
  // ];

  // const priorities = [
  //   { value: 'Low', label: 'Low', color: 'text-green-600' },
  //   { value: 'Medium', label: 'Medium', color: 'text-yellow-600' },
  //   { value: 'High', label: 'High', color: 'text-orange-600' },
  //   { value: 'Emergency', label: 'Emergency', color: 'text-red-600' }
  // ];

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
                className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'
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

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </label>
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
            </div>

            {/* Complaints List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No complaints found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {complaints.length === 0 ? 'You haven\'t filed any complaints yet.' : 'No complaints match your filter criteria.'}
                  </p>
                  {complaints.length === 0 && (
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {complaint.apartment_name} • Floor {complaint.floor_number} • House {complaint.house_number}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(complaint.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(complaint.created_at).toLocaleTimeString()}
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
                              
                              {/* {complaint.attachment_path && (
                                <button
                                  onClick={() => handleDownloadAttachment(complaint)}
                                  className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                                  title="Download Attachment"
                                >
                                  <Download size={16} />
                                </button>
                              )} */}
                              
                              {complaint.status === 'Pending' && (
                                <button
                                  onClick={() => {
                                    // Handle edit
                                    setFormData({
                                      title: complaint.title,
                                      description: complaint.description,
                                      apartment_id: complaint.apartment_id,
                                      floor_id: complaint.floor_id,
                                      house_id: complaint.house_id
                                    });
                                    setSelectedComplaint(complaint);
                                    setShowCreateModal(true);
                                  }}
                                  className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-lg"
                                  title="Edit Complaint"
                                >
                                  <Edit size={16} />
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

      {/* Create/Edit Complaint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {selectedComplaint ? 'Edit Complaint' : 'File New Complaint'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedComplaint(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                >
                  ✖
                </button>
              </div>

              {houses.length === 0 ? (
                <div className="text-center py-8">
                  <Home className="mx-auto text-gray-400 mb-4" size={40} />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Houses Assigned
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    You don't have any houses assigned to file complaints for.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCreateComplaint}>
                  {/* House Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select House *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {houses.map((house) => (
                        <button
                          key={house.id}
                          type="button"
                          onClick={() => handleHouseSelect(house)}
                          className={`p-3 border rounded-lg text-left transition-all ${
                            selectedHouse?.id === house.id
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                          }`}
                        >
                          <div className="flex items-center">
                            <Home className="text-gray-500 mr-2" size={16} />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                House {house.house_id}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Floor {house.floor_number} • {house.apartment_name}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.house && (
                      <p className="text-red-500 text-sm mt-1">{errors.house}</p>
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
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Brief description of the issue"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detailed Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Please provide detailed information about the issue..."
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                    )}
                  </div>

                  {/* Category and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                
                  </div>

                  {/* File Attachment */}
                  <div className="mb-6">
                    {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Attachment (Optional)
                    </label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 dark:hover:border-purple-400">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FileText className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Images, PDF, DOC up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        />
                      </label>
                    </div> */}
                    {/* {formData.attachment && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="text-green-600 dark:text-green-400 mr-2" size={16} />
                            <span className="text-sm text-green-800 dark:text-green-300">
                              {formData.attachment.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, attachment: null }))}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )} */}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedComplaint(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      {selectedComplaint ? 'Update Complaint' : 'Submit Complaint'}
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
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                >
                  ✖
                </button>
              </div>

              {/* Complaint Header */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedComplaint.complaint_number}
                      </span>
                      <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                        {selectedComplaint.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-2">
                      {selectedComplaint.title}
                    </h3>
                  </div>
                  {/* <div className="mt-4 md:mt-0">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>
                      {selectedComplaint.priority} Priority
                    </span>
                  </div> */}
                </div>
              </div>

              {/* Complaint Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Location Details
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Building2 className="text-gray-400 mr-2" size={16} />
                      <span className="text-gray-900 dark:text-white">{selectedComplaint.apartment_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Home className="text-gray-400 mr-2" size={16} />
                      <span className="text-gray-900 dark:text-white">
                        Floor {selectedComplaint.floor_number} • House {selectedComplaint.house_number}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                     Dates
                  </h4>
                  <div className="space-y-2">
                    {/* <div className="flex items-center">
                      {getCategoryIcon(selectedComplaint.category)}
                      <span className="ml-2 text-gray-900 dark:text-white">{selectedComplaint.category}</span>
                    </div> */}
                    <div className="text-sm">
                      <div className="text-gray-900 dark:text-white">
                        Filed: {new Date(selectedComplaint.created_at).toLocaleString()}
                      </div>
                      {selectedComplaint.resolved_at && (
                        <div className="text-gray-900 dark:text-white">
                          Resolved: {new Date(selectedComplaint.resolved_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Description
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>

              {/* Resolution Note */}
              {/* {selectedComplaint.resolution_note && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Resolution Note
                  </h4>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-green-800 dark:text-green-300 whitespace-pre-wrap">
                      {selectedComplaint.resolution_note}
                    </p>
                  </div>
                </div>
              )} */}

              {/* Assigned To */}
              {/* {selectedComplaint.assigned_to_name && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Assigned To
                  </h4>
                  <div className="flex items-center">
                    <Users className="text-gray-400 mr-2" size={16} />
                    <span className="text-gray-900 dark:text-white">{selectedComplaint.assigned_to_name}</span>
                  </div>
                </div>
              )} */}

              {/* Attachment */}
              {/* {selectedComplaint.attachment_path && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Attachment
                  </h4>
                  <button
                    onClick={() => handleDownloadAttachment(selectedComplaint)}
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Download className="mr-2" size={16} />
                    <span>Download Attachment</span>
                  </button>
                </div>
              )} */}

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}