// HouseOwnerHouseView.jsx
import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import api from '../api/axios'
import HouseOwnerSidebar from '../components/HouseOwnerSidebar'
import HouseOwnerNavbar from '../components/HouseOwnerNavbar'
import { Home, Building2, Layers, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'

export default function HouseOwnerHouseView() {
  const [apartments, setApartments] = useState({})
  const [floors, setFloors] = useState({})
  const [houses, setHouses] = useState([])
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [houseowner, setHouseOwner] = useState(null)
  const [houseTypes, setHouseTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { auth } = useContext(AuthContext)

  const fetchHouseOwnerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (auth.accessToken) {
        console.log('Fetching houses with all details...');
        
        const res = await api.get(`/houses/owner/me`, {
          headers: { 
            Authorization: `Bearer ${auth.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('API Response with details:', res.data);
        
        if (res.data.success) {
          const housesData = res.data.data || [];
          setHouses(housesData);
          
          const apartmentMap = {};
          const floorMap = {};
          const houseTypeMap = {};
          
          housesData.forEach(house => {
            if (house.apartment_id) {
              apartmentMap[house.apartment_id] = {
                id: house.apartment_id,
                name: house.apartment_name,
                address: house.apartment_address,
                city: house.apartment_city,
              };
            }
            
            if (house.floor_id) {
              floorMap[house.floor_id] = {
                id: house.floor_id,
                floor_id: house.floor_id,
                floor_number: house.floor_number 
              };
            }
            
            if (house.housetype_id) {
              houseTypeMap[house.housetype_id] = {
                id: house.housetype_id,
                name: house.house_type_name,
                sqrfeet: house.house_type_sqrfeet,
                rooms: house.house_type_rooms,
                bathrooms: house.house_type_bathrooms,
              };
            }
          });
          
          setApartments(apartmentMap);
          setFloors(floorMap);
          setHouseTypes(Object.values(houseTypeMap));
          
          if (housesData.length > 0) {
            setSelectedHouse(housesData[0]);
          } else {
            setSelectedHouse(null);
          }
        } else {
          setError(res.data.message || 'Failed to fetch houses');
        }
      } else {
        setError('No authentication token found. Please log in.');
      }
    } catch (err) {
      console.error('Failed to fetch house data:', err);
      toast.error('Failed to fetch house data');
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
        
        if (err.response.status === 401) {
          setError('Session expired. Please log in again.');
        } else if (err.response.status === 403) {
          setError('Access denied. You are not authorized as a house owner.');
        } else if (err.response.status === 404) {
          setError('No houses found for your account.');
        } else {
          setError(err.response.data?.message || 'Failed to load house data');
        }
      } else if (err.request) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseOwnerData();
  }, [auth.accessToken]);

  // Helper functions
  const getHouseTypeName = (houseTypeId) => {
    if (!houseTypeId) return 'N/A';
    const houseType = houseTypes.find(type => type.id === houseTypeId);
    if (houseType) return houseType.name;
    const currentHouse = houses.find(h => h.housetype_id === houseTypeId);
    return currentHouse?.house_type_name || 'N/A';
  }

  const getApartmentName = (apartmentId) => {
    if (!apartmentId) return 'N/A';
    const apartment = apartments[apartmentId];
    if (apartment) return apartment.name;
    const currentHouse = houses.find(h => h.apartment_id === apartmentId);
    return currentHouse?.apartment_name || 'N/A';
  }

  const getFloorName = (floorId) => {
    if (!floorId) return 'N/A';
    const floor = floors[floorId];
    if (floor && floor.floor_number) return floor.floor_number;
    const currentHouse = houses.find(h => h.floor_id === floorId);
    return currentHouse?.floor_number || 'N/A';
  }

  const handleHouseSelect = (house) => {
    setSelectedHouse(house)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen">
        <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} md:ml-64`}>
          <HouseOwnerNavbar />
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading your house details...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen">
      {/* Sidebar - The sidebar component handles its own mobile menu button */}
      <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
      
      <div 
      className={`
        flex-1 flex flex-col overflow-hidden 
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} 
        w-full transition-all duration-300
      `}
      >
        {/* Navbar - Always visible */}
        <HouseOwnerNavbar />
        
        <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            {/* Header */}
            <div className='flex items-center bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 md:mb-6'>
              <Home size={32} className='text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0'/>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
                  My Houses
                </h1>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                  View and manage your properties
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
                  <p className="text-sm md:text-base text-red-700 dark:text-red-300 break-words">{error}</p>
                </div>
              </div>
            )}

            {/* House Selection */}
            {houses.length > 1 && (
              <div className="mb-4 md:mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-3 md:p-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-2 md:mb-3">
                  Select a House
                </h3>
                <div className="flex flex-wrap gap-2">
                  {houses.map((house, index) => (
                    <button
                      key={house.id}
                      onClick={() => handleHouseSelect(house)}
                      className={`px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base rounded-lg transition-colors ${
                        selectedHouse?.id === house.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      House {index + 1}: {house.house_id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Display Selected House Details */}
            {selectedHouse && (
              <>
                {/* House Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-2">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                      House Information
                    </h2>
                    <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${
                      selectedHouse.status === 'occupied' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : selectedHouse.status === 'available'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {selectedHouse.status?.charAt(0).toUpperCase() + selectedHouse.status?.slice(1) || 'N/A'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          House Number
                        </label>
                        <div className="flex items-center">
                          <Home className="text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0" size={18} />
                          <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white truncate">
                            {selectedHouse.house_id || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          House Type
                        </label>
                        <div className="flex items-center">
                          <Building2 className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0" size={18} />
                          <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white truncate">
                            {selectedHouse.house_type_name || getHouseTypeName(selectedHouse.housetype_id)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                      <div>
                        <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Floor
                        </label>
                        <div className="flex items-center">
                          <Layers className="text-green-600 dark:text-green-400 mr-2 flex-shrink-0" size={18} />
                          <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                            {selectedHouse.floor_number || getFloorName(selectedHouse.floor_id)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apartment Information */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                    Apartment Complex
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Apartment Name
                      </label>
                      <p className="text-base md:text-lg font-semibold text-gray-800 dark:text-white break-words">
                        {selectedHouse.apartment_name || getApartmentName(selectedHouse.apartment_id)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Address
                      </label>
                      <p className="text-sm md:text-base text-gray-800 dark:text-gray-200 break-words">
                        {selectedHouse.apartment_address || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        City
                      </label>
                      <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">
                        {selectedHouse.apartment_city || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {/* House type details */}
                  {selectedHouse.house_type_name && (
                    <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-3 md:mb-4">
                        House Specifications
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Square Feet
                          </label>
                          <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">
                            {selectedHouse.house_type_sqrfeet || 'N/A'} sq ft
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Rooms
                          </label>
                          <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">
                            {selectedHouse.house_type_rooms || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Bathrooms
                          </label>
                          <p className="text-sm md:text-base text-gray-800 dark:text-gray-200">
                            {selectedHouse.house_type_bathrooms || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Display if no houses found */}
            {houses.length === 0 && !error && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:p-8 text-center">
                <Home className="mx-auto text-gray-400 mb-4" size={40} />
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  No Houses Assigned
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mb-4">
                  You don't have any houses assigned to your account yet.
                </p>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500">
                  Please contact the apartment administrator to assign houses to your account.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}