import React, { useState, useEffect } from 'react';
import { X, Plus, Home, Building2, MapPin, Navigation, Users } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function ViewApartment({ apartment, onClose, onAddHouse }) {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddHouseModal, setShowAddHouseModal] = useState(false);

  const loadHouses = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/houses?apartment_id=${apartment.id}`);
      setHouses(response.data.data || []);
    } catch (err) {
      console.error('Error loading houses:', err);
      toast.error('Failed to load houses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (apartment) {
      loadHouses();
    }
  }, [apartment]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'occupied': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'vacant': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Building2 size={24} className="text-purple-600 dark:text-purple-400 mr-3" />
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {apartment.name} - Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Apartment Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Basic Information</h3>
              <div className="flex items-center">
                <MapPin size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">{apartment.address}</span>
              </div>
              <div className="flex items-center">
                <Navigation size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">{apartment.city || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <Building2 size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">{apartment.floors} Floors</span>
              </div>
              <div className="flex items-center">
                <Home size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-300">{apartment.houses} Units</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Status & Image</h3>
              <div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  apartment.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : apartment.status === 'maintenance'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                }`}>
                  {apartment.status}
                </span>
              </div>
              {apartment.picture && (
                <div className="mt-2">
                  <img 
                    src={apartment.picture} 
                    alt={apartment.name}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Houses Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Houses/Units</h3>
              <button
                onClick={() => setShowAddHouseModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700"
              >
                <Plus size={16} />
                Add House
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Loading houses...</p>
              </div>
            ) : houses.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                <Home size={48} className="mx-auto mb-4 text-gray-400" />
                <p>No houses found</p>
                <p className="text-sm">Add houses to this apartment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {houses.map((house) => (
                  <div key={house.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        Unit {house.house_number}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(house.status)}`}>
                        {house.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <p>Floor: {house.floor_number}</p>
                      {house.house_owner && <p>Owner: {house.house_owner}</p>}
                      <p>Members: {house.members}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>

      {/* Add House Modal (you'll need to create this component) */}
      {/* {showAddHouseModal && (
        <AddHouseModal
          apartment={apartment}
          onClose={() => setShowAddHouseModal(false)}
          onHouseAdded={() => {
            loadHouses();
            setShowAddHouseModal(false);
          }}
        />
      )} */}
    </div>
  );
}