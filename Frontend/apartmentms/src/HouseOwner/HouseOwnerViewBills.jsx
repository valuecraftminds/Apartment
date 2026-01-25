//HouseOwnerViewBills.jsx
import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import api from '../api/axios'
import HouseOwnerSidebar from '../components/HouseOwnerSidebar'
import HouseOwnerNavbar from '../components/HouseOwnerNavbar'
import { 
  Home, 
  Building2, 
  Receipt, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowUpRight,
  Download,
  Filter,
  Info,
  FileText
} from 'lucide-react'

export default function HouseOwnerViewBills() {
  const [apartments, setApartments] = useState({})
  const [floors, setFloors] = useState({})
  const [houses, setHouses] = useState([])
  const [selectedHouse, setSelectedHouse] = useState(null)
  const [houseTypes, setHouseTypes] = useState([])
  const [bills, setBills] = useState([])
  const [filteredBills, setFilteredBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingBills, setLoadingBills] = useState(false)
  const [error, setError] = useState(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [summaryStats, setSummaryStats] = useState({
    totalBills: 0,
    totalPaid: 0,
    totalPending: 0,
    totalAmount: 0
  })
  const [filters, setFilters] = useState({
    status: 'all',
    month: 'all',
    year: new Date().getFullYear(), // Changed from current year to 'all'
    house_id: 'all'
  })
  const { auth } = useContext(AuthContext)

  // Fetch house owner data (houses assigned to them)
  const fetchHouseOwnerData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (auth.accessToken) {
        const res = await api.get(`/houses/owner/me`, {
          headers: { 
            Authorization: `Bearer ${auth.accessToken}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (res.data.success) {
          const housesData = res.data.data || []
          setHouses(housesData)
          
          const apartmentMap = {}
          const floorMap = {}
          const houseTypeMap = {}
          
          housesData.forEach(house => {
            if (house.apartment_id) {
              apartmentMap[house.apartment_id] = {
                id: house.apartment_id,
                name: house.apartment_name,
                address: house.apartment_address,
                city: house.apartment_city,
              }
            }
            
            if (house.floor_id) {
              floorMap[house.floor_id] = {
                id: house.floor_id,
                floor_id: house.floor_id,
                floor_number: house.floor_number 
              }
            }
            
            if (house.housetype_id) {
              houseTypeMap[house.housetype_id] = {
                id: house.housetype_id,
                name: house.house_type_name,
                sqrfeet: house.house_type_sqrfeet,
                rooms: house.house_type_rooms,
                bathrooms: house.house_type_bathrooms,
              }
            }
          })
          
          setApartments(apartmentMap)
          setFloors(floorMap)
          setHouseTypes(Object.values(houseTypeMap))
          
          if (housesData.length > 0) {
            setSelectedHouse(housesData[0])
            fetchMyBillPayments()
          } else {
            setSelectedHouse(null)
          }
        } else {
          setError(res.data.message || 'Failed to fetch houses')
        }
      } else {
        setError('No authentication token found. Please log in.')
      }
    } catch (err) {
      console.error('Failed to fetch house data:', err)
      
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.')
      } else if (err.response?.status === 403) {
        setError('Access denied. Please contact administrator.')
      } else if (err.response?.status === 404) {
        setError('No houses found for your account.')
      } else if (err.request) {
        setError('Network error. Please check your internet connection.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBillPayments = async () => {
    try {
      setLoadingBills(true)
      setError(null)
      
      //console.log('🔍 [Frontend] Fetching bill payments...')
      
      // Build query params
      const params = {}
      // if (filters.status !== 'all') params.payment_status = filters.status
      // if (filters.month !== 'all') params.month = filters.month
      // if (filters.year !== 'all') params.year = filters.year
      // if (filters.house_id !== 'all') params.house_id = filters.house_id
      
      //console.log('🔍 [Frontend] Query params:', params)
      
      const res = await api.get('/bill-payments/house-owner/me', {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        },
        params: params
      })
      
      //console.log('✅ [Frontend] Response received:', res.data)
      
      if (res.data.success) {
        const billsData = res.data.data || []
        const housesData = res.data.houses || houses // Use existing houses if not returned
        
        //console.log(`✅ [Frontend] Found ${billsData.length} bills for ${housesData.length} houses`)
        
        setBills(billsData)
        setFilteredBills(billsData)
        
        // Only update houses if we got new data
        if (res.data.houses) {
          setHouses(housesData)
        }
        
        // Update summary from API response
        if (res.data.summary) {
          setSummaryStats(res.data.summary)
        }
        
        // Set selected house if not set
        if (housesData.length > 0 && !selectedHouse) {
          setSelectedHouse(housesData[0])
        }
      } else {
        console.error('[Frontend] API error:', res.data.message)
        setError(res.data.message || 'Failed to fetch bills')
        setBills([])
        setFilteredBills([])
      }
    } catch (err) {
      console.error('[Frontend] Failed to fetch bill payments:', err)

       try {
      const debugRes = await api.get('/bill-payments/debug/database-state', {
        headers: { 
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      //console.log('🔍 [Frontend] Debug database state:', debugRes.data);
    } catch (debugErr) {
      console.error(' [Frontend] Debug endpoint failed:', debugErr);
    }
      
      if (err.response) {
        console.error('[Frontend] Error response:', {
          status: err.response.status,
          data: err.response.data,
          headers: err.response.headers
        })
        
        if (err.response.status === 401) {
          setError('Session expired. Please log in again.')
        } else if (err.response.status === 403) {
          setError('Access denied. Please contact administrator.')
        } else if (err.response.status === 404) {
          setError('No bill payments found for your account.')
          setBills([])
          setFilteredBills([])
        } else if (err.response.data?.message) {
          setError(err.response.data.message)
        } else {
          setError(`Server error: ${err.response.status}`)
        }
      } else if (err.request) {
        console.error('[Frontend] No response received:', err.request)
        setError('Network error. Please check your internet connection.')
      } else {
        console.error('[Frontend] Request setup error:', err.message)
        setError('An unexpected error occurred: ' + err.message)
      }
    } finally {
      setLoadingBills(false)
    }
  }

  useEffect(() => {
    fetchHouseOwnerData()
  }, [auth.accessToken])

  useEffect(() => {
    if (selectedHouse) {
      fetchMyBillPayments()
    }
  }, [selectedHouse, filters]) // Added filters to dependency

  // Apply filters locally (in addition to API filtering)
  useEffect(() => {
    if (!bills.length) {
      setFilteredBills([])
      return
    }

    let filtered = [...bills]

    // Filter by status (if not already filtered by API)
    if (filters.status !== 'all') {
      filtered = filtered.filter(bill => bill.payment_status === filters.status)
    }

    // Filter by month (if not already filtered by API)
    if (filters.month !== 'all') {
      filtered = filtered.filter(bill => bill.month === filters.month)
    }

    // Filter by year (if not already filtered by API)
    if (filters.year !== 'all') {
      filtered = filtered.filter(bill => bill.year.toString() === filters.year.toString())
    }

    // Filter by house (if not already filtered by API)
    if (filters.house_id !== 'all') {
      filtered = filtered.filter(bill => bill.house_id === filters.house_id)
    }

    setFilteredBills(filtered)
  }, [bills, filters])

  const handleHouseSelect = (house) => {
    setSelectedHouse(house)
    setFilters({
      status: 'all',
      month: 'all',
      year: 'all', // Changed to 'all'
      house_id: house.id // Auto-select the chosen house
    })
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: 'all',
      month: 'all',
      year: 'all',
      house_id: selectedHouse?.id || 'all'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
      case 'Partial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
      case 'Partial':
        return <DollarSign size={16} className="text-blue-600 dark:text-blue-400" />
      case 'Pending':
        return <Clock size={16} className="text-yellow-600 dark:text-yellow-400" />
      default:
        return <Clock size={16} className="text-gray-600 dark:text-gray-400" />
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Get unique years from bills
  const years = [...new Set(bills.map(bill => bill.year))].filter(Boolean).sort((a, b) => b - a)

  // Calculate summary statistics from filtered bills
  const calculateSummary = () => {
    const totalBills = filteredBills.length
    const totalAmount = filteredBills.reduce((sum, bill) => sum + (parseFloat(bill.totalAmount) || 0), 0)
    const paidAmount = filteredBills.reduce((sum, bill) => sum + (parseFloat(bill.paidAmount) || 0), 0)
    const pendingAmount = filteredBills.reduce((sum, bill) => sum + (parseFloat(bill.pendingAmount) || 0), 0)
    
    return {
      totalBills,
      totalAmount,
      paidAmount,
      pendingAmount
    }
  }

  const summary = calculateSummary()

  // const handleDownloadBill = (bill) => {
  //   // Real implementation would go here
  //   alert('Download functionality coming soon!')
  // }

  // const handlePayBill = (bill) => {
  //   // Real implementation would go here
  //   alert('Payment functionality coming soon!')
  // }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen">
        <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} md:ml-64`}>
          <HouseOwnerNavbar />
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Loading your information...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen">
      <HouseOwnerSidebar onCollapse={setIsSidebarCollapsed} />
      
      <div className={`
        flex-1 flex flex-col overflow-hidden 
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} 
        w-full transition-all duration-300
      `}>
        <HouseOwnerNavbar />
        
        <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 md:mb-6 gap-4'>
              <div className='flex items-center'>
                <Receipt size={32} className='text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0'/>
                <div className="min-w-0">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white truncate">
                    My Bills
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
                    View and manage your bills
                  </p>
                </div>
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

            {/* House Selection for mobile */}
            {houses.length > 1 && (
              <div className="lg:hidden mb-4 bg-white dark:bg-gray-800 rounded-lg shadow p-3">
                <h3 className="text-sm font-medium text-gray-800 dark:text-white mb-2">
                  Select House to View Bills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {houses.map((house, index) => (
                    <button
                      key={house.id}
                      onClick={() => handleHouseSelect(house)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        selectedHouse?.id === house.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      House {house.house_id || index + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* House Details Card */}
            {selectedHouse && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">
                      Current House Details
                    </h2>
                    <div className="flex items-center space-x-2">
                      <Building2 size={18} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedHouse.apartment_name}
                      </span>
                      <Home size={18} className="text-gray-500 dark:text-gray-400 ml-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        House {selectedHouse.house_id}, Floor {selectedHouse.floor_number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 md:mb-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Bills</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                          {summary.totalBills}
                        </p>
                      </div>
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Receipt size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                          ${summary.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <DollarSign size={20} className="text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                          ${summary.paidAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pending Amount</p>
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                          ${summary.pendingAmount.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4 md:mb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 md:mb-0">
                      Filter Bills
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Filter size={18} className="text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {filteredBills.length} of {bills.length} bills
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Payment Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-full px-3 text-gray-600 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>

                    {/* Month Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Month
                      </label>
                      <select
                        value={filters.month}
                        onChange={(e) => handleFilterChange('month', e.target.value)}
                        className="w-full px-3 py-2 text-gray-600 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="all">All Months</option>
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Year
                      </label>
                      {/* <select
                        value={filters.year}
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                        className="w-full px-3 py-2 text-gray-600 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select> */}
                      <div>
                        <input
                          type="number"
                          value={filters.year}
                          onChange={(e) => handleFilterChange('year', e.target.value)}
                          min="2025"
                          max="2100"
                          className="w-full px-3 py-2 text-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Enter year"
                          required
                        />
                      </div>
                    </div>

                    {/* House Filter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        House
                      </label>
                      <select
                        value={filters.house_id}
                        onChange={(e) => handleFilterChange('house_id', e.target.value)}
                        className="w-full px-3 py-2 text-gray-600 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="all">All Houses</option>
                        {houses.map((house) => (
                          <option key={house.id} value={house.id}>
                            House {house.house_id} - Floor {house.floor_number}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>

                {/* Bills Table */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  {loadingBills ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="ml-3 text-gray-600 dark:text-gray-400">Loading bills...</span>
                    </div>
                  ) : filteredBills.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt size={48} className="mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No bills found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {bills.length === 0 
                          ? 'No bills have been generated for your houses yet.' 
                          : 'No bills match your filter criteria.'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Bill Details
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Period
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredBills.map((bill, index) => (
                            <tr key={bill.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="px-4 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {bill.bill_name}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Type: {bill.billtype}
                                  </div>
                                  {bill.description && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {bill.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {bill.month} {bill.year}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Due: {bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'Not set'}
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm">
                                  <div className="text-gray-900 dark:text-white">
                                    Total: ${(parseFloat(bill.totalAmount) || 0).toFixed(2)}
                                  </div>
                                  <div className="text-green-600 dark:text-green-400">
                                    Paid: ${(parseFloat(bill.paidAmount) || 0).toFixed(2)}
                                  </div>
                                  <div className="text-red-600 dark:text-red-400">
                                    Pending: ${(parseFloat(bill.pendingAmount) || 0).toFixed(2)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center">
                                  {getStatusIcon(bill.payment_status)}
                                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(bill.payment_status)}`}>
                                    {bill.payment_status}
                                  </span>
                                </div>
                              </td>
                              {/* <td className="px-4 py-4">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleDownloadBill(bill)}
                                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                                    title="Download Bill"
                                  >
                                    <Download size={18} />
                                  </button>
                                  {bill.payment_status === 'Pending' && (
                                    <button
                                      onClick={() => handlePayBill(bill)}
                                      className="p-2 text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors flex items-center"
                                      title="Pay Now"
                                    >
                                      <ArrowUpRight size={18} />
                                    </button>
                                  )}
                                </div>
                              </td> */}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* No Houses Message */}
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