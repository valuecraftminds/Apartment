// pages/BulkEmailVerification.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Mail, Check, Clock, UserX, Send, UserCheck } from 'lucide-react';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';

export default function BulkEmailVerification() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [houseOwners, setHouseOwners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [selectedOwners, setSelectedOwners] = useState({});
    const [selectAll, setSelectAll] = useState(false);

    // Load house owners on component mount
    useEffect(() => {
        // Load only unverified house owners on mount
        loadHouseOwners();
    }, []);

    const loadHouseOwners = async () => {
        try {
            setLoading(true);
            // Request server for only unverified owners
            const response = await api.get(`/houseowner?filter=unverified`);

            if (response.data.success) {
                const owners = response.data.data || [];
                setHouseOwners(owners);

                // Reset selection
                setSelectedOwners({});
                setSelectAll(false);
            }
        } catch (err) {
            console.error('Error loading house owners:', err);
            toast.error('Failed to load house owners');
        } finally {
            setLoading(false);
        }
    };

    // simplified: we directly use `houseOwners` (server returns unverified only)

    const handleSelectOwner = (ownerId) => {
        setSelectedOwners(prev => ({
            ...prev,
            [ownerId]: !prev[ownerId]
        }));
    };

    const handleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);

        const newSelected = {};
        if (newSelectAll) {
            houseOwners.forEach(owner => {
                // server returns unverified owners only, but guard anyway
                if (!owner.is_verified) {
                    newSelected[owner.id] = true;
                }
            });
        }
        setSelectedOwners(newSelected);
    };

    const getSelectedCount = () => {
        return Object.keys(selectedOwners).filter(id => selectedOwners[id]).length;
    };

    const sendVerificationEmails = async () => {
        const selectedIds = Object.keys(selectedOwners).filter(id => selectedOwners[id]);
        
        if (selectedIds.length === 0) {
            toast.error('Please select at least one house owner');
            return;
        }

        try {
            setSending(true);
            
            // Filter to only unverified owners (server should have returned only these)
            const unverifiedIds = selectedIds.filter(id => {
                const owner = houseOwners.find(o => o.id === id);
                return owner && !owner.is_verified;
            });

            if (unverifiedIds.length === 0) {
                toast.warning('Selected owners are already verified');
                return;
            }

            // Send bulk verification request
            const response = await api.post('/house-owners/bulk/send-verification-bulk', {
                owner_ids: unverifiedIds
            });

            if (response.data.success) {
                toast.success(`Verification emails sent to ${unverifiedIds.length} house owner(s)`);
                
                // Refresh the list
                loadHouseOwners();
                
                // Clear selection
                setSelectedOwners({});
                setSelectAll(false);
            }
        } catch (err) {
            console.error('Error sending verification emails:', err);
            toast.error(err.response?.data?.message || 'Failed to send verification emails');
        } finally {
            setSending(false);
        }
    };

    const sendSingleVerificationEmail = async (ownerId, email) => {
        try {
            const response = await api.post('/house-owners/bulk/send-verification', {
                owner_id: ownerId,
                email: email
            });

            if (response.data.success) {
                toast.success(`Verification email sent to ${email}`);
                loadHouseOwners();
            }
        } catch (err) {
            console.error('Error sending verification email:', err);
            toast.error('Failed to send verification email');
        }
    };

    // No pagination: server returns small set of unverified owners

    const getVerificationStatus = (owner) => {
        if (owner.is_verified) {
            return { text: 'Verified', icon: <Check className="h-4 w-4" />, color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
        } else {
            return { text: 'Unverified', icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        }
    };

    return (
        <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
            <Sidebar onCollapse={setIsSidebarCollapsed}/>
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Navbar/>
                <div className='flex-1 overflow-y-auto p-6'>
                    <div className='mx-auto max-w-7xl'>
                        {/* Header */}
                        <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6'>
                            <div className='flex items-center'>
                                <Mail size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Bulk Email Verification
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        Send verification emails to unverified house owners
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                
                                <button
                                    onClick={sendVerificationEmails}
                                    disabled={sending || getSelectedCount() === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {sending ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            <span>Send Verification ({getSelectedCount()})</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Simplified: directly showing unverified house owners */}

                        {/* House Owners Table */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading house owners...</p>
                                </div>
                            ) : houseOwners.length === 0 ? (
                                <div className="text-center py-12">
                                    <UserX className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">No house owners found</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-900">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectAll}
                                                            onChange={handleSelectAll}
                                                            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                                        />
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        House Owner
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Contact Info
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Last Login
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {houseOwners.map((owner) => {
                                                    const status = getVerificationStatus(owner);
                                                    return (
                                                        <tr key={owner.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!selectedOwners[owner.id]}
                                                                    onChange={() => handleSelectOwner(owner.id)}
                                                                    disabled={owner.is_verified}
                                                                    className={`h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 ${owner.is_verified ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                                />
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="h-10 w-10 flex-shrink-0">
                                                                        <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                                                                            <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                            {owner.name}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                            NIC: {owner.NIC || 'Not provided'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900 dark:text-white">
                                                                    {owner.email}
                                                                </div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {owner.mobile || 'No phone'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                                    {status.icon}
                                                                    {status.text}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                                {owner.last_login 
                                                                    ? new Date(owner.last_login).toLocaleDateString()
                                                                    : 'Never'
                                                                }
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                {!owner.is_verified && (
                                                                    <button
                                                                        onClick={() => sendSingleVerificationEmail(owner.id, owner.email)}
                                                                        className="inline-flex items-center gap-1 px-3 py-1 border border-transparent text-xs font-medium rounded-lg text-green-700 bg-green-100 hover:bg-green-200 dark:text-green-300 dark:bg-green-900 dark:hover:bg-green-800 transition-colors"
                                                                    >
                                                                        <Send className="h-3 w-3" />
                                                                        Send Email
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* no pagination */}
                                </>
                            )}
                        </div>

        
                    </div>
                </div>
            </div>
            <ToastContainer position='top-center' autoClose={3000}/>
        </div>
    );
}