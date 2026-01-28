// import React, { useEffect, useState } from 'react'
// import Sidebar from '../components/Sidebar';
// import Navbar from '../components/Navbar';
// import { Building, Building2, ChevronLeft, Edit, Image, Loader, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
// import { useNavigate, useParams } from 'react-router-dom';
// import api from '../api/axios';
// import CreateFloors from './CreateFloors';
// import EditFloors from './EditFloors';
// import { toast, ToastContainer } from 'react-toastify';
// import { FileText } from 'lucide-react';
// import FloorDocumentModal from './FloorDocumentModal';


// export default function Floors() {
//     const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//     const {id} = useParams();
//     //console.log('Apartment ID:', id);
//     const [apartment, setApartment] = useState(null);
//     const navigate = useNavigate();
//     const [floors, setFloors] = useState([]);
//     const [error, setError] = useState(null);
//     const [loadingFloors, setLoadingFloors] = useState(true);
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [showEditModal, setShowEditModal] = useState(false);
//     const [selectedFloor, setSelectedFloor] = useState(null);
//     const [showDeactivateModal, setShowDeactivateModal] = useState(false);
//     const [deactivatingFloor, setDeactivatingFloor] = useState(null);
//     const [showDeleteModal, setShowDeleteModal] = useState(false);
//     const [deletingFloor, setDeletingFloor] = useState(null);   
//     const [showDocumentModal, setShowDocumentModal] = useState(false);
//     const [selectedFloorForDocs, setSelectedFloorForDocs] = useState(null); 

//     useEffect(() => {
//         const fetchApartment = async () => {
//             try {
//                 const res = await api.get(`/apartments/${id}`);
//                 if (res.data.success) {
//                     setApartment(res.data.data); // set the apartment object
//                 }
//             } catch (err) {
//                 console.error('Error fetching apartment:', err);
//             }
//         };
//         if (id) fetchApartment();
//     }, [id]);

//     const handleBack = () => {
//         navigate('/apartmentview');
//     };

//     const loadFloors = async () => {
//     try {
//         setLoadingFloors(true);
//         setError(null);
//         //get the floor through apartment id
//         const result = await api.get(`/floors?apartment_id=${id}`); 
//        // console.log('API Response:', result.data);

//         if (result.data.success && Array.isArray(result.data.data)) {
//             setFloors(result.data.data);
//         } else {
//             setFloors([]);
//         }
//     } catch (err) {
//         console.error('Error loading floors:', err);
//         setError('Failed to load floors. Please try again.');
//     } finally {
//          setLoadingFloors(false);
//     }
//     };

//     useEffect(() => {
//         loadFloors();
//     }, [id]);

//     const handleHouseView = (floor) => {
//         navigate(`/houses/${id}/${floor.id}`); 
//     };

//     //Deactivate and activate the floors
//     const confirmDeactivate = (floor) => {
//         setDeactivatingFloor(floor);
//         setShowDeactivateModal(true);
//     };

//     const cancelDeactivate = () => {
//         setShowDeactivateModal(false);
//         setDeactivatingFloor(null);
//     }

//     const handleToggle = async (floor) => {
//         try {
//             const result = await api.patch(`/floors/${floor.id}/toggle`);
//             toast.success(result.data.message);
//             loadFloors(); 
//         } catch (err) {
//             console.error('Error toggling floor:', err);
//             toast.error('Failed to toggle floor status');
//         }
//     };

//     //Add floors
//     const handleAddNew = () =>{
//         setShowCreateModal(true);
//     }

//     const handleCloseModal = () => {
//     setShowCreateModal(false);
//   };

//     const handleFloorsCreated = () => {
//           loadFloors();
//           setShowCreateModal(false);
//           toast.success('Floor created successfully!');
//     };

//     //Update Floors
//     const handleEdit = (floor) => {
//     setSelectedFloor(floor);
//     setShowEditModal(true);
//     };

//     const handleCloseEditModal = () => {
//     setShowEditModal(false);
//     setSelectedFloor(null);
//     };

//     const handleFloorUpdated = () => {
//     loadFloors();
//     setShowEditModal(false);
//     toast.success('Floor updated successfully!');
//     };

