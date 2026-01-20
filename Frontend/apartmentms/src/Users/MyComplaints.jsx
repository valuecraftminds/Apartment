// MyComplaints.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Plus
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
  const [activeTimers, setActiveTimers] = useState({});
  const intervalRefs = useRef({});
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch technician's assigned complaints with timer status
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
        const complaintsData = response.data.data || [];
        setComplaints(complaintsData);
        if (response.data.statistics) {
          setStatistics(response.data.statistics);
        }
        
        // Initialize timers for complaints that are running
        complaintsData.forEach(complaint => {
          if (complaint.is_timer_running && complaint.work_started_at) {
            startLocalTimer(complaint.id, complaint.total_work_time, complaint.work_started_at);
          }
        });
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

  // Start local timer for UI
  const startLocalTimer = (complaintId, baseSeconds, startTime) => {
    // Clear existing interval if any
    if (intervalRefs.current[complaintId]) {
      clearInterval(intervalRefs.current[complaintId]);
    }
    
    const start = startTime ? new Date(startTime) : new Date();
    const baseTime = baseSeconds || 0;
    
    // Update immediately
    setActiveTimers(prev => ({
      ...prev,
      [complaintId]: {
        baseSeconds: baseTime,
        startTime: start,
        elapsed: baseTime,
        formatted: formatTime(baseTime)
      }
    }));
    
    // Set up interval to update every second
    intervalRefs.current[complaintId] = setInterval(() => {
      const now = new Date();
      const elapsedSeconds = Math.floor((now - start) / 1000) + baseTime;
      
      setActiveTimers(prev => ({
        ...prev,
        [complaintId]: {
          ...prev[complaintId],
          elapsed: elapsedSeconds,
          formatted: formatTime(elapsedSeconds)
        }
      }));
    }, 1000);
  };

  // Stop local timer
  const stopLocalTimer = (complaintId) => {
    if (intervalRefs.current[complaintId]) {
      clearInterval(intervalRefs.current[complaintId]);
      delete intervalRefs.current[complaintId];
    }
    
    setActiveTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[complaintId];
      return newTimers;
    });
  };

  // Handle start timer
  const handleStartTimer = async (complaintId) => {
    try {
      const response = await api.post(`/complaints/${complaintId}/timer/start`, {}, {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      
      if (response.data.success) {
        // Start local timer
        startLocalTimer(complaintId, 0, new Date());
        
        // Update complaint status
        setComplaints(prev => prev.map(complaint => 
          complaint.id === complaintId 
            ? { 
                ...complaint, 
                is_timer_running: true,
                work_started_at: new Date().toISOString(),
                status: 'In Progress'
              }
            : complaint
        ));
        
        // Update statistics
        setStatistics(prev => ({
          ...prev,
          in_progress: prev.in_progress + 1,
          pending: complaints.status === 'Pending' ? prev.pending - 1 : prev.pending
        }));
        
        alert('Timer started! Work in progress.');
      } else {
        alert(response.data.message || 'Failed to start timer');
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      alert(error.response?.data?.message || 'Failed to start timer');
    }
  };

  // Handle pause timer
  const handlePauseTimer = async (complaintId) => {
    try {
      const response = await api.post(`/complaints/${complaintId}/timer/pause`, {}, {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      
      if (response.data.success) {
        // Stop local timer
        stopLocalTimer(complaintId);
        
        // Update complaint status
        setComplaints(prev => prev.map(complaint => 
          complaint.id === complaintId 
            ? { 
                ...complaint, 
                is_timer_running: false,
                work_paused_at: new Date().toISOString(),
                total_work_time: response.data.data?.currentElapsedTime || complaint.total_work_time
              }
            : complaint
        ));
        
        alert('Timer paused.');
      } else {
        alert(response.data.message || 'Failed to pause timer');
      }
    } catch (error) {
      console.error('Error pausing timer:', error);
      alert(error.response?.data?.message || 'Failed to pause timer');
    }
  };

  // Handle resume timer
  const handleResumeTimer = async (complaintId) => {
    try {
      const response = await api.post(`/complaints/${complaintId}/timer/resume`, {}, {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      
      if (response.data.success) {
        // Get current total work time and start local timer
        const complaint = complaints.find(c => c.id === complaintId);
        const baseTime = complaint?.total_work_time || 0;
        startLocalTimer(complaintId, baseTime, new Date());
        
        // Update complaint status
        setComplaints(prev => prev.map(complaint => 
          complaint.id === complaintId 
            ? { 
                ...complaint, 
                is_timer_running: true,
                work_started_at: new Date().toISOString(),
                work_paused_at: null
              }
            : complaint
        ));
        
        alert('Timer resumed.');
      } else {
        alert(response.data.message || 'Failed to resume timer');
      }
    } catch (error) {
      console.error('Error resuming timer:', error);
      alert(error.response?.data?.message || 'Failed to resume timer');
    }
  };

  // Handle stop/complete timer
  const handleStopTimer = async (complaintId) => {
    if (!window.confirm('Are you sure you want to stop the timer and mark this work as completed?')) {
      return;
    }
    
    try {
      const response = await api.post(`/complaints/${complaintId}/timer/stop`, {}, {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
      
      if (response.data.success) {
        // Stop local timer
        stopLocalTimer(complaintId);
        
        // Update complaint status and statistics
        setComplaints(prev => prev.map(complaint => {
          if (complaint.id === complaintId) {
            const totalTime = response.data.data?.currentElapsedTime || complaint.total_work_time;
            return { 
              ...complaint, 
              is_timer_running: false,
              work_started_at: null,
              work_paused_at: null,
              status: 'Resolved',
              resolved_at: new Date().toISOString(),
              total_work_time: totalTime
            };
          }
          return complaint;
        }));
        
        setStatistics(prev => ({
          ...prev,
          resolved: prev.resolved + 1,
          in_progress: prev.in_progress - 1
        }));
        
        alert('Work completed! Total time tracked: ' + formatTime(response.data.data?.currentElapsedTime || 0));
      } else {
        alert(response.data.message || 'Failed to stop timer');
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
      alert(error.response?.data?.message || 'Failed to stop timer');
    }
  };

  // Clean up intervals on component unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach(interval => {
        clearInterval(interval);
      });
    };
  }, []);

  // Fetch complaints on mount and auth change
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

  // Render timer display
  const renderTimerDisplay = (complaint) => {
    const timerData = activeTimers[complaint.id];
    const isTimerRunning = complaint.is_timer_running;
    
    if (isTimerRunning || timerData) {
      const displayTime = timerData?.formatted || formatTime(complaint.total_work_time || 0);
      return (
        <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">
          <Timer size={14} className="text-blue-600 dark:text-blue-400 mr-2 animate-pulse" />
          <span className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
            {displayTime}
          </span>
        </div>
      );
    }
    
    if (complaint.total_work_time > 0) {
      return (
        <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg">
          <Clock size={14} className="text-gray-600 dark:text-gray-400 mr-2" />
          <span className="font-mono text-sm text-gray-700 dark:text-gray-300">
            {formatTime(complaint.total_work_time)}
          </span>
        </div>
      );
    }
    
    return null;
  };

  // Render timer controls
  const renderTimerControls = (complaint) => {
    const isTimerRunning = complaint.is_timer_running;
    const hasWorkStarted = complaint.work_started_at;
    const hasWorkPaused = complaint.work_paused_at;
    
    if (complaint.status === 'Resolved' || complaint.status === 'Closed') {
      return (
        <div className="text-center py-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Completed
          </span>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col sm:flex-row gap-2">
        {!hasWorkStarted && !isTimerRunning ? (
          <button
            onClick={() => handleStartTimer(complaint.id)}
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors"
            title="Start Work Timer"
          >
            <Play size={14} />
            <span>Start Work</span>
          </button>
        ) : isTimerRunning ? (
          <>
            <button
              onClick={() => handlePauseTimer(complaint.id)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition-colors"
              title="Pause Timer"
            >
              <Pause size={14} />
              <span>Pause</span>
            </button>
            <button
              onClick={() => handleStopTimer(complaint.id)}
              className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
              title="Complete Work"
            >
              <StopCircle size={14} />
              <span>Complete</span>
            </button>
          </>
        ) : hasWorkPaused ? (
          <button
            onClick={() => handleResumeTimer(complaint.id)}
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            title="Resume Work"
          >
            <RefreshCw size={14} />
            <span>Resume</span>
          </button>
        ) : null}
      </div>
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
                    View all complaints assigned to you
                  </p>
                </div>
              </div>
              <div className="flex space-x-6 text-right">
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
              </div>
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

                        {/* Timer Display */}
                        <div className="mb-3">
                          {renderTimerDisplay(complaint)}
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

                        {/* Timer Controls */}
                        <div className="mb-4">
                          {renderTimerControls(complaint)}
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
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Timer
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
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
                              {renderTimerDisplay(complaint)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex flex-col space-y-2">
                                {renderTimerControls(complaint)}
                                {/* <button
                                  onClick={() => handleViewComplaint(complaint.id)}
                                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300"
                                >
                                  View Details →
                                </button> */}
                              </div>
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
                              {complaint.work_started_at && (
                                <div className="text-xs text-blue-500 dark:text-blue-400">
                                  Work Started: {formatDate(complaint.work_started_at)}
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