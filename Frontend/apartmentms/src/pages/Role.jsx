import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Edit, Image, Loader, Plus, Trash2, UserCog } from 'lucide-react';
import api from '../api/axios';
import CreateRoles from '../Roles/CreateRoles';

export default function Role() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingBill, setDeletingBill] = useState(null);

    const loadRoles = async() => {
        try {
        setLoading(true);
        setError(null);
        const result = await api.get('/roles');
        if (result.data.success && Array.isArray(result.data.data)) {
            setRoles(result.data.data);
        } else {
            setRoles([]);
        }
        } catch (err) {
            console.error('Error loading roles:', err);
            setError('Failed to load Roles. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
        loadRoles();
    },[]);

    //create roles
    const handleAddNew = () => {
        setShowCreateModal(true);
    }

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateRole = () => {
        loadRoles();
        setShowCreateModal(false);
    }



  return (
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <Navbar/>
            <div className='flex-1 overflow-y-auto p-6'>
                <div className='mx-auto max-w-7xl'>
                    <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                        <div className='flex items-center'>
                            <UserCog size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Role Management</h1>
                        </div>
                        <div className='flex gap-3'>
                            <button  
                                onClick={handleAddNew}
                                className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                                <Plus size={20}/>
                                <span>Add New</span>
                            </button>
                        </div>
                    </div>
                    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6'>
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <Loader size={32} className="animate-spin text-purple-600" />
                                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading roles...</span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12 text-red-600 dark:text-red-400">
                                {error}
                                <button 
                                    // onClick={loadApartments}
                                    className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : roles.length === 0 ? (
                            <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                                <Image size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-lg">No roles found</p>
                                <p className="text-sm">Get started by adding roles</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {roles.map((role, index) => (
                                            <tr 
                                                key={role.id || index} 
                                                // onClick={() => apartment.is_active && handleFloorView(apartment)} 
                                                className={`transition-colors cursor-pointer ${
                                                    role.is_active 
                                                        ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
                                                        : 'opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {role.role_name}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                    {role.created_at}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            // onClick={(e) => {
                                                            //     e.stopPropagation(); 
                                                            //     handleEdit(apartment);
                                                            // }}
                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                            title="Edit"
                                                        >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            // onClick={(e) => {
                                                            // e.stopPropagation();
                                                            // handleDeleteClick(apartment);
                                                            // }}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
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
        {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                    >
                        ✖
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Add New Bill Type
                    </h2>
                    <CreateRoles
                        onClose={handleCloseModal}
                        onCreated={handleCreateRole}
                    />
                </div>
            </div>
        )}
    </div>
  )
}
