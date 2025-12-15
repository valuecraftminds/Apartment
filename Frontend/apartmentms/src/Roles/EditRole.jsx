// EditRole.jsx
import React, { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import api from '../api/axios';

export default function EditRole({ role, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    role_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form with role data
  useEffect(() => {
    if (role) {
      setFormData({
        role_name: role.role_name || ''
      });
    }
  }, [role]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.role_name.trim()) {
      newErrors.role_name = 'Role name is required';
    } else if (formData.role_name.trim().length < 2) {
      newErrors.role_name = 'Role name must be at least 2 characters long';
    } else if (formData.role_name.trim().length > 50) {
      newErrors.role_name = 'Role name must be less than 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.put(`/roles/${role.id}`, {
        role_name: formData.role_name.trim()
      });

      if (response.data.success) {
        onUpdated?.(response.data.data);
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      
      if (error.response?.status === 409) {
        toast.error('A role with this name already exists');
        setErrors({ role_name: 'A role with this name already exists' });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update role. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!role) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Edit Role
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Role Name */}
            <div>
              <label 
                htmlFor="role_name" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Role Name *
              </label>
              <input
                type="text"
                id="role_name"
                name="role_name"
                value={formData.role_name}
                onChange={handleChange}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                  errors.role_name 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50`}
                placeholder="Enter role name (e.g., Manager, Supervisor)"
              />
              {errors.role_name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.role_name}
                </p>
              )}
            </div>

            {/* Current Role Info */}
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Information
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><span className="font-medium">Current Name:</span> {role.role_name}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                    role.is_active 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              <span>{loading ? 'Updating...' : 'Update Role'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}