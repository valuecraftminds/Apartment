// import React, { useState, useEffect, useContext } from 'react';
// import { Building2, MapPin, Home, Users, Loader, Search } from 'lucide-react';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import api from '../api/axios';
// import { AuthContext } from '../contexts/AuthContext';
// import Sidebar from '../components/Sidebar';
// import Navbar from '../components/Navbar';

// export default function MyApartments() {
//   const [apartments, setApartments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//   const { auth } = useContext(AuthContext);

//   // Fetch user's assigned apartments
//   const fetchUserApartments = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(`/user-apartments/users/${auth.user.id}/apartments`);
      
//       if (response.data.success) {
//         setApartments(response.data.data || []);
//       } else {
//         toast.error('Failed to load apartments');
//         setApartments([]);
//       }
//     } catch (error) {
//       console.error('Error fetching apartments:', error);
//       toast.error('Error loading your apartments');
//       setApartments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (auth?.user?.id) {
//       fetchUserApartments();
//     }
//   }, [auth?.user?.id]);

//   // Filter apartments based on search
//   const filteredApartments = apartments.filter(apartment =>
//     apartment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     apartment.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     apartment.city?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Format date
//   const formatDate = (dateString) => {
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       });
//     } catch {
//       return 'N/A';
//     }
//   };

//   // Get status badge color
//   const getStatusBadge = (isActive) => {
//     return isActive 
//       ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
//       : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
//   };

//   return (
//     <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
//       <Sidebar onCollapse={setIsSidebarCollapsed} />
//       <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
//         <Navbar />
//         <div className="flex-1 overflow-y-auto p-6">
//           <div className="mx-auto max-w-7xl">
//             {/* Header */}
//             <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
//               <div className="flex items-center">
//                 <Building2 size={40} className="text-purple-600 dark:text-purple-400 mr-3" />
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Apartments</h1>
//                   <p className="text-gray-600 dark:text-gray-300">
//                     View all apartments assigned to you
//                   </p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <p className="text-sm text-gray-500 dark:text-gray-400">Total Assigned</p>
//                 <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
//                   {apartments.length}
//                 </p>
//               </div>
//             </div>

//             {/* Search Bar */}
//             <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6">
//               <div className="relative max-w-md">
//                 <Search 
//                   size={20} 
//                   className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search apartments by name, address, or city..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 />
//               </div>
//             </div>

//             {/* Apartments Grid */}
//             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
//               {loading ? (
//                 <div className="flex justify-center items-center py-12">
//                   <Loader size={32} className="animate-spin text-purple-600" />
//                   <span className="ml-2 text-gray-600 dark:text-gray-300">Loading apartments...</span>
//                 </div>
//               ) : filteredApartments.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Building2 size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
//                   <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
//                     {searchTerm ? 'No matching apartments found' : 'No apartments assigned'}
//                   </h3>
//                   <p className="text-gray-500 dark:text-gray-400">
//                     {searchTerm 
//                       ? 'Try adjusting your search terms' 
//                       : 'You have not been assigned to any apartments yet'
//                     }
//                   </p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {filteredApartments.map((apartment) => (
//                     <div
//                       key={apartment.id}
//                       className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-700"
//                     >
//                       {/* Apartment Header */}
//                       <div className="flex items-start justify-between mb-4">
//                         <div className="flex items-center space-x-3">
//                           <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
//                             <Home size={20} className="text-purple-600 dark:text-purple-400" />
//                           </div>
//                           <div>
//                             <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
//                               {apartment.name}
//                             </h3>
//                             <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(apartment.is_active)}`}>
//                               {apartment.is_active ? 'Active' : 'Inactive'}
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Address */}
//                       <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 mb-4">
//                         <MapPin size={16} />
//                         <span className="text-sm">{apartment.address}, {apartment.city}</span>
//                       </div>

//                       {/* Details Grid */}
//                       <div className="grid grid-cols-2 gap-4 mb-4">
//                         <div className="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
//                           <Users size={20} className="mx-auto mb-1 text-gray-500 dark:text-gray-400" />
//                           <div className="text-sm text-gray-500 dark:text-gray-400">Houses</div>
//                           <div className="font-semibold text-gray-900 dark:text-white">
//                             {apartment.houses}
//                           </div>
//                         </div>
//                         <div className="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
//                           <Building2 size={20} className="mx-auto mb-1 text-gray-500 dark:text-gray-400" />
//                           <div className="text-sm text-gray-500 dark:text-gray-400">Floors</div>
//                           <div className="font-semibold text-gray-900 dark:text-white">
//                             {apartment.floors}
//                           </div>
//                         </div>
//                       </div>

