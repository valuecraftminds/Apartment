// pages/HouseOwnerHouseView.jsx
import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import api from '../api/axios'
import HouseOwnerSidebar from '../components/HouseOwnerSidebar'
import HouseOwnerNavbar from '../components/HouseOwnerNavbar'
import { 
  Home, 
  Building2, 
  Layers, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Edit,
  FileText,
  DollarSign,
  Wifi,
  Droplets,
  Zap,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default function HouseOwnerHouseView() {
  const [apartment, setApartment] = useState(null)
  const [floor, setFloor] = useState(null)
  const [house, setHouse] = useState(null)
  const [houseowner, setHouseOwner] = useState(null)
  const [houseTypes, setHouseTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { auth } = useContext(AuthContext)

  // Fetch house owner's house details
  useEffect(() => {
    const fetchHouseOwnerDetails = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch house owner's details
        const houseOwnerRes = await api.get(`/houseowner/user/${auth.user.id}`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        })
        
        if (houseOwnerRes.data.success) {
          const houseOwnerData = houseOwnerRes.data.data
          setHouseOwner(houseOwnerData)
          
          // If house owner has a house assigned, fetch house details
          if (houseOwnerData.house_id) {
            await fetchHouseDetails(houseOwnerData.house_id)
          }
        }
      } catch (err) {
        console.error('Error fetching house owner details:', err)
        setError('Failed to load your house details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchHouseOwnerDetails()
  }, [auth])

  // Fetch house details including apartment and floor info
  const fetchHouseDetails = async (houseId) => {
    try {
      const houseRes = await api.get(`/houses/${houseId}`)
      if (houseRes.data.success) {
        const houseData = houseRes.data.data
        setHouse(houseData)
        
        // Fetch apartment details
        if (houseData.apartment_id) {
          await fetchApartmentDetails(houseData.apartment_id)
        }
        
        // Fetch floor details
        if (houseData.floor_id) {
          await fetchFloorDetails(houseData.floor_id)
        }
        
        // Load house types for the apartment
        if (houseData.apartment_id) {
          await loadHouseTypes(houseData.apartment_id)
        }
      }
    } catch (err) {
      console.error('Error fetching house details:', err)
    }
  }

  const fetchApartmentDetails = async (apartmentId) => {
    try {
      const res = await api.get(`/apartments/${apartmentId}`)
      if (res.data.success) {
        setApartment(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching apartment:', err)
    }
  }

  const fetchFloorDetails = async (floorId) => {
    try {
      const res = await api.get(`/floors/${floorId}`)
      if (res.data.success) {
        setFloor(res.data.data)
      }
    } catch (err) {
      console.error('Error fetching floor:', err)
    }
  }

  const loadHouseTypes = async (apartmentId) => {
    try {
      const result = await api.get(`/housetype?apartment_id=${apartmentId}`)
      if (result.data.success && Array.isArray(result.data.data)) {
        setHouseTypes(result.data.data)
      } else {
        setHouseTypes([])
      }
    } catch (err) {
      console.error('Error loading house types:', err)
    }
  }

  const getHouseTypeName = (houseTypeId) => {
    const houseType = houseTypes.find(type => type.id === houseTypeId)
    return houseType ? houseType.name : 'N/A'
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
        <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}>
          <HouseOwnerNavbar />
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-300">Loading your house details...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
      
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        <HouseOwnerNavbar />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className='flex items-center bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-4 mb-4 md:mb-6'>
              <Home size={32} className='text-purple-600 dark:text-purple-400 mr-3'/>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
                  My House Details
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and manage your apartment information
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" size={20} />
                  <div className="flex-1">
                    <p className="text-red-700 dark:text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* House Details Card */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                    House Information
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      house?.status === 'occupied' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : house?.status === 'available'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {house?.status?.charAt(0).toUpperCase() + house?.status?.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        House Number
                      </label>
                      <div className="flex items-center">
                        <Home className="text-purple-600 dark:text-purple-400 mr-2" size={18} />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {house?.house_id || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        House Type
                      </label>
                      <div className="flex items-center">
                        <Building2 className="text-blue-600 dark:text-blue-400 mr-2" size={18} />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {getHouseTypeName(house?.housetype_id)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Floor
                      </label>
                      <div className="flex items-center">
                        <Layers className="text-green-600 dark:text-green-400 mr-2" size={18} />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {floor?.floor_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Area (Sq. Ft.)
                      </label>
                      <div className="flex items-center">
                        <MapPin className="text-orange-600 dark:text-orange-400 mr-2" size={18} />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          {house?.area || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Rent Amount
                      </label>
                      <div className="flex items-center">
                        <DollarSign className="text-yellow-600 dark:text-yellow-400 mr-2" size={18} />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          ${house?.rent_amount || '0'} / month
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Maintenance Fee
                      </label>
                      <div className="flex items-center">
                        <FileText className="text-indigo-600 dark:text-indigo-400 mr-2" size={18} />
                        <p className="text-lg font-semibold text-gray-800 dark:text-white">
                          ${house?.maintenance_fee || '0'} / month
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* House Features */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    House Features
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex items-center">
                      <Wifi className="text-blue-500 mr-2" size={16} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">WiFi</span>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="text-blue-500 mr-2" size={16} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Water</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="text-yellow-500 mr-2" size={16} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Electricity</span>
                    </div>
                    <div className="flex items-center">
                      <Shield className="text-green-500 mr-2" size={16} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Security</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Owner Information Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  Owner Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {houseowner?.name?.charAt(0)?.toUpperCase() || 'H'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {houseowner?.name || 'House Owner'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Owner since {new Date(houseowner?.created_at).getFullYear() || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="text-gray-500 dark:text-gray-400 mr-3" size={18} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {houseowner?.email || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Phone className="text-gray-500 dark:text-gray-400 mr-3" size={18} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {houseowner?.mobile || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="text-gray-500 dark:text-gray-400 mr-3" size={18} />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Joined Date</p>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">
                          {houseowner?.created_at 
                            ? new Date(houseowner.created_at).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Verification Status</span>
                      {houseowner?.is_verified ? (
                        <span className="flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle size={16} className="mr-1" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center text-yellow-600 dark:text-yellow-400">
                          <XCircle size={16} className="mr-1" />
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Apartment Information Card */}
            {apartment && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                  Apartment Complex Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Apartment Name
                    </label>
                    <div className="flex items-center">
                      <Building2 className="text-purple-600 dark:text-purple-400 mr-2" size={18} />
                      <p className="text-lg font-semibold text-gray-800 dark:text-white">
                        {apartment.name}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Address
                    </label>
                    <div className="flex items-center">
                      <MapPin className="text-blue-600 dark:text-blue-400 mr-2" size={18} />
                      <p className="text-gray-800 dark:text-gray-200">
                        {apartment.address || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      City
                    </label>
                    <p className="text-gray-800 dark:text-gray-200">
                      {apartment.city || 'N/A'}
                    </p>
                  </div>
                </div>

                {apartment.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Description
                    </label>
                    <p className="text-gray-700 dark:text-gray-300">
                      {apartment.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
                <Edit className="mr-2" size={18} />
                Update Information
              </button>
              <button className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                <FileText className="mr-2" size={18} />
                View Documents
              </button>
              <button className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                <DollarSign className="mr-2" size={18} />
                Pay Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}