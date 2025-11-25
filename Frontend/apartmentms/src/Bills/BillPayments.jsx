import React, { useState, useEffect } from 'react';
import { Loader, ChevronDown, ChevronUp, DollarSign, Receipt } from 'lucide-react';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function BillPayments() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [floors, setFloors] = useState({});
  const [houses, setHouses] = useState({});
  const [expandedApartments, setExpandedApartments] = useState({});
  const [expandedFloors, setExpandedFloors] = useState({});
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState({});
  const [loadingHouses, setLoadingHouses] = useState({});

  // Load apartments
  const loadApartments = async () => {
    try {
      setLoadingApartments(true);
      const result = await api.get('/apartments');
      if (result.data.success) {
        setApartments(result.data.data || []);
      }
    } catch (err) {
      console.error('Error loading apartments:', err);
      toast.error('Failed to load apartments');
    } finally {
      setLoadingApartments(false);
    }
  };

  // Load floors for a specific apartment
  const loadFloorsForApartment = async (apartmentId) => {
    if (!apartmentId) return;
    
    try {
      setLoadingFloors(prev => ({ ...prev, [apartmentId]: true }));
      const result = await api.get(`/floors?apartment_id=${apartmentId}`);
      if (result.data.success) {
        const floorsData = result.data.data || [];
        setFloors(prev => ({
          ...prev,
          [apartmentId]: floorsData
        }));
      }
    } catch (err) {
      console.error('Error loading floors:', err);
      toast.error('Failed to load floors');
    } finally {
      setLoadingFloors(prev => ({ ...prev, [apartmentId]: false }));
    }
  };

  // Load houses for a specific floor
  const loadHousesForFloor = async (apartmentId, floorId) => {
    if (!apartmentId || !floorId) return;
    
    try {
      setLoadingHouses(prev => ({ ...prev, [floorId]: true }));
      const result = await api.get(`/houses?apartment_id=${apartmentId}&floor_id=${floorId}`);
      if (result.data.success) {
        const housesData = result.data.data || [];
        setHouses(prev => ({
          ...prev,
          [floorId]: housesData
        }));
      }
    } catch (err) {
      console.error('Error loading houses:', err);
      toast.error('Failed to load houses');
    } finally {
      setLoadingHouses(prev => ({ ...prev, [floorId]: false }));
    }
  };

  // Toggle apartment expansion
  const toggleApartment = async (apartment) => {
    const isExpanded = expandedApartments[apartment.id];
    
    // Load floors if not already loaded
    if (!isExpanded && !floors[apartment.id]) {
      await loadFloorsForApartment(apartment.id);
    }
    
    setExpandedApartments(prev => ({
      ...prev,
      [apartment.id]: !isExpanded
    }));
  };

  // Toggle floor expansion
  const toggleFloor = async (apartmentId, floor) => {
    const floorKey = `${apartmentId}-${floor.id}`;
    const isExpanded = expandedFloors[floorKey];
    
    // Load houses if not already loaded
    if (!isExpanded && !houses[floor.id]) {
      await loadHousesForFloor(apartmentId, floor.id);
    }
    
    setExpandedFloors(prev => ({
      ...prev,
      [floorKey]: !isExpanded
    }));
  };

  // Load apartments on component mount
  useEffect(() => {
    loadApartments();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar/>
        <div className='flex-1 overflow-y-auto p-6'>
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6'>
              <div className='flex items-center'>
                <Receipt size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bill Payments</h1>
              </div>
            </div>

            {/* Hierarchical Apartments -> Floors -> Houses View */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Select Apartment, Floor and House
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click on apartments to view floors, then click on floors to view houses.
              </p>

              {/* Apartments List */}
              <div className="space-y-3">
                {loadingApartments ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader size={24} className="animate-spin mr-3 text-purple-600" />
                    <span className="text-gray-600 dark:text-gray-400">Loading apartments...</span>
                  </div>
                ) : apartments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No apartments found.
                  </div>
                ) : (
                  apartments.map(apartment => (
                    <div key={apartment.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                      
                      {/* Apartment Header */}
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => toggleApartment(apartment)}
                      >
                        <div className="flex items-center">
                          <span className="font-medium text-gray-800 dark:text-white">
                            {apartment.name}
                          </span>
                          {apartment.location && (
                            <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                              ({apartment.location})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          {loadingFloors[apartment.id] && (
                            <Loader size={16} className="animate-spin mr-2 text-purple-600" />
                          )}
                          <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-500 rounded transition-colors">
                            {expandedApartments[apartment.id] ? (
                              <ChevronUp size={20} className="text-purple-600" />
                            ) : (
                              <ChevronDown size={20} className="text-purple-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Floors List - Shown when apartment is expanded */}
                      {expandedApartments[apartment.id] && (
                        <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                          {loadingFloors[apartment.id] ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader size={16} className="animate-spin mr-2 text-purple-600" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Loading floors...</span>
                            </div>
                          ) : (
                            <div className="space-y-2 p-3">
                              {(floors[apartment.id] || []).length === 0 ? (
                                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                                  No floors found for this apartment.
                                </div>
                              ) : (
                                (floors[apartment.id] || []).map(floor => (
                                  <div key={floor.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                    
                                    {/* Floor Header */}
                                    <div 
                                      className="flex items-center justify-between p-3 cursor-pointer bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                                      onClick={() => toggleFloor(apartment.id, floor)}
                                    >
                                      <span className="font-medium text-gray-800 dark:text-white">
                                        Floor: {floor.floor_id}
                                      </span>
                                      <div className="flex items-center">
                                        {loadingHouses[floor.id] && (
                                          <Loader size={14} className="animate-spin mr-2 text-purple-600" />
                                        )}
                                        <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-400 rounded transition-colors">
                                          {expandedFloors[`${apartment.id}-${floor.id}`] ? (
                                            <ChevronUp size={18} className="text-purple-600" />
                                          ) : (
                                            <ChevronDown size={18} className="text-purple-600" />
                                          )}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Houses List - Shown when floor is expanded */}
                                    {expandedFloors[`${apartment.id}-${floor.id}`] && (
                                      <div className="bg-white dark:bg-gray-500 border-t border-gray-200 dark:border-gray-400">
                                        {loadingHouses[floor.id] ? (
                                          <div className="flex items-center justify-center p-3">
                                            <Loader size={14} className="animate-spin mr-2 text-purple-600" />
                                            <span className="text-xs text-gray-600 dark:text-gray-400">Loading houses...</span>
                                          </div>
                                        ) : (
                                          <div className="p-4">
                                            {(houses[floor.id] || []).length === 0 ? (
                                              <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                                                No houses found on this floor.
                                              </div>
                                            ) : (
                                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                                {(houses[floor.id] || []).map(house => (
                                                  <div 
                                                    key={house.id} 
                                                    className="p-3 bg-gray-50 dark:bg-gray-400 rounded-lg border border-gray-200 dark:border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors"
                                                  >
                                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-900">
                                                      {house.house_id}
                                                    </div>
                                                    <div className="text-xs text-gray-600 dark:text-gray-700 mt-1 capitalize">
                                                      Status: {house.status || 'N/A'}
                                                    </div>
                                                    {house.tenant_name && (
                                                      <div className="text-xs text-gray-600 dark:text-gray-700 mt-1">
                                                        Tenant: {house.tenant_name}
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Summary Information */}
              {/* <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
                      {apartments.length}
                    </div>
                    <div className="text-blue-600 dark:text-blue-400">
                      Apartments
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="font-semibold text-green-700 dark:text-green-300">
                      {Object.values(floors).flat().length}
                    </div>
                    <div className="text-green-600 dark:text-green-400">
                      Total Floors
                    </div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="font-semibold text-purple-700 dark:text-purple-300">
                      {Object.values(houses).flat().length}
                    </div>
                    <div className="text-purple-600 dark:text-purple-400">
                      Total Houses
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}