// TechnicianCategoryModel.jsx
import React, { useState, useEffect } from 'react';
import { X, Tag, Check, Search, Loader, Layers, Award, Users, Clock, Layers2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function TechnicianCategoryModal({ user, onClose, onAssignSuccess }) {
  const [allCategories, setAllCategories] = useState([]);
  const [assignedCategories, setAssignedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [activeTab, setActiveTab] = useState('categories');

  // Load categories and current assignments
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all available categories
        const categoriesResponse = await api.get('/categories');
        if (categoriesResponse.data.success) {
          // Filter to only show active categories
          const activeCategories = (categoriesResponse.data.data || []).filter(
            category => category.is_active !== false
          );
          setAllCategories(activeCategories);
        }

        // Load user's current category assignments
        const assignmentsResponse = await api.get(`/technician-categories/technicians/${user.id}/categories`);
        if (assignmentsResponse.data.success) {
          const assignedCats = assignmentsResponse.data.data || [];
          setAssignedCategories(assignedCats);
          
          // Pre-select currently assigned categories
          const assignedIds = new Set(assignedCats.map(cat => cat.category_id));
          setSelectedCategories(assignedIds);
        }
      } catch (error) {
        console.error('Error loading category data:', error);
        toast.error('Failed to load category data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Filter categories based on search term
  const filteredCategories = allCategories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if category is assigned to technician
  const isCategoryAssigned = (categoryId) => {
    return assignedCategories.some(cat => cat.category_id === categoryId);
  };

  // Check if category is selected
  const isCategorySelected = (categoryId) => {
    return selectedCategories.has(categoryId);
  };

  // Toggle category selection
  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(categoryId)) {
        newSelection.delete(categoryId);
      } else {
        newSelection.add(categoryId);
      }
      return newSelection;
    });
  };

  // Select all categories
  const selectAllCategories = () => {
    const allIds = new Set(allCategories.map(cat => cat.id));
    setSelectedCategories(allIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedCategories(new Set());
  };

  // Save assignments
  const saveAssignments = async () => {
    try {
      setSaving(true);
      const categoryIds = Array.from(selectedCategories);
      
      await api.post(`/technician-categories/technicians/${user.id}/categories`, {
        category_ids: categoryIds
      });
      
      toast.success('Categories assigned successfully!');
      onAssignSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error assigning categories:', error);
      toast.error(error.response?.data?.message || 'Failed to assign categories');
    } finally {
      setSaving(false);
    }
  };

  // Get assigned category info
  const getAssignedCategoryInfo = (categoryId) => {
    return assignedCategories.find(cat => cat.category_id === categoryId);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Get assigned technicians count
  const getAssignedTechniciansCount = (category) => {
    return category.technician_count || 0;
  };

  return (
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
                    placeholder="Search categories by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={selectAllCategories}
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
                  <p className="text-gray-600 dark:text-gray-300">Loading categories...</p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                  <Tag size={48} className="mb-4 opacity-50" />
                  <p className="text-lg">No categories found</p>
                  <p className="text-sm">
                    {searchTerm ? 'Try adjusting your search terms' : 'No categories available to assign'}
                  </p>
                  <p className="text-xs mt-2 text-gray-400">Only active categories are shown here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                  {filteredCategories.map((category) => {
                    const isSelected = isCategorySelected(category.id);
                    const isAssigned = isCategoryAssigned(category.id);
                    const assignedInfo = getAssignedCategoryInfo(category.id);

                    return (
                      <div
                        key={category.id}
                        className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/20'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-400'
                        }`}
                        onClick={() => toggleCategorySelection(category.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {category.icon ? (
                                <span className="text-xl" role="img" aria-label="category icon">
                                  {category.icon}
                                </span>
                              ) : (
                                <Layers2 size={16} className="text-gray-400" />
                              )}
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {category.name}
                              </h3>
                              {isAssigned && (
                                <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                  Assigned
                                </span>
                              )}
                              {category.is_active === false && (
                                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                            
                            {category.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                                {category.description}
                              </p>
                            )}
                            
                            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center space-x-1">
                                <Users size={12} />
                                <span>{getAssignedTechniciansCount(category)} assigned</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center space-x-1">
                                <Award size={12} />
                                <span>Service Category</span>
                              </span>
                            </div>

                            {assignedInfo && (
                              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                                <Clock size={12} />
                                <span>Assigned: {formatDate(assignedInfo.assigned_at)}</span>
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
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {selectedCategories.size} category(ies) selected
                {assignedCategories.length > 0 && (
                  <span> • {assignedCategories.length} currently assigned</span>
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
  );
}