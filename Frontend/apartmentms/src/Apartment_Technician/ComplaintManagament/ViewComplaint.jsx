//ViewComplaint.jsx
import React, { useState, useEffect, useContext } from 'react';

import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Filter, 
  Download, 
  Edit, 
  Trash2,
  Plus,
  User,
  Search,
  ChevronDown,
  Wrench,
  Calendar,
  MapPin,
  Home,
  Building2,
  Users,
  Shield,
  Settings,
  Check,
  X
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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [assignmentNote, setAssignmentNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    apartment_id: 'all',
    assigned: 'all'
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0
  });
  const { auth } = useContext(AuthContext);
  const [categories, setCategories] = useState(['General', 'Water', 'Electricity', 'Gas']);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [apartmentMap, setApartmentMap] = useState({});

  const loadApartments = async () => {
        try {
            setLoadingApartments(true);
            const result = await api.get('/apartments');
            if (result.data.success) {
                setApartments(result.data.data || []);
                // Also update apartment map
                const apartmentData = {};
                result.data.data.forEach(apt => {
                    apartmentData[apt.id] = apt.name;
                });
                setApartmentMap(apartmentData);
            }
        } catch (err) {
            console.error('Error loading apartments:', err);
            toast.error('Failed to load apartments');
        } finally {
            setLoadingApartments(false);
        }
    };

    useEffect(() => {
        loadApartments();
    }, []);
  
//   const fetchComplaints = async () => {
//     try {
//         setLoading(true);
//         const res = await api.get('/complaints', {
//             headers: { 
//                 Authorization: `Bearer ${auth.accessToken}`
//             },
//             params: filters
//         });
        
//         if (res.data.success) {
//             setComplaints(res.data.data || []);
//             setFilteredComplaints(res.data.data || []);
//             calculateStatistics(res.data.data || []);
//             if (res.data.categories) {
//                 setCategories(res.data.categories);
//             }
//         }
//     } catch (err) {
//         console.error('Failed to fetch complaints:', err);
//     } finally {
//         setLoading(false);
//     }
// };

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
                
                // Always include 'General' as an option
                if (!uniqueCategories.includes('General')) {
                    uniqueCategories.unshift('General');
                }
                
                setCategories(uniqueCategories);
            }
        }
    } catch (err) {
        console.error('Failed to fetch complaints:', err);
    } finally {
        setLoading(false);
    }
};

  // Fetch technicians
