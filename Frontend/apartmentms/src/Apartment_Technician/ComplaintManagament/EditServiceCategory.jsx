// EditServiceCategory.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Loader, Check } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../api/axios';
import { toast } from 'react-toastify';

export default function EditServiceCategory({ onClose, onEdited, serviceCategory }) {
    const { auth } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#6b46c1' // Default purple color
    });
    const [errors, setErrors] = useState({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Check screen size
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Initialize form with service category data
    useEffect(() => {
        if (serviceCategory) {
            setFormData({
                name: serviceCategory.name || '',
                description: serviceCategory.description || '',
                color: serviceCategory.color || '#6b46c1'
            });
        }
    }, [serviceCategory]);

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        } else if (formData.name.length > 100) {
            newErrors.name = 'Name must be less than 100 characters';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        // Basic color validation
        if (!formData.color) {
            newErrors.color = 'Color is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle color picker change
    const handleColorChange = (e) => {
        setFormData(prev => ({
            ...prev,
            color: e.target.value
        }));
        if (errors.color) {
            setErrors(prev => ({ ...prev, color: '' }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setSubmitting(true);
        
        try {
            // Prepare update data
            const updateData = {
                name: formData.name.trim(),
                color: formData.color
            };
            
            // Only include description if it has value
            if (formData.description.trim()) {
                updateData.description = formData.description.trim();
            }
            
            const response = await api.put(`/categories/${serviceCategory.id}`, updateData);
            
            if (response.data.success) {
                onEdited(); // Call parent callback to refresh data
            } else {
                toast.error(response.data.message || 'Failed to update category');
            }
        } catch (error) {
            console.error('Update category error:', error);
            
            if (error.response) {
                // Handle specific error responses
                switch (error.response.status) {
                    case 400:
                        toast.error('Invalid data provided');
                        break;
                    case 401:
                        toast.error('Session expired. Please login again.');
                        break;
                    case 403:
                        toast.error('You do not have permission to update this category');
                        break;
                    case 404:
                        toast.error('Category not found');
                        onClose();
                        break;
                    case 409:
                        toast.error(error.response.data?.message || 'Category with this name already exists');
                        break;
                    default:
                        toast.error('Failed to update service category');
                }
            } else if (error.request) {
                toast.error('No response from server. Please check your connection.');
            } else {
                toast.error('An error occurred while updating the category');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Predefined color options for quick selection
    const colorOptions = [
        { value: '#6b46c1', label: 'Purple', color: 'bg-purple-500' },
        { value: '#4299e1', label: 'Blue', color: 'bg-blue-500' },
        { value: '#38a169', label: 'Green', color: 'bg-green-500' },
        { value: '#e53e3e', label: 'Red', color: 'bg-red-500' },
        { value: '#ed8936', label: 'Orange', color: 'bg-orange-500' },
        { value: '#d69e2e', label: 'Yellow', color: 'bg-yellow-500' },
        { value: '#4fd1c7', label: 'Teal', color: 'bg-teal-500' },
        { value: '#9f7aea', label: 'Indigo', color: 'bg-indigo-500' },
        { value: '#f687b3', label: 'Pink', color: 'bg-pink-500' },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Modal Header (already in parent) */}
            
            {/* Form Fields */}
            <div className="space-y-4">
                {/* Category Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-lg text-sm md:text-base transition-colors ${
                            errors.name 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        placeholder="Enter category name"
                        disabled={submitting}
                        maxLength={100}
                    />
                    {errors.name && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                    )}
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formData.name.length}/100 characters
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description (Optional)
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={isMobile ? 3 : 4}
                        className={`w-full px-3 py-2 border rounded-lg text-sm md:text-base transition-colors ${
                            errors.description 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500'
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none`}
                        placeholder="Enter category description"
                        disabled={submitting}
                        maxLength={500}
                    />
                    {errors.description && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description}</p>
                    )}
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formData.description.length}/500 characters
                    </div>
                </div>

                {/* Color Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Color *
                    </label>
                    
                    {/* Quick Color Selection */}
                    <div className="mb-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Quick select:
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                            {colorOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, color: option.value }));
                                        if (errors.color) setErrors(prev => ({ ...prev, color: '' }));
                                    }}
                                    className={`relative w-8 h-8 rounded-full flex items-center justify-center ${option.color} border-2 ${
                                        formData.color === option.value 
                                        ? 'border-gray-800 dark:border-white' 
                                        : 'border-transparent'
                                    } hover:border-gray-400 dark:hover:border-gray-300 transition-colors`}
                                    title={option.label}
                                    disabled={submitting}
                                >
                                    {formData.color === option.value && (
                                        <Check size={14} className="text-white" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Color Picker */}
                    <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Custom color:
                        </div>
                        <div className="flex items-center space-x-3">
                            <div 
                                className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: formData.color }}
                            />
                            <div className="flex-1">
                                <input
                                    type="color"
                                    id="color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleColorChange}
                                    className="w-full h-10 cursor-pointer"
                                    disabled={submitting}
                                />
                            </div>
                            <div className="w-24">
                                <input
                                    type="text"
                                    value={formData.color}
                                    onChange={handleColorChange}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="#000000"
                                    disabled={submitting}
                                    maxLength={7}
                                />
                            </div>
                        </div>
                        {errors.color && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.color}</p>
                        )}
                    </div>
                </div>

                {/* Current Category Info */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Current Category Information:
                    </div>
                    <div className="space-y-1 text-sm">
                        <div className="flex">
                            <span className="w-32 text-gray-600 dark:text-gray-400">Created:</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {new Date(serviceCategory.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex">
                            <span className="w-32 text-gray-600 dark:text-gray-400">Last Updated:</span>
                            <span className="text-gray-800 dark:text-gray-200">
                                {new Date(serviceCategory.updated_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Actions */}
            <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'space-x-3'} pt-4 border-t border-gray-200 dark:border-gray-700`}>
                <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className={`flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        isMobile ? '' : 'order-2'
                    }`}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center ${
                        submitting ? 'opacity-70 cursor-not-allowed' : ''
                    } ${isMobile ? '' : 'order-1'}`}
                >
                    {submitting ? (
                        <>
                            <Loader size={18} className="animate-spin mr-2" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <Check size={18} className="mr-2" />
                            Update Category
                        </>
                    )}
                </button>
            </div>

            {/* Validation Summary (for screen readers) */}
            {Object.keys(errors).length > 0 && (
                <div className="sr-only" role="alert">
                    Form has {Object.keys(errors).length} error(s). Please fix them before submitting.
                </div>
            )}
        </form>
    );
}