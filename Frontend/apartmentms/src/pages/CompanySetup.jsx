// import React, { useState } from 'react'
// import Sidebar from '../components/sidebar';
// import Navbar from '../components/Navbar';
// import { Building2 } from 'lucide-react';

// export default function CompanySetup() {
//     const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   return (
//     <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
//         <Sidebar onCollapse={setIsSidebarCollapsed} />
//         <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
//             <Navbar/>
//             <div className="flex-1 overflow-y-auto p-6">
//                 <div className="mx-auto max-w-7xl">
//                     <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6">
//                         <div className="flex items-center">
//                             <Building2 size={40} className="text-purple-600 dark:text-purple-400 mr-3" />
//                             <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Company View</h1>
//                         </div>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     </div>
//   )
// }

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Navbar from '../components/Navbar';
import { 
  Building2, 
  MapPin, 
  FileText, 
  Calendar, 
    Edit,
  CheckCircle, 
  XCircle,
  Users,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Trash2,
  AlertCircle,
  Shield
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/axios';

export default function CompanySetup() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Fetch company details
    useEffect(() => {
        fetchCompanyDetails();
    }, []);

    const fetchCompanyDetails = async () => {
        try {
            setLoading(true);
            setError('');
            
            // First, check if there's a logged-in user to get company_id
            const profileResponse = await api.get('/auth/me');
            
            if (profileResponse.data.success && profileResponse.data.data.length > 0) {
                const userData = profileResponse.data.data[0];
                const companyId = userData.company_id;
                
                if (companyId) {
                    // Try to fetch company by ID
                    try {
                        const companyResponse = await api.get(`/tenants/${companyId}`);
                        if (companyResponse.data.success) {
                            setCompany(companyResponse.data.data);
                        }
                    } catch (companyErr) {
                        // If not found by ID, try to get all companies
                        await fetchAllCompanies();
                    }
                } else {
                    // No company_id in user profile, fetch all companies
                    await fetchAllCompanies();
                }
            } else {
                // No user profile, fetch all companies
                await fetchAllCompanies();
            }
        } catch (err) {
            console.error('Error fetching company details:', err);
            setError('Failed to load company information');
            toast.error('Failed to load company details');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllCompanies = async () => {
        try {
            const response = await api.get('/tenants');
                if (response.data.success && response.data.data.length > 0) {
                // Take the first company (or you could show a list)
                const firstCompany = response.data.data[0];
                setCompany(firstCompany);
            } else {
                setCompany(null); // No company found
            }
        } catch (err) {
            console.error('Error fetching all companies:', err);
            throw err;
        }
    };

    const handleDelete = async () => {
        try {
            if (!company) return;
            
            const response = await api.delete(`/tenants/${company.id}`);
            
                if (response.data.success) {
                toast.success('Company deleted successfully');
                setCompany(null);
                setShowDeleteModal(false);
            } else {
                toast.error(response.data.message || 'Failed to delete company');
            }
        } catch (err) {
            console.error('Error deleting company:', err);
            toast.error(err.response?.data?.message || 'Failed to delete company');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
                <Sidebar onCollapse={setIsSidebarCollapsed} />
                <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                    <Navbar/>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="mx-auto max-w-7xl">
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading company details...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
            <Sidebar onCollapse={setIsSidebarCollapsed} />
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Navbar/>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 gap-4">
                            <div className="flex items-center">
                                <Building2 size={40} className="text-purple-600 dark:text-purple-400 mr-3" />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        {company ? 'Company Details' : 'Setup Your Company'}
                                    </h1>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {company ? 'View and manage company information' : 'Register your company to get started'}
                                    </p>
                                </div>
                            </div>
                            
                            {company ? null : (
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">No company registered.</span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                                <div className="flex items-start">
                                    <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 mr-3" size={20} />
                                    <div className="flex-1">
                                        <p className="text-red-700 dark:text-red-300">{error}</p>
                                        <button 
                                            onClick={fetchCompanyDetails}
                                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Company Form/Card */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                                    {company ? (
                                        // View Mode
                                        <>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center">
                                                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                                                        <Building2 size={32} className="text-purple-600 dark:text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                                            {company.name}
                                                        </h2>
                                                        <div className="flex items-center mt-1">
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                Registration: {company.regNo}
                                                            </span>
                                                            <span className="mx-2 text-gray-400">•</span>
                                                            <span className={`flex items-center text-sm ${
                                                                company.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                                                            }`}>
                                                                {company.is_active ? (
                                                                    <>
                                                                        <CheckCircle size={14} className="mr-1" />
                                                                        Active
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <XCircle size={14} className="mr-1" />
                                                                        Inactive
                                                                    </>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Registration Details */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                                                        <FileText className="mr-2 text-purple-600 dark:text-purple-400" size={20} />
                                                        Registration Details
                                                    </h3>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                                Registration Number
                                                            </label>
                                                            <div className="text-lg font-semibold text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                                {company.regNo}
                                                            </div>
                                                        </div>                                                        
                                                    </div>
                                                </div>

                                                {/* Contact Information */}
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                                                        <MapPin className="mr-2 text-purple-600 dark:text-purple-400" size={20} />
                                                        Location Details
                                                    </h3>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                            Company Address
                                                        </label>
                                                        <div className="text-gray-800 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg min-h-[100px]">
                                                            {company.address}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Timestamps */}
                                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                                    <Calendar className="mr-2 text-purple-600 dark:text-purple-400" size={20} />
                                                    Timeline
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                            Created On
                                                        </label>
                                                        <div className="text-gray-800 dark:text-white font-medium">
                                                            {formatDate(company.createdAt || company.created_at)}
                                                        </div>
                                                    </div>
                                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                                            Last Updated
                                                        </label>
                                                        <div className="text-gray-800 dark:text-white font-medium">
                                                            {formatDate(company.updatedAt || company.updated_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Danger Zone */}
                                            <div className="mt-8 pt-6 border-t border-red-200 dark:border-red-800">
                                                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                                                    <AlertCircle className="mr-2" size={20} />
                                                    Danger Zone
                                                </h3>
                                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                                        Deleting your company will permanently remove all associated data including users, apartments, and settings. This action cannot be undone.
                                                    </p>
                                                    <button
                                                        onClick={() => setShowDeleteModal(true)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                        <span>Delete Company</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">No Company Found</h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">No company is registered. Please contact your administrator to create a company.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Stats & Actions */}
                            <div className="space-y-6">
                                {/* System Status */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                        System Status
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                                                    <Shield className="text-green-600 dark:text-green-400" size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800 dark:text-white">Database</div>
                                                    <div className="text-sm text-green-600 dark:text-green-400">Connected</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                                                    <Globe className="text-blue-600 dark:text-blue-400" size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-800 dark:text-white">API Service</div>
                                                    <div className="text-sm text-blue-600 dark:text-blue-400">Online</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <AlertCircle size={24} className="text-red-600 dark:text-red-400 mr-3" />
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                    Confirm Deletion
                                </h3>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-gray-600 dark:text-gray-300 mb-2">
                                    Are you sure you want to delete <span className="font-semibold">{company?.name}</span>?
                                </p>
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        ⚠️ This action will permanently delete:
                                    </p>
                                    <ul className="text-sm text-red-600 dark:text-red-400 mt-2 space-y-1">
                                        <li>• All company data and settings</li>
                                        <li>• All user accounts</li>
                                        <li>• All apartments and houses</li>
                                        <li>• All complaints and records</li>
                                    </ul>
                                    <p className="text-sm text-red-700 dark:text-red-300 mt-3 font-semibold">
                                        This action cannot be undone!
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Delete Company
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