//                       {/* Assigned Date */}
//                       <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
//                         <p className="text-xs text-gray-500 dark:text-gray-400">
//                           Assigned on: {formatDate(apartment.assigned_at)}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//       <ToastContainer position="top-right" autoClose={3000} />
//     </div>
//   );
// }

import React, { useState, useEffect, useContext } from 'react';
import { Building2, MapPin, Home, Users, Loader, Search, Menu } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

export default function MyApartments() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch user's assigned apartments
  const fetchUserApartments = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.user?.id) {
      fetchUserApartments();
    }
  }, [auth?.user?.id]);

  // Filter apartments based on search
  const filteredApartments = apartments.filter(apartment =>
    apartment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apartment.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apartment.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get status badge color
  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  // Handle apartment click
  const handleApartmentClick = (apartmentId) => {
    navigate(`/floors/${apartmentId}`);
  };

  // Mobile menu toggle
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
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
        {/* Navbar - Always visible on both mobile and desktop */}
        <Navbar />
        
        {/* Mobile Header - Below Navbar */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center">
                {/* <Building2 size={28} className="text-purple-600 dark:text-purple-400 mr-2" /> */}
                <div>
                  <h1 className="text-xl font-bold text-gray-800 dark:text-white">My Apartments</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    View all apartments assigned to you
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {apartments.length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Desktop Header - Hidden on mobile since we have mobile header */}
            <div className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center">
                <Building2 size={40} className="text-purple-600 dark:text-purple-400 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Apartments</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    View all apartments assigned to you
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Assigned</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {apartments.length}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 mb-6">
              <div className="relative">
                <Search 
                  size={20} 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                />
                <input
                  type="text"
                  placeholder="Search apartments by name, address, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 lg:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base lg:text-sm"
                />
              </div>
            </div>

            {/* Apartments Grid/List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size={32} className="animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Loading apartments...</span>
                </div>
              ) : filteredApartments.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    {searchTerm ? 'No matching apartments found' : 'No apartments assigned'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm lg:text-base">
                    {searchTerm 
                      ? 'Try adjusting your search terms' 
                      : 'You have not been assigned to any apartments yet'
                    }
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile List View */}
                  <div className="lg:hidden space-y-4">
                    {filteredApartments.map((apartment) => (
                      <div
                        key={apartment.id}
                        onClick={() => handleApartmentClick(apartment.id)}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-700 active:bg-gray-50 dark:active:bg-gray-600 cursor-pointer"
                      >
                        {/* Apartment Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                              <Home size={18} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                                {apartment.name}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(apartment.is_active)}`}>
                                {apartment.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-start space-x-2 text-gray-600 dark:text-gray-300 mb-3">
                          <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                          <span className="text-sm line-clamp-2">
                            {apartment.address}, {apartment.city}
                          </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                            <Users size={16} className="mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">Houses</div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {apartment.houses || 0}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-600 rounded-lg">
                            <Building2 size={16} className="mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                            <div className="text-xs text-gray-500 dark:text-gray-400">Floors</div>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {apartment.floors || 0}
                            </div>
                          </div>
                        </div>

                        {/* Assigned Date */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Assigned: {formatDate(apartment.assigned_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Grid View */}
                  <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredApartments.map((apartment) => (
                      <div
                        key={apartment.id}
                        onClick={() => handleApartmentClick(apartment.id)}
                        className="border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-700 cursor-pointer hover:border-purple-300 dark:hover:border-purple-600"
                      >
                        {/* Apartment Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                              <Home size={20} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                {apartment.name}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(apartment.is_active)}`}>
                                {apartment.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Address */}
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 mb-4">
                          <MapPin size={16} />
                          <span className="text-sm">{apartment.address}, {apartment.city}</span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                            <Users size={20} className="mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                            <div className="text-sm text-gray-500 dark:text-gray-400">Houses</div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {apartment.houses || 0}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg">
                            <Building2 size={20} className="mx-auto mb-1 text-gray-500 dark:text-gray-400" />
                            <div className="text-sm text-gray-500 dark:text-gray-400">Floors</div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {apartment.floors || 0}
                            </div>
                          </div>
                        </div>

                        {/* Assigned Date */}
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Assigned on: {formatDate(apartment.assigned_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Floating Action Button for Search */}
            {filteredApartments.length > 3 && (
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
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
