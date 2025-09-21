import React, { useEffect, useState, useContext } from 'react';
import { Building2, Plus, Edit, Trash2, Eye, Image, Loader } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CreateApartment from '../Apartments/CreateApartment';
import EditApartment from '../Apartments/EditApartment';
import { toast } from 'react-toastify';
import ViewApartment from '../Apartments/ViewApartment';

export default function ApartmentView() {
    const { auth } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingApartment, setEditingApartment] = useState(null);
    const [viewingApartment, setViewingApartment] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);


     const handleAddNew = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (apartment) => {
  setEditingApartment(apartment);
  setShowEditModal(true);
};

    const handleView = (apartment) => {
  setViewingApartment(apartment);
  setShowViewModal(true);
};

    const handleViewModalClose = () => {
        setShowViewModal(false);
        setViewingApartment(null);
    };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleEditModalClose = () => {
  setShowEditModal(false);
  setEditingApartment(null);
};

   const handleApartmentCreated = () => {
        // Refresh the apartments list
        loadApartments();
        // Close the modal
        setShowCreateModal(false);
        // Show success message
        toast.success('Apartment created successfully!');
    };

    const handleApartmentEdited = () => {
        loadApartments(); // Refresh the list
        setShowEditModal(false);
        setEditingApartment(null);
        toast.success('Apartment updated successfully!');
    };

    const handleApartmentDeleted = () => {
        loadApartments();
    };

    const loadApartments = async () => {
    try {
        setLoading(true);
        setError(null);
        const result = await api.get('/apartments')
        console.log('API Response:', result.data);

        if (result.data.success && Array.isArray(result.data.data)) {
            setApartments(result.data.data);
        } else if (Array.isArray(result.data)) {
            setApartments(result.data);
        } else {
            console.warn('Unexpected response format:', result.data);
            setApartments([]);
        }
    } catch (err) {
        console.error('Error loading apartments:', err);
        if (err.response?.status === 401) {
            setError('Unauthorized. Please login again.');
            navigate('/login');
        } else if (err.response?.status === 400) {
            setError('Company information missing. Please contact support.');
        } else {
            setError('Failed to load apartments. Please try again.');
        }
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        loadApartments();
        deleteApartments();
    }, []);

    // const handleEdit = (apartment) => console.log('Edit apartment:', apartment);
    const handleDelete = (apartment) => console.log('Delete apartment:', apartment);
    //const handleView = (apartment) => console.log('View apartment:', apartment);

    const deleteApartments = async() => {
        try{
            const result = await api.delete(`/apartments/${apartments.apartment_id}`);
            console.log('API Response', result.data);
            if(result.data.success){
                toast.success('Apartment is successfully deleted...!');
            }
            else{
                toast.error('Failed to Delete Apartment ')
            }
        }catch(err){
            console.log('Error deleting Apartment')
        }
    }
    

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
            <Sidebar onCollapse={setIsSidebarCollapsed} />
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Navbar />
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                            <div className='flex items-center'>
                                <Building2 size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Apartments</h1>
                            </div>
                            <button onClick={handleAddNew} className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                                <Plus size={20}/>
                                <span>Add New</span>
                            </button>
                        </div>
                        <div className='bg-white dark:bg-gray-800 rounded-2xl p-6'>
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader size={32} className="animate-spin text-purple-600" />
                                    <span className="ml-2 text-gray-600 dark:text-gray-300">Loading apartments...</span>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12 text-red-600 dark:text-red-400">
                                    {error}
                                    <button 
                                        onClick={loadApartments}
                                        className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : apartments.length === 0 ? (
                                <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                                    <Image size={48} className="mx-auto mb-4 text-gray-400" />
                                    <p className="text-lg">No apartments found</p>
                                    <p className="text-sm">Get started by adding your first apartment</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Address</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">City</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Floors</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Units</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Picture</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {apartments.map((apartment, index) => (
                                                <tr key={apartment.id || index} onClick={() => handleView(apartment)} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                        {apartment.name}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {apartment.address}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {apartment.city || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {apartment.floors}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {apartment.houses}
                                                    </td>
                                                    {/* ApartmentView.jsx - Update the image display part */}
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                                                        {apartment.picture ? (
                                                            // If picture is a path (string)
                                                            <img 
                                                                src={`http://localhost:3000${apartment.picture}`}
                                                                alt={apartment.name}
                                                                className="w-12 h-12 object-cover rounded-lg"
                                                                onError={(e) => {
                                                                    console.error('Image failed to load:', apartment.picture);
                                                                    e.target.style.display = 'none';
                                                                    const fallback = e.target.parentNode.querySelector('.image-fallback');
                                                                    if (fallback) fallback.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                                                <Image size={20} className="text-gray-400" />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); 
                                                                    handleEdit(apartment);
                                                                }}
                                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                title="Edit"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(apartment)}
                                                                }
                                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
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
                <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                    <button
                    onClick={handleCloseModal}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    >
                    ✖
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Create New Apartment
                    </h2>
                    <CreateApartment 
                            onClose={handleCloseModal} 
                            onCreated={handleApartmentCreated}
                    />
                </div>
            </div>
            )}
            {showEditModal && editingApartment && (
                <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                    <button
                        onClick={handleEditModalClose}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    >
                        ✖
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Edit Apartment
                    </h2>
                    <EditApartment 
                        onClose={handleEditModalClose} 
                        onEdited={handleApartmentEdited}
                        apartment={editingApartment}
                    />
                    </div>
                </div>
            )}

            {showViewModal && viewingApartment && (
                <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative"></div>
                <ViewApartment
                    apartment={viewingApartment}
                    onClose={handleViewModalClose}
                />
                </div>
            )}
        </div>
    );
}
