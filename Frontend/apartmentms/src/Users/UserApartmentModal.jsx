// UserApartmentModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Building2, Check, Search, Loader, MapPin, Home } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import UserBillModal from './UserBillModal';
import TechnicianCategoryModal from './TechnicianCategoryModel';

export default function UserApartmentModal({ user, onClose, onAssignSuccess }) {
  const [allApartments, setAllApartments] = useState([]);
  const [assignedApartments, setAssignedApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApartments, setSelectedApartments] = useState(new Set());
  const [activeTab, setActiveTab] = useState('apartments');

  // Load apartments and current assignments
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all available apartments
        const apartmentsResponse = await api.get('/apartments');
        if (apartmentsResponse.data.success) {
          setAllApartments(apartmentsResponse.data.data || []);
        }

        // Load user's current apartment assignments
        const assignmentsResponse = await api.get(`/user-apartments/users/${user.id}/apartments`);
        if (assignmentsResponse.data.success) {
          const assignedApts = assignmentsResponse.data.data || [];
          setAssignedApartments(assignedApts);
          
          // Pre-select currently assigned apartments
          const assignedIds = new Set(assignedApts.map(apt => apt.id));
          setSelectedApartments(assignedIds);
        }
      } catch (error) {
        console.error('Error loading apartment data:', error);
        toast.error('Failed to load apartment data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Filter apartments based on search term
  const filteredApartments = allApartments.filter(apartment =>
    apartment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apartment.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apartment.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if apartment is assigned to user
  const isApartmentAssigned = (apartmentId) => {
    return assignedApartments.some(apt => apt.id === apartmentId);
  };

  // Check if apartment is selected
  const isApartmentSelected = (apartmentId) => {
    return selectedApartments.has(apartmentId);
  };

  // Toggle apartment selection
  const toggleApartmentSelection = (apartmentId) => {
    setSelectedApartments(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(apartmentId)) {
        newSelection.delete(apartmentId);
      } else {
        newSelection.add(apartmentId);
      }
      return newSelection;
    });
  };

  // Select all apartments
  const selectAllApartments = () => {
    const allIds = new Set(allApartments.map(apt => apt.id));
    setSelectedApartments(allIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedApartments(new Set());
  };

  // Save assignments
  const saveAssignments = async () => {
    try {
      setSaving(true);
      const apartmentIds = Array.from(selectedApartments);
      
      await api.post(`/user-apartments/users/${user.id}/apartments`, {
        apartment_ids: apartmentIds
      });
      onAssignSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error assigning apartments:', error);
      toast.error(error.response?.data?.message || 'Failed to assign apartments');
    } finally {
      setSaving(false);
    }
  };

  // Get assigned apartment info
  const getAssignedApartmentInfo = (apartmentId) => {
    return assignedApartments.find(apt => apt.id === apartmentId);
  };

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

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Building2 className="text-purple-600 dark:text-purple-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Assign Apartments and Bills
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {user.firstname} {user.lastname} 
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-6 px-6">
          <button
            onClick={() => setActiveTab("apartments")}
            className={`px-4 py-2 font-semibold transition-colors duration-200 
                ${activeTab === "apartments"
                    ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}>
            Assign Apartments
          </button>
          <button
            onClick={() => setActiveTab("bills")}
            className={`px-4 py-2 font-semibold 
                ${activeTab === "bills"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
          >
            Assign Bills
          </button>
          <button
            onClick={() => setActiveTab("complaint_categories")}
            className={`px-4 py-2 font-semibold 
                ${activeTab === "complaint_categories"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
          >
            Assign Categories
          </button>
        </div>

        {activeTab === "apartments" ? (
          <>
            {/* Search and Controls */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search 
                    size={20} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    placeholder="Search apartments by name, address, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllApartments}
                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllSelections}
                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader size={32} className="animate-spin text-purple-600 mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">Loading apartments...</p>
                </div>
              ) : filteredApartments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Building2 size={48} className="mb-4 opacity-50" />
                  <p className="text-lg">No apartments found</p>
                  <p className="text-sm">
                    {searchTerm ? 'Try adjusting your search terms' : 'No apartments available to assign'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {filteredApartments.map((apartment) => {
                    const isSelected = isApartmentSelected(apartment.id);
                    const isAssigned = isApartmentAssigned(apartment.id);
                    const assignedInfo = getAssignedApartmentInfo(apartment.id);

                    return (
                      <div
                        key={apartment.id}
                        className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/20'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-400'
                        }`}
                        onClick={() => toggleApartmentSelection(apartment.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Home size={16} className="text-gray-400" />
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {apartment.name}
                              </h3>
                              {isAssigned && (
                                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                  Currently Assigned
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300 mb-2">
                              <MapPin size={14} />
                              <span>{apartment.address}, {apartment.city}</span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>{apartment.floors} floors</span>
                              <span>•</span>
                              <span>{apartment.houses} houses</span>
                              <span>•</span>
                              <span>{apartment.is_active ? 'Active' : 'Inactive'}</span>
                            </div>

                            {assignedInfo && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Assigned on: {formatDate(assignedInfo.assigned_at)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center ml-4">
                            {isSelected ? (
                              <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check size={14} className="text-white" />
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-500 rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 dark:bg-gray-750 rounded-b-xl">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {selectedApartments.size} apartment(s) selected
                {assignedApartments.length > 0 && (
                  <span> • {assignedApartments.length} currently assigned</span>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveAssignments}
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving && <Loader size={16} className="animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save Assignments'}</span>
                </button>
              </div>
            </div>
          </>
        ) : activeTab === "bills" ? (
          <UserBillModal 
            user={user} 
            onClose={onClose} 
            onAssignSuccess={onAssignSuccess}
          />
        ):(
          <TechnicianCategoryModal
            user={user}
            onClose={onClose}
            onAssignSuccess={onAssignSuccess}
          />
        )}        
      </div>
    </div>
  );
}