//     //Delete floors
//   const handleDeleteClick = (floor) => {
//     setDeletingFloor(floor);
//     setShowDeleteModal(true);
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       if (!deletingFloor) return;
//       await api.delete(`/floors/${deletingFloor.id}`);
//       toast.success('Floor deleted successfully');
//       setShowDeleteModal(false);
//       setDeletingFloor(null);
//       loadFloors();
//     } catch (err) {
//       console.error('Delete floor error:', err);
//       toast.error('Failed to delete floor');
//     }
//   };

//   const handleCancelDelete = () => {
//     setShowDeleteModal(false);
//     setDeletingFloor(null);
//   };

//   //handle floor document
//   const handleDocumentClick = (floor) => {
//     setSelectedFloorForDocs(floor);
//     setShowDocumentModal(true);
//     };

//     const handleDocumentModalClose = () => {
//         setShowDocumentModal(false);
//         setSelectedFloorForDocs(null);
//     };

//     const handleDocumentUploadSuccess = () => {
//         toast.success('Floor documents uploaded successfully!');
//     };

//   return (    
//     <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
//         <Sidebar onCollapse={setIsSidebarCollapsed}/>
//         <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
//             <Navbar/>
//             <div className="flex-1 overflow-y-auto p-6">
//                 <div className="mx-auto max-w-7xl">
//                     <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
//                         <div className='flex flex-col'>
//                             <div className='flex items-center'>
//                                 <button onClick ={handleBack} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
//                                     <ChevronLeft size={25} />
//                                 </button>
//                                 <Building size={40} className='text-purple-600 dark:text-purple-400 mr-3 ml-3'/>
//                                 <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Floors</h1>
//                             </div>
//                             {/* Apartment name below the title */}
//                             {apartment && (
//                                 <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
//                                     Apartment: {apartment.name}
//                                 </div>
//                             )}
//                         </div>
//                         <button onClick={handleAddNew} className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
//                             <Plus size={20}/>
//                             <span>Add New</span>
//                         </button>
//                     </div>
//                         <div className='bg-white dark:bg-gray-800 rounded-2xl p-6'>
//                             {loadingFloors ? (
//                                     <div className="flex justify-center items-center py-12">
//                                         <Loader size={32} className="animate-spin text-purple-600" />
//                                         <span className="ml-2 text-gray-600 dark:text-gray-300">Loading floors...</span>
//                                     </div>
//                                 ) : error ? (
//                                     <div className="text-center py-12 text-red-600 dark:text-red-400">
//                                         {error}
//                                         <button 
//                                             onClick={loadFloors}
//                                             className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
//                                         >
//                                             Retry
//                                         </button>
//                                     </div>
//                                 ) : floors.length === 0 ? (
//                                     <div className="text-center py-12 text-gray-600 dark:text-gray-300">
//                                         <Image size={48} className="mx-auto mb-4 text-gray-400" />
//                                         <p className="text-lg">No floors found</p>
//                                         <p className="text-sm">Get started by adding floors</p>
//                                     </div>
//                                 ) : (
//                                     <div className="overflow-x-auto">
//                                         <table className="w-full table-auto">
//                                             <thead className="bg-gray-50 dark:bg-gray-700">
//                                                 <tr>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Floor</th>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">House Count</th>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
//                                                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                                                 {floors.map((floor, index) => (
//                                                     <tr 
//                                                         key={floor.id || index} 
//                                                         onClick={() => floor.is_active && handleHouseView(floor)} 
//                                                         className={`transition-colors cursor-pointer ${
//                                                             floor.is_active 
//                                                                 ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
//                                                                 : 'opacity-50 cursor-not-allowed'
//                                                         }`}
//                                                     >
//                                                         <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                                                             {floor.floor_id}
//                                                         </td>
//                                                         <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                                                             {floor.house_count}
//                                                         </td>
//                                                         <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
//                                                             <span
//                                                                 className={`px-2 py-1 text-xs font-semibold rounded-full 
//                                                                 ${
//                                                                     floor.status === "active"
//                                                                     ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
//                                                                     : floor.status === "maintenance"
//                                                                     ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
//                                                                     : floor.status === "partial"
//                                                                     ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
//                                                                     : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
//                                                                 }`}
//                                                             >
//                                                                 {floor.status.charAt(0).toUpperCase() + floor.status.slice(1)}
//                                                             </span>
//                                                         </td>
//                                                         <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
//                                                             <div className="flex space-x-2">
//                                                                 <button
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation();
//                                                                         handleDocumentClick(floor);
//                                                                     }}
//                                                                     className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
//                                                                     title="Manage Documents"
//                                                                 >
//                                                                     <FileText size={20} />
//                                                                 </button>
//                                                                 <button
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation();
//                                                                         handleEdit(floor);
//                                                                     }}
//                                                                     className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
//                                                                     title="Edit"
//                                                                     >
//                                                                     <Edit size={20} />
//                                                                 </button>
//                                                                 <button
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation(); // prevent row click
//                                                                         confirmDeactivate(floor);
//                                                                         // handleToggle(floor);
//                                                                     }}
//                                                                     className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
//                                                                     title={floor.is_active ? 'Deactivate' : 'Activate'}
//                                                                     >
//                                                                     {floor.is_active ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}
//                                                                 </button>
//                                                                 <button
//                                                                     onClick={(e) => {
//                                                                     e.stopPropagation();
//                                                                     handleDeleteClick(floor);
//                                                                     }}
//                                                                     className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
//                                                                     title="Delete"
//                                                                 >
//                                                                     <Trash2 size={20} />
//                                                                 </button>
//                                                             </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 )}
//                         </div>
//                 </div>
//             </div>
//         </div>
//         {showCreateModal && (
//             <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
//                     <button
//                         onClick={handleCloseModal}
//                         className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
//                     >
//                     ✖
//                     </button>
//                     <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
//                         Create Floors
//                     </h2>
//                     <CreateFloors
//                         onClose={handleCloseModal} 
//                         onCreated={handleFloorsCreated}
//                         apartment_id={id}
//                     />
//                 </div>
//             </div>
//         )}
//         {showEditModal && selectedFloor && (
//             <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
//                 <button
//                     onClick={handleCloseEditModal}
//                     className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
//                 >
//                     ✖
//                 </button>
//                 <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
//                     Edit Floor
//                 </h2>
//                 <EditFloors
//                     onClose={handleCloseEditModal}
//                     onUpdated={handleFloorUpdated}
//                     floor={selectedFloor}
//                 />
//                 </div>
//             </div>
//         )}
//         {showDeactivateModal && (
//             <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
//                 <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
//                     {deactivatingFloor?.is_active
//                     ? "Confirm Deactivation of Floor"
//                     : "Confirm Activation of Floor"}
//                 </h2>
//                 <p className="text-gray-600 dark:text-gray-300 mb-6">
//                     {deactivatingFloor?.is_active
//                     ? "Are you sure you want to deactivate this floor?"
//                     : "Are you sure you want to activate this floor?"}
//                 </p>
//                 <div className="flex justify-end space-x-3">
//                     <button
//                     onClick={cancelDeactivate}
//                     className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
//                     >
//                     Cancel
//                     </button>
//                     <button
//                     onClick={() => {
//                         if (deactivatingFloor) {
//                         handleToggle(deactivatingFloor);
//                         setShowDeactivateModal(false);
//                         setDeactivatingFloor(null);
//                         }
//                     }}
//                     className={`px-4 py-2 rounded-md text-white transition-colors duration-200 ${
//                         deactivatingFloor?.is_active
//                         ? "bg-red-600 hover:bg-red-700"
//                         : "bg-green-600 hover:bg-green-700"
//                     }`}
//                     >
//                     {deactivatingFloor?.is_active ? "Deactivate" : "Activate"}
//                     </button>
//                 </div>
//                 </div>
//             </div>
//         )}
//         {showDeleteModal && deletingFloor && (
//             <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
//                     <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
//                     Confirm Deletion
//                     </h2>
//                     <p className="text-gray-600 dark:text-gray-300 mb-6">
//                     Are you sure you want to delete "{deletingFloor.floor_id}"?
//                     </p>
//                     <div className="flex justify-end space-x-3">
//                     <button
//                         onClick={handleCancelDelete}
//                         className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={handleConfirmDelete}
//                         className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
//                     >
//                         Delete
//                     </button>
//                     </div>
//                 </div>
//             </div>
//         )}
//         {/* handle floor document */}
//         {showDocumentModal && selectedFloorForDocs && (
//             <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
//                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
//                     <FloorDocumentModal
//                         floor={selectedFloorForDocs}
//                         apartment={apartment}
//                         onClose={handleDocumentModalClose}
//                         onUploadSuccess={handleDocumentUploadSuccess}
//                     />
//                 </div>
//             </div>
//         )}
//         <ToastContainer position="top-center" autoClose={3000} />
//     </div>
//   )
// }

