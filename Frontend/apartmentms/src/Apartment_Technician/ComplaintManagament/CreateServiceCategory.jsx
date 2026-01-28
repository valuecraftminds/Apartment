import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { Loader, Check, X, Palette } from 'lucide-react';
import api from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';

export default function CreateServiceCategory({ onClose, onCreated }) {
    const { auth } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: 'Purple', // Default color name
    });

    // Predefined color options with names
    const colorOptions = [
        { name: 'Purple', value: '#667eea', displayName: 'Purple' },
        { name: 'Blue', value: '#3b82f6', displayName: 'Blue' },
        { name: 'Green', value: '#10b981', displayName: 'Green' },
        { name: 'Yellow', value: '#f59e0b', displayName: 'Yellow' },
        { name: 'Red', value: '#ef4444', displayName: 'Red' },
        { name: 'Pink', value: '#ec4899', displayName: 'Pink' },
        { name: 'Indigo', value: '#6366f1', displayName: 'Indigo' },
        { name: 'Teal', value: '#14b8a6', displayName: 'Teal' },
        { name: 'Orange', value: '#f97316', displayName: 'Orange' },
        { name: 'Gray', value: '#6b7280', displayName: 'Gray' },
    ];

    // Get color hex from name
    const getColorHex = (colorName) => {
        const color = colorOptions.find(option => option.name === colorName);
        return color ? color.value : '#667eea'; // Default to purple if not found
    };

    // Get color display info
    const getColorDisplay = (colorName) => {
        const color = colorOptions.find(option => option.name === colorName);
        if (color) {
            return `${color.displayName} (${color.value})`;
        }
        return `Custom (${getColorHex(colorName)})`;
    };

    // Check if selected color is custom
    const isCustomColor = (colorName) => {
        return !colorOptions.some(option => option.name === colorName);
    };

    // Get current color hex for display
    const getCurrentColorHex = () => {
        if (isCustomColor(formData.color)) {
            // For custom colors, the color field contains the hex value
            return formData.color.startsWith('#') ? formData.color : '#667eea';
        }
        return getColorHex(formData.color);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Category name must be at least 2 characters';
        } else if (formData.name.trim().length > 50) {
            newErrors.name = 'Category name cannot exceed 50 characters';
        }
        
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description cannot exceed 500 characters';
        }
        
        if (!formData.color) {
            newErrors.color = 'Please select a color';
        }
        
        return newErrors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleColorSelect = (colorName) => {
        setFormData(prev => ({
            ...prev,
            color: colorName
        }));
        
        if (errors.color) {
            setErrors(prev => ({
                ...prev,
                color: ''
            }));
        }
    };

    const handleCustomColorChange = (hexValue) => {
        // For custom colors, store the hex value as the color name
        setFormData(prev => ({
            ...prev,
            color: hexValue
        }));
        
        if (errors.color) {
            setErrors(prev => ({
                ...prev,
                color: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        
        try {
            setLoading(true);
            
            // Prepare data for API - send color name, not hex value
            const apiData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                color: formData.color, // Send the color name (or hex for custom)
            };
            
            const response = await api.post('/categories', apiData, {
                headers: {
                    Authorization: `Bearer ${auth.accessToken}`
                }
            });
            
            if (response.data.success) {
                if (onCreated) {
                    onCreated();
                }
                onClose();
            } else {
                throw new Error(response.data.message || 'Failed to create category');
            }
        } catch (err) {
            console.error('Create category error:', err);
            
            if (err.response?.status === 409) {
                setErrors(prev => ({
                    ...prev,
                    name: 'A category with this name already exists'
                }));
                toast.error('A category with this name already exists');
            } else if (err.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                onClose();
            } else {
                toast.error(err.response?.data?.message || 'Failed to create service category');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            description: '',
            color: 'Purple',
        });
        setErrors({});
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Name *
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border  text-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white ${
                        errors.name 
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Plumbing, Electrical, Carpentry"
                    disabled={loading}
                />
                {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Required. Will be used for complaint categorization.
                </p>
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                </label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white ${
                        errors.description 
                            ? 'border-red-300 dark:border-red-600' 
                            : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Brief description of what this category includes..."
                    disabled={loading}
                />
                <div className="flex justify-between mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Optional. Helps technicians understand the category scope.
                    </p>
                    <p className={`text-xs ${
                        formData.description.length > 500 
                            ? 'text-red-500' 
                            : 'text-gray-500 dark:text-gray-400'
                    }`}>
                        {formData.description.length}/500
                    </p>
                </div>
                {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                )}
            </div>

            {/* Color Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Color *
                </label>
                
                {/* Selected Color Preview */}
                <div className="flex items-center mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div 
                        className="w-10 h-10 rounded-lg mr-3 border-2 border-gray-300 dark:border-gray-600 flex-shrink-0"
                        style={{ backgroundColor: getCurrentColorHex() }}
                    ></div>
                    <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {isCustomColor(formData.color) ? 'Custom Color' : formData.color}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center">
                            <span className="truncate">{getColorDisplay(formData.color)}</span>
                        </div>
                    </div>
                </div>
                
                {/* Color Options Grid */}
                <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Select from predefined colors:
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((colorOption) => (
                            <div key={colorOption.name} className="flex flex-col items-center">
                                <button
                                    type="button"
                                    onClick={() => handleColorSelect(colorOption.name)}
                                    className={`relative w-full aspect-square rounded-lg border-2 transition-all hover:scale-105 mb-1 ${
                                        formData.color === colorOption.name
                                            ? 'border-purple-500 dark:border-purple-400 scale-105 shadow-md'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                                    }`}
                                    title={`${colorOption.displayName} (${colorOption.value})`}
                                    disabled={loading}
                                >
                                    <div 
                                        className="w-full h-full rounded"
                                        style={{ backgroundColor: colorOption.value }}
                                    ></div>
                                    {formData.color === colorOption.name && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                                            <Check className="text-white" size={14} />
                                        </div>
                                    )}
                                </button>
                                <span className="text-xs text-gray-600 dark:text-gray-400 truncate w-full text-center">
                                    {colorOption.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Custom Color Input */}
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Custom Color
                        </label>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Or create your own
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <Palette className="text-gray-500 dark:text-gray-400 flex-shrink-0" size={18} />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Color Picker
                                </label>
                                <input
                                    type="color"
                                    value={getCurrentColorHex()}
                                    onChange={(e) => handleCustomColorChange(e.target.value)}
                                    className="w-full h-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
                                    disabled={loading}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                                    Hex Code
                                </label>
                                <input
                                    type="text"
                                    value={getCurrentColorHex()}
                                    onChange={(e) => handleCustomColorChange(e.target.value)}
                                    className="w-full px-3 py-2  text-gray-700 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="#RRGGBB"
                                    pattern="^#[0-9A-Fa-f]{6}$"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Current Custom Color Info */}
                    {isCustomColor(formData.color) && (
                        <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div 
                                        className="w-6 h-6 rounded mr-2 border border-gray-300 dark:border-gray-600"
                                        style={{ backgroundColor: getCurrentColorHex() }}
                                    ></div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Custom Color Selected
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {getCurrentColorHex()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
                
                {errors.color && (
                    <p className="text-red-500 text-xs mt-2">{errors.color}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Color helps visually identify this category in lists and charts.
                </p>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    Reset Form
                </button>
                
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    Cancel
                </button>
                
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader className="animate-spin mr-2" size={16} />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2" size={16} />
                            Create Category
                        </>
                    )}
                </button>
            </div>

            {/* Form Tips */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                    Tips for creating categories:
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Use clear, descriptive names (e.g., "Electrical Repair" instead of "Electricity")</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Keep descriptions concise but informative</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Choose distinct colors for easy visual differentiation</span>
                    </li>
                    <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Categories can be assigned to technicians for specialization</span>
                    </li>
                </ul>
            </div>
        </form>
    );
}