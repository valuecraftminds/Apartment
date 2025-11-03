import React, { useState, useEffect } from 'react';
import { Loader, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';

export default function AssignBills({ 
  isOpen, 
  onClose, 
  selectedBill, 
  onAssignSuccess 
}) {
  // States for assign modal
  const [apartments, setApartments] = useState([]);
  const [floors, setFloors] = useState({});
  const [houses, setHouses] = useState({});
  const [selectedApartment, setSelectedApartment] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedHouses, setSelectedHouses] = useState([]);
  const [expandedApartments, setExpandedApartments] = useState({});
  const [expandedFloors, setExpandedFloors] = useState({});
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState({});
  const [loadingHouses, setLoadingHouses] = useState({});
  const [assigning, setAssigning] = useState(false);

  // Load apartments for assign modal
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
    
    if (!isExpanded && !floors[apartment.id]) {
      await loadFloorsForApartment(apartment.id);
    }
    
    setExpandedApartments(prev => ({
      ...prev,
      [apartment.id]: !isExpanded
    }));
    
    // Set selected apartment when expanded
    if (!isExpanded) {
      setSelectedApartment(apartment.id);
      setSelectedFloor('');
      setSelectedHouses([]);
    }
  };

  // Toggle floor expansion
  const toggleFloor = async (apartmentId, floor) => {
    const floorKey = `${apartmentId}-${floor.id}`;
    const isExpanded = expandedFloors[floorKey];
    
    if (!isExpanded && !houses[floor.id]) {
      await loadHousesForFloor(apartmentId, floor.id);
    }
    
    setExpandedFloors(prev => ({
      ...prev,
      [floorKey]: !isExpanded
    }));
    
    // Set selected floor when expanded
    if (!isExpanded) {
      setSelectedFloor(floor.id);
      setSelectedHouses([]);
    }
  };

  // Handle individual house selection
  const handleHouseSelect = (houseId) => {
    setSelectedHouses(prev => {
      if (prev.includes(houseId)) {
        return prev.filter(id => id !== houseId);
      } else {
        return [...prev, houseId];
      }
    });
  };

  // Handle select all houses for current floor
  const handleSelectAll = () => {
    if (!selectedFloor) return;
    
    const currentHouses = houses[selectedFloor] || [];
    const allHouseIds = currentHouses.map(house => house.id);
    const allSelected = allHouseIds.every(id => selectedHouses.includes(id));
    
    if (allSelected) {
      setSelectedHouses(prev => prev.filter(id => !allHouseIds.includes(id)));
    } else {
      setSelectedHouses(prev => {
        const newSelection = [...prev];
        allHouseIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Check if all houses in current floor are selected
  const isAllHousesSelected = () => {
    if (!selectedFloor) return false;
    const currentHouses = houses[selectedFloor] || [];
    if (currentHouses.length === 0) return false;
    return currentHouses.every(house => selectedHouses.includes(house.id));
  };

  // Check if some houses in current floor are selected
  const isSomeHousesSelected = () => {
    if (!selectedFloor) return false;
    const currentHouses = houses[selectedFloor] || [];
    if (currentHouses.length === 0) return false;
    return currentHouses.some(house => selectedHouses.includes(house.id)) && 
           !isAllHousesSelected();
  };

  // Submit assignment - KEEPING THE ORIGINAL FUNCTIONALITY
  const handleAssignSubmit = async () => {
    if (!selectedApartment || !selectedFloor || selectedHouses.length === 0) {
      toast.error('Please select apartment, floor, and at least one house');
      return;
    }

    setAssigning(true);
    try {
      const assignmentData = {
        bill_id: selectedBill.id,
        apartment_id: selectedApartment,
        floor_id: selectedFloor,
        house_ids: selectedHouses
      };

      await api.post('/bill-assignments/assign', assignmentData);
      toast.success("Bill assign successfully")
      onAssignSuccess();
      handleClose();
    } catch (err) {
      console.error('Error assigning bill:', err);
      toast.error(err.response?.data?.message || 'Failed to assign bill');
    } finally {
      setAssigning(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setSelectedApartment('');
    setSelectedFloor('');
    setFloors({});
    setHouses({});
    setSelectedHouses([]);
    setExpandedApartments({});
    setExpandedFloors({});
    onClose();
  };

  // Load apartments when modal opens
  useEffect(() => {
    if (isOpen) {
      loadApartments();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Assign Bill: <span className="text-purple-600">{selectedBill?.bill_name}</span>
        </h2>
        
        <div className="space-y-6">
          {/* Apartments List - Hierarchical View */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Apartment *
            </label>
            
            {loadingApartments ? (
              <div className="flex items-center justify-center p-8">
                <Loader size={24} className="animate-spin mr-3 text-purple-600" />
                <span className="text-gray-600 dark:text-gray-400">Loading apartments...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {apartments.map(apartment => (
                  <div key={apartment.id} className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    {/* Apartment Header */}
                    <div 
                      className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                        selectedApartment === apartment.id 
                          ? 'bg-purple-50 dark:bg-purple-900/20 border-l-4 border-l-purple-600' 
                          : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                      }`}
                      onClick={() => toggleApartment(apartment)}
                    >
                      <span className="font-medium text-gray-800 dark:text-white">
                        {apartment.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleApartment(apartment);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-lg transition-colors"
                      >
                        {expandedApartments[apartment.id] ? (
                          <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
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
                            {(floors[apartment.id] || []).map(floor => (
                              <div key={floor.id} className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                {/* Floor Header */}
                                <div 
                                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                                    selectedFloor === floor.id 
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500' 
                                      : 'bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500'
                                  }`}
                                  onClick={() => toggleFloor(apartment.id, floor)}
                                >
                                  <span className="font-medium text-gray-800 dark:text-white">
                                    {floor.floor_id}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFloor(apartment.id, floor);
                                    }}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-400 rounded-lg transition-colors"
                                  >
                                    {expandedFloors[`${apartment.id}-${floor.id}`] ? (
                                      <ChevronUp size={18} className="text-gray-600 dark:text-gray-400" />
                                    ) : (
                                      <ChevronDown size={18} className="text-gray-600 dark:text-gray-400" />
                                    )}
                                  </button>
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
                                      <div className="p-4 space-y-3">
                                        {/* Select All for this floor */}
                                        <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-400 rounded">
                                          <input
                                            type="checkbox"
                                            checked={isAllHousesSelected()}
                                            ref={input => {
                                              if (input) {
                                                input.indeterminate = isSomeHousesSelected();
                                              }
                                            }}
                                            onChange={handleSelectAll}
                                            className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                                          />
                                          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-800">
                                            Select All Houses
                                          </span>
                                        </div>
                                        
                                        {/* Houses Checkboxes */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                                          {(houses[floor.id] || []).map(house => (
                                            <div key={house.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-400 rounded border hover:bg-gray-100 dark:hover:bg-gray-300 transition-colors">
                                              <input
                                                type="checkbox"
                                                checked={selectedHouses.includes(house.id)}
                                                onChange={() => handleHouseSelect(house.id)}
                                                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                                              />
                                              <div className="ml-3 flex-1">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-800">
                                                  {house.house_id}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-700 capitalize">
                                                  ({house.status})
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selection Summary */}
          {/* {(selectedApartment || selectedFloor || selectedHouses.length > 0) && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Selection Summary:</h3>
              {selectedApartment && (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Apartment:</strong> {apartments.find(a => a.id === selectedApartment)?.name}
                </p>
              )}
              {selectedFloor && (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Floor:</strong> {Object.values(floors).flat().find(f => f.id === selectedFloor)?.floor_id}
                </p>
              )}
              {selectedHouses.length > 0 && (
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Houses:</strong> {selectedHouses.length} selected
                </p>
              )}
            </div>
          )} */}

          {/* Selected Houses Summary */}
          {selectedHouses.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>{selectedHouses.length}</strong> house{selectedHouses.length !== 1 ? 's' : ''} selected for assignment
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignSubmit}
              disabled={!selectedApartment || !selectedFloor || selectedHouses.length === 0 || assigning}
              className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {assigning ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Assigning...
                </>
              ) : (
                `Assign to ${selectedHouses.length} House${selectedHouses.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}