import React, { useState, useEffect } from 'react';
import { X, Plus, Home, Building2, MapPin, Navigation, Users } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function ViewApartment({ apartment, onClose}) {
  const [loading, setLoading] = useState(true);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white"></h3>
              {apartment.picture && (
                <div className="mt-2">
                  <img 
                    src={`http://localhost:3000${apartment.picture}`} 
                    alt={apartment.name}
                    className="w-52 h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <button className='flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
                Floors & Houses 
            </button>
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