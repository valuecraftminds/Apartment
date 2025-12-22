import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Loader, User, IdCard, Mail, Phone, UserPlus } from 'lucide-react';

export default function NewMember({ houseownerId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        nic: '',
        email: '',
        phone: '',
        houseowner_id: houseownerId
    });

    const [errors, setErrors] = useState({});

    // Reset form when houseownerId changes
    useEffect(() => {
        setFormData({
            name: '',
            nic: '',
            email: '',
            phone: '',
            houseowner_id: houseownerId
        });
        setErrors({});
    }, [houseownerId]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        
        if (!formData.nic.trim()) {
            newErrors.nic = 'NIC is required';
        }
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        
        if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Invalid phone number';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        
        try {
            const response = await api.post('/family', {
                ...formData,
                houseowner_id: houseownerId
            });

            if (response.data.success) {
                onSuccess(response.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Error adding family member:', error);
            
            // Handle validation errors from backend
            if (error.response?.data?.error) {
                setErrors(prev => ({
                    ...prev,
                    general: error.response.data.message || 'Failed to add family member'
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    general: 'Failed to add family member. Please try again.'
                }));
            }
        } finally {
            setSaving(false);
        }
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        // Allow only numbers, plus, spaces, and dashes
        const cleanedValue = value.replace(/[^\d+\-\s]/g, '');
        
        setFormData(prev => ({
            ...prev,
            phone: cleanedValue
        }));
        
        if (errors.phone) {
            setErrors(prev => ({
                ...prev,
                phone: ''
            }));
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
                    <Loader className="animate-spin mx-auto text-purple-600" size={32} />
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-white/0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <UserPlus className="text-purple-600 dark:text-purple-400 mr-3" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Add New Family Member
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={saving}
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <User size={16} className="inline mr-2" />
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.name 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Enter full name"
                                required
                                disabled={saving}
                            />
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                            )}
                        </div>

                        {/* NIC Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <IdCard size={16} className="inline mr-2" />
                                NIC Number *
                            </label>
                            <input
                                type="text"
                                name="nic"
                                value={formData.nic}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.nic 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Enter NIC number"
                                required
                                disabled={saving}
                            />
                            {errors.nic && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nic}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Mail size={16} className="inline mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.email 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Enter email address (optional)"
                                disabled={saving}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Phone size={16} className="inline mr-2" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.phone 
                                        ? 'border-red-500 focus:ring-red-500' 
                                        : 'border-gray-300 dark:border-gray-600'
                                }`}
                                placeholder="Enter phone number (optional)"
                                disabled={saving}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Format: +94 77 123 4567 or 0771234567
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader size={18} className="animate-spin mr-2" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <UserPlus size={18} className="mr-2" />
                                    Add Member
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
