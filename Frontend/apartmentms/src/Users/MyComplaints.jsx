// MyComplaints.jsx
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
  ChevronRight,
  Play,
  Pause,
  StopCircle,
  RefreshCw,
  Timer,
  Plus,
  Tag
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
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
  const [activeTimers, setActiveTimers] = useState({});
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // New state for filtering
  const [apartments, setApartments] = useState([]);
  const [assignedCategories, setAssignedCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch technician's assigned apartments
  const fetchUserApartments = async () => {
    try {
      const response = await api.get(`/user-apartments/users/${auth.user.id}/apartments`);
      
      if (response.data.success) {
        setApartments(response.data.data || []);
      } else {
        toast.error('Failed to load apartments');
        setApartments([]);
      }
    } catch (error) {
      console.error('Error fetching apartments:', error);
      toast.error('Error loading your apartments');
      setApartments([]);
    }
  };

  // Fetch technician's assigned complaint categories
  const fetchAssignedCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get(`/technician-categories/technicians/${auth.user.id}/categories`, {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      
      if (response.data.success) {
        setAssignedCategories(response.data.data || []);
      } else {
        console.error('Failed to load assigned categories:', response.data.message);
        setAssignedCategories([]);
      }
    } catch (error) {
      console.error('Error fetching assigned categories:', error);
      setAssignedCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Get assigned apartment IDs
  const getAssignedApartmentIds = () => {
    return apartments.map(apartment => apartment.apartment_id);
  };

  // Get assigned category IDs
  const getAssignedCategoryIds = () => {
    return assignedCategories.map(category => category.category_id);
  };

  // Update the isComplaintAccessible function
  const isComplaintAccessible = (complaint) => {
      // Get IDs
      const assignedApartmentIds = getAssignedApartmentIds();
      const assignedCategoryIds = getAssignedCategoryIds();
      
      // 1. Check apartment access
      if (!assignedApartmentIds.includes(complaint.apartment_id)) {
          return false;
      }
      
      // 2. Get category ID
      const complaintCategoryId = complaint.category_id;
      
      // 3. Handle category matching
      if (assignedCategoryIds.length === 0) {
          // If no categories assigned, don't show any complaints
          return false;
      }
      
      // If complaint has no category AND we have categories assigned, don't show it
      if (!complaintCategoryId) {
          return false;
      }
      
      // Check if complaint category matches any assigned category
      return assignedCategoryIds.includes(complaintCategoryId);
  };

  // In fetchMyComplaints function
const fetchMyComplaints = async () => {
    try {
        setLoading(true);
        const response = await api.get('/complaints/my-complaints/technician', {
            headers: { 
                Authorization: `Bearer ${auth.accessToken}`
            },
            params: filters
        });
        
        console.log('API Response:', response.data);
        
        if (response.data.success) {
            const accessibleComplaints = response.data.data || [];
            
            console.log('Accessible complaints:', accessibleComplaints);
            
            setComplaints(accessibleComplaints);
            setFilteredComplaints(accessibleComplaints);
            
            if (response.data.statistics) {
                setStatistics(response.data.statistics);
            }
        } else {
            console.error('Failed to load complaints:', response.data.message);
            setComplaints([]);
            setFilteredComplaints([]);
        }
    } catch (error) {
        console.error('Error fetching complaints:', error);
        setComplaints([]);
        setFilteredComplaints([]);
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
      if (auth?.user?.id) {
          const fetchData = async () => {
              await Promise.all([
                  fetchUserApartments(),
                  fetchAssignedCategories()
              ]);
              // Now fetch complaints with updated assignments
              if (auth?.accessToken) {
                  fetchMyComplaints();
              }
          };
          fetchData();
      }
  }, [auth?.user?.id]);

  const handleStartWork = async (complaint) => {
    try {
        // Navigate to StartWork page with complaint data
        navigate(`/start-work/${complaint.id}`, {
            state: { 
                complaint: complaint 
            }
        });
    } catch (error) {
        console.error('Error navigating to start work:', error);
        toast.error('Failed to start work');
    }
};

  // // Fetch data on mount
  // useEffect(() => {
  //   if (auth?.user?.id) {
  //     fetchUserApartments();
  //     fetchAssignedCategories();
  //   }
  // }, [auth?.user?.id]);

  // Fetch complaints when apartments, categories, or filters change
  useEffect(() => {
    if (auth?.accessToken && apartments.length > 0) {
      fetchMyComplaints();
    }
  }, [auth?.accessToken, apartments, filters]);

  // Filter complaints based on search
  useEffect(() => {
    if (!complaints.length) {
      setFilteredComplaints([]);
      return;
    }

    let filtered = complaints.filter(complaint =>
      complaint.complaint_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.houseowner_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.apartment_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredComplaints(filtered);
  }, [complaints, searchTerm]);

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

  const getNoComplaintsMessage = () => {
    if (apartments.length === 0) {
        return 'You are not assigned to any apartments';
    }
    if (assignedCategories.length === 0) {
        return 'You are not assigned to any complaint categories';
    }
    if (searchTerm) {
        return 'No matching complaints found';
    }
    return 'No complaints available for your assigned apartments and categories';
};

  // Get category badge style
  const getCategoryBadge = (complaint) => {
    if (!complaint.category_name && !complaint.category_id) {
      return null;
    }

    const assignedCategory = assignedCategories.find(
      cat => cat.category_id === complaint.category_id
    );

    if (assignedCategory) {
      return (
        <span 
          className="px-2 py-1 text-xs font-medium rounded-full"
          style={{ 
            backgroundColor: `${assignedCategory.category_color}20`,
            color: assignedCategory.category_color
          }}
        >
          {complaint.category_name || 'Uncategorized'}
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        {complaint.category_name || 'Uncategorized'}
      </span>
    );
  };

  // Handle view complaint details
  const handleViewComplaint = (complaintId) => {
    navigate(`/complaints/${complaintId}`);
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: 'all'
    });
    setSearchTerm('');
  };

  // Render Start Work button based on complaint status
  const renderStartWorkButton = (complaint) => {
      if (complaint.status === 'Resolved' || complaint.status === 'Closed') {
          return (
              <div className="text-center py-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                      Completed
                  </span>
              </div>
          );
      }

      if (complaint.status === 'Pending' || complaint.status === 'In Progress' || complaint.is_on_hold) {
          return (
              <button
                  onClick={() => handleStartWork(complaint)}
                  className="flex items-center justify-center gap-1 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors w-full"
                  title={complaint.is_on_hold ? "Resume from Hold" : "Start Work"}
              >
                  <Play size={16} />
                  <span>{complaint.is_on_hold ? "Resume Work" : "Start Work"}</span>
              </button>
          );
      }

      return null;
  };

  // Render access information
  const renderAccessInfo = () => {
    if (loadingCategories) {
      return (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Loading your assigned categories...
          </p>
        </div>
      );
    }

    if (apartments.length === 0 && assignedCategories.length === 0) {
      return (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-600 dark:text-yellow-400 mr-3" size={20} />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                No assignments found
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                You need to be assigned to apartments and categories to see complaints.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Assigned Apartments: {apartments.length}
          </span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Assigned Categories: {assignedCategories.length}
          </span>
        </div>
        
        {assignedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {assignedCategories.slice(0, 3).map(category => (
              <span 
                key={category.category_id}
                className="px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: `${category.category_color}20`,
                  color: category.category_color
                }}
              >
                {category.category_name}
              </span>
            ))}
            {assignedCategories.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400">
                +{assignedCategories.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    );
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
        <Navbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
        
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
                    View complaints from your assigned apartments and categories
                  </p>
                </div>
              </div>
            </div>

            {/* Access Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
              {renderAccessInfo()}
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
                    onChange={(e) => handleFilterChange('status', e.target.value)}
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
              
              {/* Filter Info */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredComplaints.length} of {complaints.length} complaints
                </div>
                {(filters.status !== 'all' || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

              {/* Tabs */}
            {/* <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-4">
              <button
                  onClick={() => setActiveTab("pending")}
                  className={`px-4 py-2 font-semibold 
                      ${activeTab === "pending"
                          ? "text-purple-600 border-b-2 border-purple-600"
                          : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
              >
                  Pending
              </button>
              <button
                  onClick={() => setActiveTab("In Progress")}
                  className={`px-4 py-2 font-semibold 
                      ${activeTab === "In Progress"
                          ? "text-purple-600 border-b-2 border-purple-600"
                          : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
              >
                  In Progress
              </button>
              <button
                  onClick={() => setActiveTab("Resolved")}
                  className={`px-4 py-2 font-semibold 
                      ${activeTab === "Resolved"
                          ? "text-purple-600 border-b-2 border-purple-600"
                          : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
              >
                  Resolved
              </button>
          </div> */}

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
                    {searchTerm ? 'No matching complaints found' : 'No complaints available'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : apartments.length === 0 
                        ? 'You are not assigned to any apartments' 
                        : assignedCategories.length === 0
                          ? 'You are not assigned to any complaint categories'
                          : 'No complaints match your assigned apartments and categories'
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
                                   {complaint.is_on_hold && " (On Hold)"}
                                </span>
                                {getCategoryBadge(complaint)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Location Info */}
                        <div className="mb-3">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Building2 size={14} className="mr-2" />
                            <span className="truncate">
                              {complaint.apartment_name || 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <MapPin size={14} className="mr-2" />
                            <span>
                              Floor {complaint.floor_number} • House {complaint.house_number}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <User size={14} className="mr-2" />
                            <span className="truncate">House Owner: {complaint.houseowner_name || 'Unknown'}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {complaint.description}
                          </p>
                        </div>

                        {/* Start Work Button */}
                        <div className="mb-4">
                          {renderStartWorkButton(complaint)}
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
                          <button
                            onClick={() => handleViewComplaint(complaint.id)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                          >
                            <ChevronRight size={18} />
                          </button>
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
                            Category
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Hold Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Created
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
                              {getCategoryBadge(complaint)}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                                {complaint.status}
                              </span>
                               {complaint.is_on_hold && (
                                <div className="mt-1">
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                                    On Hold
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              {renderStartWorkButton(complaint)}
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