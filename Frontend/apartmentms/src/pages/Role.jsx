import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar';
import { Edit, Image, Loader, Plus, Settings, Trash2, UserCog } from 'lucide-react';
import api from '../api/axios';
import CreateRoles from '../Roles/CreateRoles';
import RoleAssignmentModal from '../Roles/RoleAssignmentModal';
import EditRole from '../Roles/EditRole';
import { toast, ToastContainer } from 'react-toastify';

export default function Role() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingRole, setEditRole] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingRole, setDeletingRole] = useState(null);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false); 
    const [selectedRole, setSelectedRole] = useState(null);


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
    
    //Edit Roles
    const handleEditModal = (role) =>{
        setEditRole(role);
        setShowEditModal(true);
    }

    const handleCloseEditModal = () =>{
        setShowEditModal(false);
         setEditRole(null);
         
    }

    const handleEditRole = () =>{
        toast.success('Role updated successfully!');
        loadRoles();
        setShowEditModal(false);
        setEditRole(null);
    }

    //delete house
        const handleDeleteClick = (role) => {
        setDeletingRole(role);
        setShowDeleteModal(true);
      };
    
      // Update the handleConfirmDelete function in Role.jsx
    const handleConfirmDelete = async () => {
    try {
        if (!deletingRole) return;
        
        const response = await api.delete(`/roles/${deletingRole.id}`);
        
        if (response.data.success) {
        toast.success('Role deleted successfully');
        setShowDeleteModal(false);
        setDeletingRole(null);
        loadRoles();
        } else {
        // Handle cases where the API returns success: false
        toast.error(response.data.message || 'Failed to delete role');
        }
    } catch (err) {
        console.error('Delete role error:', err);
        
        // Check if the error response contains the specific message about users assigned
        if (err.response?.data?.message?.includes('users assigned') || 
            err.response?.data?.message?.includes('Cannot delete role')) {
        toast.error(err.response.data.message);
        } else if (err.response?.data?.message) {
        // Show other error messages from the server
        toast.error(err.response.data.message);
        } else {
        // Generic error message for network issues etc.
        toast.error('Failed to delete role. Please try again.');
        }
        
        // Close the delete modal even on error
        setShowDeleteModal(false);
        setDeletingRole(null);
    }
    };
    
      const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setDeletingRole(null);
      };    

    //Component Assignment
    const handleRoleClick = (role) => {
        setSelectedRole(role);
        setShowAssignmentModal(true);
    };

    // Add this function to handle assignment completion
    const handleAssignmentComplete = (roleId, components) => {
        // You can update local state if needed
        toast.success('Components assigned successfully!');
    };

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };



  return (     
            <div className='flex-1 overflow-y-auto'>                    
                <div className='flex gap-3'>
                    <button  
                        onClick={handleAddNew}
                        className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                        <Plus size={20}/>
                        <span>Add Role</span>
                    </button>
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
                                    onClick={loadRoles}
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
                                                onClick={() => handleRoleClick(role)}
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
                                                    {formatDate(role.created_at)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation(); 
                                                                handleEditModal(role);
                                                            }}
                                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                            title="Edit"
                                                        >
                                                            <Edit size={20} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(role);
                                                            }}
                                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={20} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRoleClick(role);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                            title="Assign Components"
                                                        >
                                                            <Settings size={20} />
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
         {showAssignmentModal && (
            <RoleAssignmentModal
                role={selectedRole}
                onClose={() => setShowAssignmentModal(false)}
                onAssign={handleAssignmentComplete}
            />
        )}

        {/* Edit Role Modal */}
        {showEditModal && editingRole && (
            <EditRole
                role={editingRole}
                onClose={handleCloseEditModal}
                onUpdated={handleEditRole}
            />
        )}
        {showDeleteModal && deletingRole && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Confirm Deletion
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to delete "{deletingRole.role_name}"?
                    </p>
                    <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleCancelDelete}
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                    >
                        Delete
                    </button>
                    </div>
                </div>
            </div>
        )}
        <ToastContainer position="top-center" autoClose={3000} />
    </div>
  )
}
