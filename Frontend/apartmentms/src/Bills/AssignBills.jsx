import React, { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
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
  const [floors, setFloors] = useState([]);
  const [houses, setHouses] = useState([]);
  const [selectedApartment, setSelectedApartment] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedHouses, setSelectedHouses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(false);
  const [loadingHouses, setLoadingHouses] = useState(false);
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

  // Load floors based on selected apartment
  const loadFloors = async (apartmentId) => {
    if (!apartmentId) {
      setFloors([]);
      setSelectedFloor('');
      return;
    }
    try {
      setLoadingFloors(true);
      const result = await api.get(`/floors?apartment_id=${apartmentId}`);
      if (result.data.success) {
        setFloors(result.data.data || []);
      }
    } catch (err) {
      console.error('Error loading floors:', err);
      toast.error('Failed to load floors');
    } finally {
      setLoadingFloors(false);
    }
  };

  // Load houses based on selected floor
  const loadHouses = async (apartmentId, floorId) => {
    if (!apartmentId || !floorId) {
      setHouses([]);
      setSelectedHouses([]);
      return;
    }
    try {
      setLoadingHouses(true);
      const result = await api.get(`/houses?apartment_id=${apartmentId}&floor_id=${floorId}`);
      if (result.data.success) {
        const housesData = result.data.data || [];
        setHouses(housesData);
        setSelectedHouses([]);
        setSelectAll(false);
      }
    } catch (err) {
      console.error('Error loading houses:', err);
      toast.error('Failed to load houses');
    } finally {
      setLoadingHouses(false);
    }
  };

  // Handle apartment selection
  const handleApartmentChange = (e) => {
    const apartmentId = e.target.value;
    setSelectedApartment(apartmentId);
    setSelectedFloor('');
    setFloors([]);
    setHouses([]);
    setSelectedHouses([]);
    if (apartmentId) {
      loadFloors(apartmentId);
    }
  };

  // Handle floor selection
  const handleFloorChange = (e) => {
    const floorId = e.target.value;
    setSelectedFloor(floorId);
    setHouses([]);
    setSelectedHouses([]);
    if (selectedApartment && floorId) {
      loadHouses(selectedApartment, floorId);
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

  // Handle select all houses
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedHouses([]);
    } else {
      const allHouseIds = houses.map(house => house.id);
      setSelectedHouses(allHouseIds);
    }
    setSelectAll(!selectAll);
  };

  // Update selectAll when selectedHouses changes
  useEffect(() => {
    if (houses.length > 0) {
      setSelectAll(selectedHouses.length === houses.length);
    }
  }, [selectedHouses, houses]);

  // Submit assignment
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
      //toast.success(`Bill "${selectedBill.bill_name}" assigned to ${selectedHouses.length} house(s) successfully!`);
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
    setFloors([]);
    setHouses([]);
    setSelectedHouses([]);
    setSelectAll(false);
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
          {/* Apartment Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Apartment *
            </label>
            <select
              value={selectedApartment}
              onChange={handleApartmentChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loadingApartments}
            >
              <option value="">Choose Apartment</option>
              {apartments.map(apartment => (
                <option key={apartment.id} value={apartment.id}>
                  {apartment.name}
                </option>
              ))}
            </select>
            {loadingApartments && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <Loader size={16} className="animate-spin mr-2" />
                Loading apartments...
              </p>
            )}
          </div>

          {/* Floor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Floor *
            </label>
            <select
              value={selectedFloor}
              onChange={handleFloorChange}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!selectedApartment || loadingFloors}
            >
              <option value="">{!selectedApartment ? 'Select apartment first' : 'Choose Floor'}</option>
              {floors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.floor_id}
                </option>
              ))}
            </select>
            {loadingFloors && (
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <Loader size={16} className="animate-spin mr-2" />
                Loading floors...
              </p>
            )}
          </div>

          {/* Houses Selection */}
          {houses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Houses ({selectedHouses.length} selected)
                </label>
                <span className="text-sm text-gray-500">
                  {houses.length} houses available
                </span>
              </div>
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50 dark:bg-gray-700">
                {/* Select All Checkbox */}
                <div className="flex items-center mb-3 p-2 bg-white dark:bg-gray-600 rounded border">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select All Houses
                  </span>
                </div>
                
                {/* Houses List */}
                <div className="space-y-2">
                  {houses.map(house => (
                    <div key={house.id} className="flex items-center p-3 bg-white dark:bg-gray-600 rounded border hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedHouses.includes(house.id)}
                        onChange={() => handleHouseSelect(house.id)}
                        className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div className="ml-3 flex-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {house.house_id}
                        </span>
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 capitalize">
                          ({house.status})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {loadingHouses && (
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <Loader size={16} className="animate-spin mr-2" />
                  Loading houses...
                </p>
              )}
            </div>
          )}

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