const fetchTechnicians = async (category = '') => {
    try {
        const params = {};
        if (category) {
            params.category = category;
        }
        
        const res = await api.get('/complaints/technicians/category', {
            headers: { 
                Authorization: `Bearer ${auth.accessToken}`
            },
            params: params
        });
        
        if (res.data.success) {
            // Map the data to include proper name field
            const techs = res.data.data.map(tech => ({
                ...tech,
                // Use the 'name' field from database or combine firstname/lastname
                name: tech.name || `${tech.firstname || ''} ${tech.lastname || ''}`.trim()
            }));
            setTechnicians(techs);
        }
    } catch (err) {
        console.error('Failed to fetch technicians:', err);
    }
};

  useEffect(() => {
    if (auth.accessToken) {
      fetchComplaints();
      fetchTechnicians();
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
        complaint.complaint_number.toLowerCase().includes(term) ||
        complaint.title.toLowerCase().includes(term) ||
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

    // Apply assigned filter
    if (filters.assigned !== 'all') {
      if (filters.assigned === 'assigned') {
        filtered = filtered.filter(complaint => complaint.assigned_to);
      } else if (filters.assigned === 'unassigned') {
        filtered = filtered.filter(complaint => !complaint.assigned_to);
      }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Emergency':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Add this useEffect to update categories from complaints data
useEffect(() => {
    if (complaints.length > 0) {
        // Extract unique categories from complaints
        const uniqueCategories = [...new Set(
            complaints
                .map(c => c.category)
                .filter(category => category && category.trim() !== '')
                .sort()
        )];
        
        // Always include 'General' if not present
        if (uniqueCategories.length > 0 && !uniqueCategories.includes('General')) {
            uniqueCategories.unshift('General');
        }
        
        if (uniqueCategories.length > 0) {
            setCategories(uniqueCategories);
        }
    }
}, [complaints]);

  // Update the handleAssignComplaint function
const handleAssignComplaint = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedTechnician(null);
    setAssignmentNote('');
    
    // Set category from complaint or default
    const complaintCategory = complaint.category || 'General';
    setSelectedCategory(complaintCategory);
    
    // Fetch technicians for this category
    fetchTechnicians(complaintCategory);
    
    setShowAssignModal(true);
};

  const handleSubmitAssignment = async () => {
    if (!selectedTechnician) {
      alert('Please select a technician');
      return;
    }

    try {
      const res = await api.patch(`/complaints/${selectedComplaint.id}/assign`, {
        technician_id: selectedTechnician.id,
        assignment_note: assignmentNote
      }, {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });

      if (res.data.success) {
        setShowAssignModal(false);
        fetchComplaints();
        alert('Complaint assigned successfully!');
      }
    } catch (err) {
      console.error('Failed to assign complaint:', err);
      alert(err.response?.data?.message || 'Failed to assign complaint');
    }
  };

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
        alert('Status updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert(err.response?.data?.message || 'Failed to update status');
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
        case 'general':
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};

  // You'll need to add this API endpoint in your backend
  // router.patch('/:id/assign', authenticateToken, complaintController.assignComplaint);

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
                    Manage and assign complaints to technicians
                  </p>
                </div>
              </div>
              
              {/* <div className="flex items-center space-x-3">
                <button 
                  onClick={() => window.location.href = '/complaints/reports'}
                  className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow transition-all duration-300 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                >
                  <FileText size={20} />
                  <span>Generate Report</span>
                </button>
              </div> */}
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
              <Search className="absolute left-3 top-1/3 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by complaint number, title, or house owner..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-gray-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 text-sm border text-gray-500 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
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
            {/* Apartment Filter - You'll need to fetch apartments first */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Apartment
              </label>
              <select
                value={filters.apartment_id}
                onChange={(e) => setFilters(prev => ({ ...prev, apartment_id: e.target.value }))}
                className="w-full px-3 py-2 text-sm border text-gray-500 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              >
                 <option value="all">All Apartments</option>
                  {apartments.map((apartment) => (
                      <option key={apartment.id} value={apartment.id}>
                          {apartment.name}
                      </option>
                  ))}
              </select>
            </div>

            {/* Assigned Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Assignment Status
              </label>
              <select
                value={filters.assigned}
                onChange={(e) => setFilters(prev => ({ ...prev, assigned: e.target.value }))}
                className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Complaints</option>
                <option value="assigned">Assigned Only</option>
                <option value="unassigned">Unassigned Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Category
                </label>
                <select
                    value={filters.category || 'all'}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    status: 'all',
                    apartment_id: 'all',
                    assigned: 'all'
                  });
                }}
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
                      Assigned To
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
                          <div className="flex items-center mt-1">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(complaint.category)}`}>
                                  {complaint.category || 'General'}
                              </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            By: {complaint.houseowner_name || 'Unknown'}
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
                        {complaint.assigned_to_name ? (
                          <div className="flex items-center">
                            <User size={14} className="text-gray-400 mr-1" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {complaint.assigned_to_name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAssignComplaint(complaint)}
                            className="p-2 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg"
                            title="Assign to Technician"
                          >
                            <Plus size={16} />
                          </button>
                          {complaint.status === 'In Progress' && (
                          <button
                            onClick={() => handleUpdateStatus(complaint.id, 'Resolved')}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                            title="Mark as Resolved"
                          >
                            <Clock size={16} />
                          </button>
                          )}
                          {complaint.status === 'Resolved' && (
                          <button
                            onClick={() => handleUpdateStatus(complaint.id, 'Closed')}
                            className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg"
                            title="Mark as Closed"
                          >
                            <Check size={16} />
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

        {/* Assign to Technician Modal */}
        {showAssignModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                  <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                              Assign Complaint
                          </h2>
                          <button
                              onClick={() => setShowAssignModal(false)}
                              className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                          >
                              ✖
                          </button>
                      </div>

                      {/* Complaint Info */}
                      <div className="mb-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                              {selectedComplaint.complaint_number}: {selectedComplaint.title}
                          </h3>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>Location: {selectedComplaint.apartment_name}, Floor {selectedComplaint.floor_number}, House {selectedComplaint.house_number}</p>
                              <p>Submitted by: {selectedComplaint.houseowner_name}</p>
                              <div className="flex items-center mt-2">
                                  <span className="mr-2">Category:</span>
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedComplaint.category || 'General')}`}>
                                      {selectedComplaint.category || 'General'}
                                  </span>
                              </div>
                          </div>
                      </div>

                      {/* Category Selection */}
                      <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Complaint Category
                          </label>
                          <select
                              value={selectedCategory}
                              onChange={(e) => {
                                  setSelectedCategory(e.target.value);
                                  fetchTechnicians(e.target.value);
                                  setSelectedTechnician(null);
                              }}
                              className="w-full px-3 py-2 border text-gray-500 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                          >
                              {/* {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))} */}
                            <option value="General">General</option>
                            <option value="Water">Water</option>
                            <option value="Electricity">Electricity</option>
                            <option value="Gas">Gas</option>
                          </select>
                      </div>

                      {/* Technician Selection */}
                      <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Select Technician *
                          </label>
                          {technicians.length === 0 ? (
                              <div className="text-center py-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                                  <User className="mx-auto text-gray-400 mb-2" size={24} />
                                  <p className="text-gray-500 dark:text-gray-400">No technicians available for {selectedCategory}</p>
                                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                      Add technicians in the Users section first
                                  </p>
                              </div>
                          ) : (
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {technicians.map((tech) => (
                                    <div
                                        key={tech.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedTechnician?.id === tech.id
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => setSelectedTechnician(tech)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {tech.name || `${tech.firstname} ${tech.lastname}`}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {tech.role_name || tech.role} 
                                                    {tech.specialization ? ` • ${tech.specialization}` : ''}
                                                </p>
                                                {tech.mobile && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                        📱 {tech.mobile}
                                                    </p>
                                                )}
                                            </div>
                                            {selectedTechnician?.id === tech.id && (
                                                <Check className="text-purple-600 dark:text-purple-400" size={20} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                              </div>
                          )}
                      </div>

                      {/* Assignment Note */}
                      <div className="mb-6">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Assignment Note (Optional)
                          </label>
                          <textarea
                              value={assignmentNote}
                              onChange={(e) => setAssignmentNote(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border text-gray-500 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                              placeholder="Add any specific instructions or notes for the technician..."
                          />
                      </div>

                      {/* Submit Button */}
                      <div className="flex justify-end space-x-3">
                          <button
                              type="button"
                              onClick={() => setShowAssignModal(false)}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                              Cancel
                          </button>
                          <button
                              onClick={handleSubmitAssignment}
                              disabled={!selectedTechnician}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Assign Complaint
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
        </div>
      </div>
    </div>
  );
}