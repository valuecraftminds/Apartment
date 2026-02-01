// EmployeeDashboard.jsx 
import React, { useState, useEffect, useContext } from 'react'
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import Navbar from '../components/navbar'
import Sidebar from '../components/Sidebar'
import { 
  Home, 
  Building2,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Loader
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EmployeeDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [assignedApartments, setAssignedApartments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    assignedApartments: 0,
    pendingTasks: 0,
    completedTasks: 0,
    maintenanceRequests: 0,
    assignedBills: 0,
    totalComplaints: 0,
    complaintCategories: 0
  });
  const { auth } = useContext(AuthContext);

  // Fetch assigned apartments count on component mount
  useEffect(() => {
    if (auth?.user?.id) {
      fetchAssignedApartments();
      fetchDashboardStats();
    }
  }, [auth?.user?.id]);

  // Fetch assigned apartments count
  const fetchAssignedApartments = async () => {
    try {
      setLoading(true);
      // Assuming you have an API endpoint to get employee's assigned apartments
      const response = await api.get(`/user-apartments/users/${auth.user.id}/apartments`);
      
      if (response.data.success) {
        const apartments = response.data.data || [];
        setAssignedApartments(apartments.length);
        setDashboardStats(prev => ({
          ...prev,
          assignedApartments: apartments.length
        }));
      } else {
        toast.error('Failed to load assigned apartments');
      }
    } catch (error) {
      console.error('Error fetching assigned apartments:', error);
      toast.error('Error loading assigned apartments');
    } finally {
      setLoading(false);
    }
  };

  // Fetch other dashboard stats
  const fetchDashboardStats = async () => {
    try {
      // Replace mock values with API calls where possible.
      let pendingTasks = 12;
      let completedTasks = 45;
      let maintenanceRequests = 8;
      let assignedBills = 0;
      let totalComplaints = 0;
      let complaintCategories = 0;

      // Attempt to fetch complaints assigned to this user
      try {
        let complaintsRes = null;
        try {
          complaintsRes = await api.get(`/complaints?assigned_to=${auth.user.id}`);
        } catch (e1) {
          try {
            complaintsRes = await api.get(`/complaints?user_id=${auth.user.id}`);
          } catch (e2) {
            try {
              complaintsRes = await api.get('/complaints');
            } catch (e3) {
              complaintsRes = null;
            }
          }
        }

        const complaints = complaintsRes && (Array.isArray(complaintsRes.data.data) ? complaintsRes.data.data : Array.isArray(complaintsRes.data) ? complaintsRes.data : []);
        totalComplaints = complaints.length;
        // count distinct complaint categories if present on complaint objects
        const categoriesSet = new Set();
        complaints.forEach(c => {
          if (c.category) categoriesSet.add(c.category);
          else if (c.category_id) categoriesSet.add(c.category_id);
        });
        complaintCategories = categoriesSet.size;
      } catch (err) {
        console.error('Error fetching complaints:', err);
      }

      // Attempt to fetch assigned bills for this user
      try {
        let billsRes = null;
        try {
          billsRes = await api.get(`/user-bills/users/${auth.user.id}/bills`);
        } catch (e1) {
          try {
            billsRes = await api.get(`/bills?assigned_to=${auth.user.id}`);
          } catch (e2) {
            billsRes = null;
          }
        }

        const bills = billsRes && (Array.isArray(billsRes.data.data) ? billsRes.data.data : Array.isArray(billsRes.data) ? billsRes.data : []);
        assignedBills = bills.length;
      } catch (err) {
        console.error('Error fetching assigned bills:', err);
      }

      setDashboardStats(prev => ({
        ...prev,
        pendingTasks,
        completedTasks,
        maintenanceRequests,
        assignedBills,
        totalComplaints,
        complaintCategories
      }));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  // Get apartments text
  const getApartmentsText = () => {
    if (assignedApartments === 1) return '1 Apartment Assigned';
    return `${assignedApartments} Apartments Assigned`;
  };

  // Skeleton loader
  const StatSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}>
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Dashboard Header */}
            <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 gap-4'>
              <div className='flex items-center'>
                <Home size={32} className='text-purple-600 dark:text-purple-400 mr-3'/>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Welcome back! Here's your overview for today.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {/* Active Apartments Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Apartments</h3>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(assignedApartments)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">All apartments are active</p>
                </div>
                <div className="flex items-center mt-4">
                  <ArrowUpRight size={14} className="text-green-500 mr-1" />
                  <span className="text-xs lg:text-sm text-green-500">All well maintained</span>
                </div>
              </div>
            </div>

            {/* Assigned totals: show assigned bills and total complaints as a simple grid */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Your Assigned Totals</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Assigned Bills</h3>
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{formatNumber(dashboardStats.assignedBills)}</div>
                  <p className="text-xs text-gray-500">Bills currently assigned to you</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total Complaints</h3>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">{formatNumber(dashboardStats.totalComplaints)}</div>
                  <p className="text-xs text-gray-500">Complaints assigned to you</p>
                </div>
              </div>
            </div>

            {/* Recent Activity removed - summary now shows complaints and assigned bills */}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}