import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navbar';
import { Building, Building2, ChevronLeft, Edit, Image, Loader, Plus, ToggleLeft, ToggleRight, Trash2, Menu } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import CreateFloors from './CreateFloors';
import EditFloors from './EditFloors';
import { toast, ToastContainer } from 'react-toastify';
import { FileText } from 'lucide-react';
import FloorDocumentModal from './FloorDocumentModal';


export default function Floors() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const {id} = useParams();
    const [apartment, setApartment] = useState(null);
    const navigate = useNavigate();
    const [floors, setFloors] = useState([]);
    const [error, setError] = useState(null);
    const [loadingFloors, setLoadingFloors] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [deactivatingFloor, setDeactivatingFloor] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingFloor, setDeletingFloor] = useState(null);   
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [selectedFloorForDocs, setSelectedFloorForDocs] = useState(null); 

    // Check screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchApartment = async () => {
            try {
                const res = await api.get(`/apartments/${id}`);
                if (res.data.success) {
                    setApartment(res.data.data); // set the apartment object
                }
            } catch (err) {
                console.error('Error fetching apartment:', err);
            }
        };
        if (id) fetchApartment();
    }, [id]);

    const handleBack = () => {
        navigate('/apartmentview');
    };

    const loadFloors = async () => {
    try {
        setLoadingFloors(true);
        setError(null);
        //get the floor through apartment id
        const result = await api.get(`/floors?apartment_id=${id}`); 
       // console.log('API Response:', result.data);

        if (result.data.success && Array.isArray(result.data.data)) {
            setFloors(result.data.data);
        } else {
            setFloors([]);
        }
    } catch (err) {
        console.error('Error loading floors:', err);
        setError('Failed to load floors. Please try again.');
    } finally {
         setLoadingFloors(false);
    }
    };

    useEffect(() => {
        loadFloors();
    }, [id]);

    const handleHouseView = (floor) => {
        navigate(`/houses/${id}/${floor.id}`); 
    };

    //Deactivate and activate the floors
    const confirmDeactivate = (floor) => {
        setDeactivatingFloor(floor);
        setShowDeactivateModal(true);
    };

    const cancelDeactivate = () => {
        setShowDeactivateModal(false);
        setDeactivatingFloor(null);
    }

    const handleToggle = async (floor) => {
        try {
            const result = await api.patch(`/floors/${floor.id}/toggle`);
            toast.success(result.data.message);
            loadFloors(); 
        } catch (err) {
            console.error('Error toggling floor:', err);
            toast.error('Failed to toggle floor status');
        }
    };

    //Add floors
    const handleAddNew = () =>{
        setShowCreateModal(true);
    }

    const handleCloseModal = () => {
    setShowCreateModal(false);
  };

    const handleFloorsCreated = () => {
          loadFloors();
          setShowCreateModal(false);
          toast.success('Floor created successfully!');
    };

    //Update Floors
    const handleEdit = (floor) => {
    setSelectedFloor(floor);
    setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedFloor(null);
    };

    const handleFloorUpdated = () => {
    loadFloors();
    setShowEditModal(false);
    toast.success('Floor updated successfully!');
    };

    //Delete floors
  const handleDeleteClick = (floor) => {
    setDeletingFloor(floor);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!deletingFloor) return;
      await api.delete(`/floors/${deletingFloor.id}`);
      toast.success('Floor deleted successfully');
      setShowDeleteModal(false);
      setDeletingFloor(null);
      loadFloors();
    } catch (err) {
      console.error('Delete floor error:', err);
      toast.error('Failed to delete floor');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingFloor(null);
  };

  //handle floor document
  const handleDocumentClick = (floor) => {
    setSelectedFloorForDocs(floor);
    setShowDocumentModal(true);
    };

    const handleDocumentModalClose = () => {
        setShowDocumentModal(false);
        setSelectedFloorForDocs(null);
    };

    const handleDocumentUploadSuccess = () => {
        toast.success('Floor documents uploaded successfully!');
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
    <div className='flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200'>
        <MobileMenuButton />
        
        <Sidebar 
            onCollapse={setIsSidebarCollapsed}
            isMobileOpen={isMobileSidebarOpen}
            onMobileClose={() => setIsMobileSidebarOpen(false)}
        />
        
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
            <Navbar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className='flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6 gap-4'>
                        <div className='flex items-center'>
                            <button onClick={handleBack} className='p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 text-purple-700 dark:text-purple-400 mr-2 md:mr-3'>
                                <ChevronLeft size={isMobile ? 20 : 25} />
                            </button>
                            <Building size={isMobile ? 28 : 40} className='text-purple-600 dark:text-purple-400 mr-2 md:mr-3 flex-shrink-0'/>
                            <div className="min-w-0">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
                                    Floors
                                </h1>
                                {apartment && (
                                    <div className='text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate'>
                                        Apartment: {apartment.name}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={handleAddNew} 
                            className='flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105 text-sm md:text-base w-full sm:w-auto'
                        >
                            <Plus size={isMobile ? 16 : 20}/>
                            <span>Add New</span>
                        </button>
                    </div>
                    
                    <div className='bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 md:p-6'>
                        {loadingFloors ? (
                            <div className="flex flex-col items-center justify-center py-8 md:py-12">
                                <Loader size={isMobile ? 24 : 32} className="animate-spin text-purple-600" />
                                <span className="ml-2 mt-2 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                                    Loading floors...
                                </span>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 md:py-12">
                                <div className="text-red-600 dark:text-red-400 text-sm md:text-base mb-4">
                                    {error}
                                </div>
                                <button 
                                    onClick={loadFloors}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : floors.length === 0 ? (
                            <div className="text-center py-8 md:py-12">
                                <Image size={isMobile ? 32 : 48} className="mx-auto mb-3 md:mb-4 text-gray-400" />
                                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-2">
                                    No floors found
                                </p>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Get started by adding floors
                                </p>
                                <button 
                                    onClick={handleAddNew}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm md:text-base"
                                >
                                    Add First Floor
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Mobile View - Card Layout */}
                                {isMobile ? (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Total Floors: {floors.length}
                                                </span>
                                                <span className="text-xs text-purple-600 dark:text-purple-400">
                                                    {floors.length} items
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {floors.map((floor, index) => (
                                            <div 
                                                key={floor.id || index} 
                                                onClick={() => floor.is_active && handleHouseView(floor)} 
                                                className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 transition-colors ${
                                                    floor.is_active 
                                                        ? 'active:bg-gray-100 dark:active:bg-gray-600 cursor-pointer' 
                                                        : 'opacity-50 cursor-not-allowed'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                                            Floor {floor.floor_id}
                                                        </h3>
                                                        <div className="flex items-center mt-1 space-x-3">
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                <span className="font-medium">Houses:</span> {floor.house_count}
                                                            </div>
                                                            <span
                                                                className={`px-2 py-0.5 text-xs font-semibold rounded-full 
                                                                ${
                                                                    floor.status === "active"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : floor.status === "maintenance"
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                    : floor.status === "partial"
                                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                                                }`}
                                                            >
                                                                {floor.status.charAt(0).toUpperCase() + floor.status.slice(1)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-2 flex-shrink-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDocumentClick(floor);
                                                            }}
                                                            className="p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                                                            title="Manage Documents"
                                                        >
                                                            <FileText size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(floor);
                                                            }}
                                                            className="p-1.5 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-lg"
                                                            title="Edit"
                                                            >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                confirmDeactivate(floor);
                                                            }}
                                                            className={`p-1.5 rounded-lg ${
                                                                floor.is_active 
                                                                    ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20'
                                                                    : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 bg-green-50 dark:bg-green-900/20'
                                                            }`}
                                                            title={floor.is_active ? 'Deactivate' : 'Activate'}
                                                            >
                                                            {floor.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(floor);
                                                            }}
                                                            className="p-1.5 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between">
                                                    <span className={`px-1.5 py-0.5 rounded ${
                                                        floor.is_active 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}>
                                                        {floor.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <span>Click to view houses</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* Desktop View - Table Layout */
                                    <div className="overflow-x-auto">
                                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Floors Management
                                                </span>
                                                <span className="text-sm text-purple-600 dark:text-purple-400">
                                                    {floors.length} floors
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <table className="w-full table-auto min-w-[640px]">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Floor</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">House Count</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                {floors.map((floor, index) => (
                                                    <tr 
                                                        key={floor.id || index} 
                                                        onClick={() => floor.is_active && handleHouseView(floor)} 
                                                        className={`transition-colors cursor-pointer ${
                                                            floor.is_active 
                                                                ? 'hover:bg-gray-50 dark:hover:bg-gray-700' 
                                                                : 'opacity-50 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {floor.floor_id}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                            {floor.house_count}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <span
                                                                className={`px-2 py-1 text-xs font-semibold rounded-full 
                                                                ${
                                                                    floor.status === "active"
                                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                                    : floor.status === "maintenance"
                                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                                    : floor.status === "partial"
                                                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                                                                }`}
                                                            >
                                                                {floor.status.charAt(0).toUpperCase() + floor.status.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDocumentClick(floor);
                                                                    }}
                                                                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                    title="Manage Documents"
                                                                >
                                                                    <FileText size={20} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEdit(floor);
                                                                    }}
                                                                    className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                                    title="Edit"
                                                                    >
                                                                    <Edit size={20} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation(); // prevent row click
                                                                        confirmDeactivate(floor);
                                                                    }}
                                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                                    title={floor.is_active ? 'Deactivate' : 'Activate'}
                                                                    >
                                                                    {floor.is_active ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteClick(floor);
                                                                    }}
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Create Floor Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                                Create Floors
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                            >
                                ✖
                            </button>
                        </div>
                        <CreateFloors
                            onClose={handleCloseModal} 
                            onCreated={handleFloorsCreated}
                            apartment_id={id}
                        />
                    </div>
                </div>
            </div>
        )}
        
        {/* Edit Floor Modal */}
        {showEditModal && selectedFloor && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4 md:mb-6">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                                Edit Floor
                            </h2>
                            <button
                                onClick={handleCloseEditModal}
                                className="text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl transition-colors"
                            >
                                ✖
                            </button>
                        </div>
                        <EditFloors
                            onClose={handleCloseEditModal}
                            onUpdated={handleFloorUpdated}
                            floor={selectedFloor}
                        />
                    </div>
                </div>
            </div>
        )}
        
        {/* Deactivate/Activate Modal */}
        {showDeactivateModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-sm">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        {deactivatingFloor?.is_active
                        ? "Confirm Deactivation of Floor"
                        : "Confirm Activation of Floor"}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {deactivatingFloor?.is_active
                        ? "Are you sure you want to deactivate this floor?"
                        : "Are you sure you want to activate this floor?"}
                    </p>
                    <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'space-x-3'}`}>
                        <button
                            onClick={cancelDeactivate}
                            className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isMobile ? '' : 'flex-1'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (deactivatingFloor) {
                                    handleToggle(deactivatingFloor);
                                    setShowDeactivateModal(false);
                                    setDeactivatingFloor(null);
                                }
                            }}
                            className={`px-4 py-2 text-white rounded-lg font-medium transition-colors ${isMobile ? '' : 'flex-1'} ${
                                deactivatingFloor?.is_active
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
                        >
                            {deactivatingFloor?.is_active ? "Deactivate" : "Activate"}
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Delete Modal */}
        {showDeleteModal && deletingFloor && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 w-full max-w-sm">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                        Confirm Deletion
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Are you sure you want to delete "{deletingFloor.floor_id}"?
                    </p>
                    <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'space-x-3'}`}>
                        <button
                            onClick={handleCancelDelete}
                            className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isMobile ? '' : 'flex-1'}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            className={`px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors ${isMobile ? '' : 'flex-1'}`}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        )}
        
        {/* Floor Document Modal */}
        {showDocumentModal && selectedFloorForDocs && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="p-4 md:p-6">
                        <FloorDocumentModal
                            floor={selectedFloorForDocs}
                            apartment={apartment}
                            onClose={handleDocumentModalClose}
                            onUploadSuccess={handleDocumentUploadSuccess}
                        />
                    </div>
                </div>
            </div>
        )}
        
        <ToastContainer position="top-center" autoClose={3000} />
    </div>
  )
}
