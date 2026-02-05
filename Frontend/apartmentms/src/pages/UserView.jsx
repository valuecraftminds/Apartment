// import React, { useState, useEffect, useContext } from 'react';
// import Sidebar from '../components/Sidebar';
// import Navbar from '../components/navbar';
// import { Plus, Users, Loader, Edit, Trash2, User, Send, ToggleLeft, ToggleRight, Building2 } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import api from '../api/axios';
// import { AuthContext } from '../contexts/AuthContext';
// import CreateUser from '../Users/CreateUser';
// import EditUser from '../Users/EditUser';
// import UserApartmentsModal from '../Users/UserApartmentModal';
// import Role from './Role';

// export default function UserView() {
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [roles, setRoles] = useState([]); // Add roles state
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showToggleModal, setShowToggleModal] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [togglingUser, setTogglingUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [rolesLoading, setRolesLoading] = useState(true); // Add roles loading state
//   const [error, setError] = useState(null);
//   const { auth } = useContext(AuthContext);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [deletingUser, setDeletingUser] = useState(null); 
//    const [showAssignModal, setShowAssignModal] = useState(false);
//   const [assigningUser, setAssigningUser] = useState(null); 
//   const [activeTab, setActiveTab] = useState("users");

//   // Load users and roles
//   const loadUsers = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const result = await api.get('/auth/users');

//       if (result.data.success && Array.isArray(result.data.data)) {
//         setUsers(result.data.data);
//       } else {
//         console.warn('Unexpected response format:', result.data);
//         setUsers([]);
//       }
//     } catch (err) {
//       console.error('Error in fetching users:', err);
//       setError('Failed to load users. Please try again.');
//       toast.error('Failed to fetch users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load roles from the roles API
//   const loadRoles = async () => {
//     try {
//       setRolesLoading(true);
//       const result = await api.get('/roles');
//       if (result.data.success && Array.isArray(result.data.data)) {
//         setRoles(result.data.data);
//       } else {
//         setRoles([]);
//       }
//     } catch (err) {
//       console.error('Error loading roles:', err);
//       toast.error('Failed to load roles');
//     } finally {
//       setRolesLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadUsers();
//     loadRoles(); // Load roles when component mounts
//   }, []);

//   const handleAddNew = () => setShowCreateModal(true);
//   const handleCloseModal = () => setShowCreateModal(false);
  
//   const handleEditClick = (user) => {
//     setEditingUser(user);
//     setShowEditModal(true);
//   };

//   const handleEditModalClose = () => {
//     setShowEditModal(false);
//     setEditingUser(null);
//   };

//   const handleToggleClick = (user) => {
//     setTogglingUser(user);
//     setShowToggleModal(true);
//   };

//   const handleToggleModalClose = () => {
//     setShowToggleModal(false);
//     setTogglingUser(null);
//   };

//   const handleUserCreated = () => {
//     loadUsers();
//     setShowCreateModal(false);
//     toast.success('User created successfully!');
//   };

//   const handleUserUpdated = () => {
//     loadUsers();
//     setShowEditModal(false);
//     setEditingUser(null);
//   };

//   const [sendVerificationLoading, setSendVerificationLoading] = useState(false);

//   const handleSendVerification = async (user) => {
//   try {
//     setSendVerificationLoading(true);
//     await api.post('/auth/resend', { email: user.email });
//     toast.success('Verification email sent successfully!');
//   } catch (err) {
//     console.error('Error sending verification email:', err);
//     toast.error(err.response?.data?.message || 'Failed to send verification email');
//   } finally {
//     setSendVerificationLoading(false);
//   }
// };

//   const handleToggleUser = async () => {
//     if (!togglingUser) return;

//     try {
//       await api.patch(`/auth/users/${togglingUser.id}/toggle`);
//       toast.success(`User ${togglingUser.is_active ? 'deactivated' : 'activated'} successfully!`);
//       loadUsers();
//       handleToggleModalClose();
//     } catch (err) {
//       console.error('Error toggling user:', err);
//       toast.error('Failed to update user status');
//     }
//   };

//   // Delete user
//   const handleDeleteClick = (user) => {
//     setDeletingUser(user);
//     setShowDeleteModal(true);
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       if (!deletingUser) return;
//       await api.delete(`/auth/users/${deletingUser.id}`);
//       toast.success('User deleted successfully');
//       setShowDeleteModal(false);
//       setDeletingUser(null);
//       loadUsers();
//     } catch (err) {
//       console.error('Delete user error:', err);
//       if (err.response?.data?.message) {
//         toast.error(err.response.data.message);
//       } else {
//         toast.error('Failed to delete user');
//       }
//     }
//   };

//   const handleCancelDelete = () => {
//     setShowDeleteModal(false);
//     setDeletingUser(null);
//   };

//   // Format date for display
//   const formatDate = (dateString) => {
//     try {
//       return new Date(dateString).toLocaleDateString();
//     } catch {
//       return 'N/A';
//     }
//   };

//   const handleAssignClick = (user) => {
//     setAssigningUser(user);
//     setShowAssignModal(true);
//   };

//   const handleAssignModalClose = () => {
//     setShowAssignModal(false);
//     setAssigningUser(null);
//   };

//   const handleAssignSuccess = () => {
//     // Optional: Refresh user data or show success message
//     toast.success('Apartments assigned successfully!');
//   };


//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
//       <Sidebar onCollapse={setIsSidebarCollapsed} />
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
//         <Navbar />
//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="mx-auto max-w-7xl">
//             <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6">
//               <div className="flex items-center">
//                 <Users size={40} className="text-purple-600 dark:text-purple-400 mr-3" />
//                 <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Users Management</h1>
//               </div>
//             </div>

//             <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-4">
//               <button
//                   onClick={() => setActiveTab("users")}
//                   className={`px-4 py-2 font-semibold 
//                       ${activeTab === "users"
//                           ? "text-purple-600 border-b-2 border-purple-600"
//                           : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
//               >
//                   User Info
//               </button>
//               <button
//                   onClick={() => setActiveTab("roles")}
//                   className={`px-4 py-2 font-semibold 
//                       ${activeTab === "roles"
//                           ? "text-purple-600 border-b-2 border-purple-600"
//                           : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
//               >
//                   User Roles 
//               </button>
//           </div>

//           {activeTab === "users" && (
//             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
//               <div className="flex items-center justify-between mb-6">
//               <button
//                 onClick={handleAddNew}
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105"
//               >
//                 <Plus size={20} />
//                 <span>Add User</span>
//               </button>
//               </div>
//               {loading ? (
//                 <div className="flex justify-center items-center py-12">
//                   <Loader size={32} className="animate-spin text-purple-600" />
//                   <span className="ml-2 text-gray-600 dark:text-gray-300">Loading Users...</span>
//                 </div>
//               ) : error ? (
//                 <div className="text-center py-12 text-red-600 dark:text-red-400">
//                   {error}
//                   <button onClick={loadUsers} className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
//                     Retry
//                   </button>
//                 </div>
//               ) : users.length === 0 ? (
//                 <div className="text-center py-12 text-gray-600 dark:text-gray-300">
//                   <User size={48} className="mx-auto mb-4 text-gray-400" />
//                   <p className="text-lg">No users found</p>
//                   <p className="text-sm">Get started by adding your first user</p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   <table className="w-full table-auto">
//                     <thead className="bg-gray-100 dark:bg-gray-700">
//                       <tr>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">First Name</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Name</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mobile</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
//                         <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
//                       </tr>
//                     </thead>

//                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                       {users.map((user, index) => {
//                         const isCurrentUser = user.email === auth?.user?.email || user.id === auth?.user?.id;

//                         return (
//                           <tr
//                             key={user.id ?? index}
//                             className={`transition-colors ${
//                               !user.is_active 
//                                 ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
//                                 : isCurrentUser 
//                                   ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
//                                   : 'hover:bg-gray-50 dark:hover:bg-gray-700'
//                             }`}
//                           >
//                             <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                               {user.firstname || 'N/A'}
//                             </td>

//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
//                               {user.lastname || 'N/A'}
//                             </td>

//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
//                               <div className="flex items-center">
//                                 <span>{user.email}</span>
//                                 {!user.is_verified && (
//                                   <button
//                                       onClick={() => handleSendVerification(user)}
//                                       disabled={isCurrentUser || !user.is_active || sendVerificationLoading}
//                                       className={`ml-2 p-1 rounded ${
//                                         isCurrentUser || !user.is_active || sendVerificationLoading
//                                           ? 'text-gray-400 cursor-not-allowed'
//                                           : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
//                                       }`}
//                                       title="Send verification email"
//                                     >
//                                       {sendVerificationLoading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
//                                     </button>
//                                 )}
//                               </div>
//                             </td>

//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
//                               {user.country || 'N/A'}
//                             </td>

//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
//                               {user.mobile || 'N/A'}
//                             </td>

//                             <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
//                               {user.role || 'N/A'}
//                             </td>

//                             <td className="px-4 py-4 whitespace-nowrap">
//                               <div className="flex flex-col gap-1">
//                                 <span
//                                   className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                                     user.is_verified
//                                       ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//                                       : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
//                                   }`}
//                                 >
//                                   {user.is_verified ? 'Verified' : 'Pending'}
//                                 </span>

//                                 <span
//                                   className={`px-2 py-1 text-xs font-semibold rounded-full ${
//                                     user.is_active
//                                       ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//                                       : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
//                                   }`}
//                                 >
//                                   {user.is_active ? 'Active' : 'Inactive'}
//                                 </span>
//                               </div>
//                             </td>
                            
//                             <td className="whitespace-nowrap text-sm font-medium">
//                               <div className="flex">
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleAssignClick(user);
//                                   }}
//                                   disabled={isCurrentUser || !user.is_active}
//                                   className={`flex items-center justify-center w-8 h-8 rounded ${
//                                     isCurrentUser || !user.is_active
//                                       ? 'text-gray-400 cursor-not-allowed bg-transparent'
//                                       : 'text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300'
//                                   }`}
//                                   title={isCurrentUser ? "You can't assign to your own account" : !user.is_active ? "Cannot assign to inactive user" : 'Assign Apartments'}
//                                 >
//                                   <Building2 size={20} />
//                                 </button>
//                                 <button
//                                   onClick={() => handleEditClick(user)}
//                                   disabled={isCurrentUser || !user.is_active}
//                                   className={`flex items-center justify-center w-8 h-8 rounded ${
//                                     isCurrentUser || !user.is_active
//                                       ? 'text-gray-400 cursor-not-allowed bg-transparent'
//                                       : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
//                                   }`}
//                                   title={isCurrentUser ? "You can't edit your own account" : !user.is_active ? "Cannot edit inactive user" : 'Edit'}
//                                 >
//                                   <Edit size={20} />
//                                 </button>

//                                 <button
//                                   onClick={() => handleToggleClick(user)}
//                                   disabled={isCurrentUser}
//                                   className={`flex items-center justify-center w-8 h-8 rounded ${
//                                     isCurrentUser
//                                       ? 'text-gray-400 cursor-not-allowed bg-transparent'
//                                       : user.is_active
//                                         ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
//                                         : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
//                                   }`}
//                                   title={isCurrentUser ? "You can't modify your own account" : user.is_active ? 'Deactivate' : 'Activate'}
//                                 >
//                                   {user.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
//                                 </button>

//                                 <button
//                                  onClick={(e) => {
//                                     e.stopPropagation();
//                                    handleDeleteClick(user);
//                                 }}
//                                   disabled={isCurrentUser || !user.is_active}
//                                   className={`flex items-center justify-center w-8 h-8 rounded ${
//                                     isCurrentUser || !user.is_active
//                                       ? 'text-gray-400 cursor-not-allowed bg-transparent'
//                                       : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
//                                   }`}
//                                   title={isCurrentUser ? "You can't delete your own account" : !user.is_active ? "Cannot delete inactive user" : 'Delete'}
//                                 >
//                                   <Trash2 size={20} />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           )}
//           {activeTab === "roles" && (
//             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
//               <Role/>
//             </div>
//           )}
//           </div>
//         </div>
//       </div>

//       {/* Create User Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
//             <button onClick={handleCloseModal} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">
//               ✖
//             </button>
//             <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Create New User</h2>
//             <CreateUser 
//               onClose={handleCloseModal} 
//               onCreated={handleUserCreated} 
//               roles={roles} // Pass roles to CreateUser
//               rolesLoading={rolesLoading}
//             />
//           </div>
//         </div>
//       )}

//       {/* Edit User Modal */}
//       {showEditModal && editingUser && (
//         <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
//             <button onClick={handleEditModalClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">
//               ✖
//             </button>
//             <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Edit User</h2>
//             <EditUser 
//               user={editingUser} 
//               onClose={handleEditModalClose} 
//               onUpdated={handleUserUpdated} 
//               roles={roles} // Pass roles to EditUser
//               rolesLoading={rolesLoading}
//             />
//           </div>
//         </div>
//       )}

//       {/* Toggle Confirmation Modal */}
//       {showToggleModal && togglingUser && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
//             <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
//               {togglingUser.is_active ? "Confirm Deactivation" : "Confirm Activation"}
//             </h2>
//             <p className="text-gray-600 dark:text-gray-300 mb-6">
//               {togglingUser.is_active 
//                 ? `Are you sure you want to deactivate ${togglingUser.firstname || 'this user'}? They will lose access to the system.`
//                 : `Are you sure you want to activate ${togglingUser.firstname || 'this user'}? They will regain access to the system.`
//               }
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={handleToggleModalClose}
//                 className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleToggleUser}
//                 className={`px-4 py-2 rounded-md text-white transition-colors ${
//                   togglingUser.is_active 
//                     ? "bg-red-600 hover:bg-red-700" 
//                     : "bg-green-600 hover:bg-green-700"
//                 }`}
//               >
//                 {togglingUser.is_active ? "Deactivate" : "Activate"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//       {showDeleteModal && deletingUser && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
//             <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
//               Confirm Deletion
//             </h2>
//             <p className="text-gray-600 dark:text-gray-300 mb-6">
//               Are you sure you want to delete user "{deletingUser.firstname || deletingUser.email}"? 
//               This action cannot be undone.
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={handleCancelDelete}
//                 className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleConfirmDelete}
//                 className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Assign apartments for users */}
//       {showAssignModal && assigningUser && (
//       <UserApartmentsModal
//         user={assigningUser}
//         onClose={handleAssignModalClose}
//         onAssignSuccess={handleAssignSuccess}
//       />
//     )}
//       <ToastContainer position="top-center" autoClose={3000} />
//     </div>
//   );
// }

import React, { useState, useEffect, useContext } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navbar';
import { Plus, Users, Loader, Edit, Trash2, User, Send, ToggleLeft, ToggleRight, Building2, Menu } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import CreateUser from '../Users/CreateUser';
import EditUser from '../Users/EditUser';
import UserApartmentsModal from '../Users/UserApartmentModal';
import Role from './Role';

export default function UserView() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [togglingUser, setTogglingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useContext(AuthContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningUser, setAssigningUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");
  const [sendVerificationLoading, setSendVerificationLoading] = useState(false);

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load users and roles
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.get('/auth/users');

      if (result.data.success && Array.isArray(result.data.data)) {
        setUsers(result.data.data);
      } else {
        console.warn('Unexpected response format:', result.data);
        setUsers([]);
      }
    } catch (err) {
      console.error('Error in fetching users:', err);
      setError('Failed to load users. Please try again.');
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Load roles from the roles API
  const loadRoles = async () => {
    try {
      setRolesLoading(true);
      const result = await api.get('/roles');
      if (result.data.success && Array.isArray(result.data.data)) {
        setRoles(result.data.data);
      } else {
        setRoles([]);
      }
    } catch (err) {
      console.error('Error loading roles:', err);
      toast.error('Failed to load roles');
    } finally {
      setRolesLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const handleAddNew = () => setShowCreateModal(true);
  const handleCloseModal = () => setShowCreateModal(false);
  
  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleToggleClick = (user) => {
    setTogglingUser(user);
    setShowToggleModal(true);
  };

  const handleToggleModalClose = () => {
    setShowToggleModal(false);
    setTogglingUser(null);
  };

  const handleUserCreated = () => {
    loadUsers();
    setShowCreateModal(false);
    toast.success('User created successfully!');
  };

  const handleUserUpdated = () => {
    loadUsers();
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleSendVerification = async (user) => {
    try {
      setSendVerificationLoading(true);
      await api.post('/auth/resend', { email: user.email });
      toast.success('Verification email sent successfully!');
    } catch (err) {
      console.error('Error sending verification email:', err);
      toast.error(err.response?.data?.message || 'Failed to send verification email');
    } finally {
      setSendVerificationLoading(false);
    }
  };

  const handleToggleUser = async () => {
    if (!togglingUser) return;

    try {
      await api.patch(`/auth/users/${togglingUser.id}/toggle`);
      toast.success(`User ${togglingUser.is_active ? 'deactivated' : 'activated'} successfully!`);
      loadUsers();
      handleToggleModalClose();
    } catch (err) {
      console.error('Error toggling user:', err);
      toast.error('Failed to update user status');
    }
  };

  // Delete user
  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!deletingUser) return;
      await api.delete(`/auth/users/${deletingUser.id}`);
      toast.success('User deleted successfully');
      setShowDeleteModal(false);
      setDeletingUser(null);
      loadUsers();
    } catch (err) {
      console.error('Delete user error:', err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingUser(null);
  };

  const handleAssignClick = (user) => {
    setAssigningUser(user);
    setShowAssignModal(true);
  };

  const handleAssignModalClose = () => {
    setShowAssignModal(false);
    setAssigningUser(null);
  };

  const handleAssignSuccess = () => {
    toast.success('Apartments assigned successfully!');
  };

  // Mobile menu button
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileSidebarOpen(true)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg shadow-lg"
    >
      <Menu size={24} />
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <MobileMenuButton />
      
      <Sidebar 
        onCollapse={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
        
        <div className='flex-1 overflow-y-auto p-4 md:p-6'>
          <div className='mx-auto max-w-7xl'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6 gap-4'>
              <div className='flex items-center'>
                <Users size={isMobile ? 32 : 40} className='text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0'/>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
                    Users Management
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                    Manage system users and permissions
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-4 md:mb-6">
              <button
                onClick={() => setActiveTab("users")}
                className={`px-3 md:px-4 py-2 font-semibold text-sm md:text-base ${
                  activeTab === "users"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600"
                }`}
              >
                User Info
              </button>
              <button
                onClick={() => setActiveTab("roles")}
                className={`px-3 md:px-4 py-2 font-semibold text-sm md:text-base ${
                  activeTab === "roles"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600"
                }`}
              >
                User Roles 
              </button>
            </div>

            {activeTab === "users" && (
              <div className='bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6'>
                <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4'>
                  <button
                    onClick={handleAddNew}
                    className='flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105 text-sm md:text-base w-full sm:w-auto'
                  >
                    <Plus size={isMobile ? 16 : 20}/>
                    <span className="whitespace-nowrap">Add User</span>
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 md:py-12">
                    <Loader size={isMobile ? 24 : 32} className="animate-spin text-purple-600" />
                    <span className="ml-2 mt-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                      Loading users...
                    </span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 md:py-12">
                    <div className="text-red-600 dark:text-red-400 text-sm md:text-base mb-4">
                      {error}
                    </div>
                    <button 
                      onClick={loadUsers}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                    >
                      Retry
                    </button>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <User size={isMobile ? 32 : 48} className="mx-auto mb-3 md:mb-4 text-gray-400" />
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-2">
                      No users found
                    </p>
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Get started by adding your first user
                    </p>
                    <button 
                      onClick={handleAddNew}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                    >
                      Create First User
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mobile View - Card Layout */}
                    {isMobile ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Total Users: {users.length}
                            </span>
                            <span className="text-xs text-purple-600 dark:text-purple-400">
                              {users.length} items
                            </span>
                          </div>
                        </div>
                        
                        {users.map((user, index) => {
                          const isCurrentUser = user.email === auth?.user?.email || user.id === auth?.user?.id;

                          return (
                            <div 
                              key={user.id || index} 
                              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center flex-1 min-w-0">
                                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                                    <User size={16} className="text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                                      {user.firstname} {user.lastname}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                      {user.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 ml-2 flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignClick(user);
                                    }}
                                    disabled={isCurrentUser || !user.is_active}
                                    className={`p-2 rounded-lg ${
                                      isCurrentUser || !user.is_active
                                        ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                        : 'text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20'
                                    }`}
                                    title={isCurrentUser ? "You can't assign to your own account" : !user.is_active ? "Cannot assign to inactive user" : 'Assign Apartments'}
                                  >
                                    <Building2 size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditClick(user);
                                    }}
                                    disabled={isCurrentUser || !user.is_active}
                                    className={`p-2 rounded-lg ${
                                      isCurrentUser || !user.is_active
                                        ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                        : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20'
                                    }`}
                                    title={isCurrentUser ? "You can't edit your own account" : !user.is_active ? "Cannot edit inactive user" : 'Edit'}
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleClick(user);
                                    }}
                                    disabled={isCurrentUser}
                                    className={`p-2 rounded-lg ${
                                      isCurrentUser
                                        ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                        : user.is_active
                                          ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20'
                                          : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20'
                                    }`}
                                    title={isCurrentUser ? "You can't modify your own account" : user.is_active ? 'Deactivate' : 'Activate'}
                                  >
                                    {user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mt-3">
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">Role:</span>
                                  <span>{user.role || 'N/A'}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">Mobile:</span>
                                  <span>{user.mobile || 'N/A'}</span>
                                </div>
                                <div className="flex items-center">
                                  <span className="font-medium mr-1">Country:</span>
                                  <span>{user.country || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className="font-medium mr-1">Status:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                                      user.is_active 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    }`}>
                                      {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                  {!user.is_verified && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSendVerification(user);
                                      }}
                                      disabled={isCurrentUser || !user.is_active || sendVerificationLoading}
                                      className={`ml-2 p-1 rounded ${
                                        isCurrentUser || !user.is_active || sendVerificationLoading
                                          ? 'text-gray-400 cursor-not-allowed'
                                          : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                      }`}
                                      title="Send verification email"
                                    >
                                      {sendVerificationLoading ? <Loader size={12} className="animate-spin" /> : <Send size={12} />}
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Delete button - separate row for mobile */}
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(user);
                                  }}
                                  disabled={isCurrentUser || !user.is_active}
                                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm ${
                                    isCurrentUser || !user.is_active
                                      ? 'text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed'
                                      : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20'
                                  }`}
                                  title={isCurrentUser ? "You can't delete your own account" : !user.is_active ? "Cannot delete inactive user" : 'Delete'}
                                >
                                  <Trash2 size={14} />
                                  <span>Delete User</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Desktop View - Table Layout */
                      <div className='overflow-x-auto'>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Users
                            </span>
                            <span className="text-sm text-purple-600 dark:text-purple-400">
                              {users.length} users
                            </span>
                          </div>
                        </div>
                        
                        <table className='w-full table-auto min-w-[640px]'>
                          <thead className='bg-gray-50 dark:bg-gray-700'>
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">First Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Country</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mobile</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user, index) => {
                              const isCurrentUser = user.email === auth?.user?.email || user.id === auth?.user?.id;

                              return (
                                <tr
                                  key={user.id || index}
                                  className={`transition-colors ${
                                    !user.is_active 
                                      ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
                                      : isCurrentUser 
                                        ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                  }`}
                                >
                                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {user.firstname || 'N/A'}
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {user.lastname || 'N/A'}
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center">
                                      <span>{user.email}</span>
                                      {!user.is_verified && (
                                        <button
                                          onClick={() => handleSendVerification(user)}
                                          disabled={isCurrentUser || !user.is_active || sendVerificationLoading}
                                          className={`ml-2 p-1 rounded ${
                                            isCurrentUser || !user.is_active || sendVerificationLoading
                                              ? 'text-gray-400 cursor-not-allowed'
                                              : 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300'
                                          }`}
                                          title="Send verification email"
                                        >
                                          {sendVerificationLoading ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                                        </button>
                                      )}
                                    </div>
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {user.country || 'N/A'}
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {user.mobile || 'N/A'}
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                    {user.role || 'N/A'}
                                  </td>

                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="flex flex-col gap-1">
                                      <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                          user.is_verified
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                        }`}
                                      >
                                        {user.is_verified ? 'Verified' : 'Pending'}
                                      </span>

                                      <span
                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                          user.is_active
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}
                                      >
                                        {user.is_active ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                  </td>
                                  
                                  <td className="whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAssignClick(user);
                                        }}
                                        disabled={isCurrentUser || !user.is_active}
                                        className={`flex items-center justify-center w-8 h-8 rounded ${
                                          isCurrentUser || !user.is_active
                                            ? 'text-gray-400 cursor-not-allowed bg-transparent'
                                            : 'text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300'
                                        }`}
                                        title={isCurrentUser ? "You can't assign to your own account" : !user.is_active ? "Cannot assign to inactive user" : 'Assign Apartments'}
                                      >
                                        <Building2 size={20} />
                                      </button>
                                      <button
                                        onClick={() => handleEditClick(user)}
                                        disabled={isCurrentUser || !user.is_active}
                                        className={`flex items-center justify-center w-8 h-8 rounded ${
                                          isCurrentUser || !user.is_active
                                            ? 'text-gray-400 cursor-not-allowed bg-transparent'
                                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                        }`}
                                        title={isCurrentUser ? "You can't edit your own account" : !user.is_active ? "Cannot edit inactive user" : 'Edit'}
                                      >
                                        <Edit size={20} />
                                      </button>

                                      <button
                                        onClick={() => handleToggleClick(user)}
                                        disabled={isCurrentUser}
                                        className={`flex items-center justify-center w-8 h-8 rounded ${
                                          isCurrentUser
                                            ? 'text-gray-400 cursor-not-allowed bg-transparent'
                                            : user.is_active
                                              ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                              : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                                        }`}
                                        title={isCurrentUser ? "You can't modify your own account" : user.is_active ? 'Deactivate' : 'Activate'}
                                      >
                                        {user.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClick(user);
                                        }}
                                        disabled={isCurrentUser || !user.is_active}
                                        className={`flex items-center justify-center w-8 h-8 rounded ${
                                          isCurrentUser || !user.is_active
                                            ? 'text-gray-400 cursor-not-allowed bg-transparent'
                                            : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                        }`}
                                        title={isCurrentUser ? "You can't delete your own account" : !user.is_active ? "Cannot delete inactive user" : 'Delete'}
                                      >
                                        <Trash2 size={20} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            {activeTab === "roles" && (
              <div className='bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6'>
                <Role />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals - Updated with responsive design */}
      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                  Create New User
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                >
                  ✖
                </button>
              </div>
              <CreateUser 
                onClose={handleCloseModal} 
                onCreated={handleUserCreated} 
                roles={roles}
                rolesLoading={rolesLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                  Edit User
                </h2>
                <button
                  onClick={handleEditModalClose}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                >
                  ✖
                </button>
              </div>
              <EditUser 
                user={editingUser} 
                onClose={handleEditModalClose} 
                onUpdated={handleUserUpdated} 
                roles={roles}
                rolesLoading={rolesLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toggle Confirmation Modal */}
      {showToggleModal && togglingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {togglingUser.is_active ? "Confirm Deactivation" : "Confirm Activation"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {togglingUser.is_active 
                ? `Are you sure you want to deactivate ${togglingUser.firstname || 'this user'}? They will lose access to the system.`
                : `Are you sure you want to activate ${togglingUser.firstname || 'this user'}? They will regain access to the system.`
              }
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
              <button
                onClick={handleToggleModalClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleUser}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors ${
                  togglingUser.is_active 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {togglingUser.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deletingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete user "{deletingUser.firstname || deletingUser.email}"? 
              This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign apartments for users */}
      {showAssignModal && assigningUser && (
        <UserApartmentsModal
          user={assigningUser}
          onClose={handleAssignModalClose}
          onAssignSuccess={handleAssignSuccess}
        />
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}