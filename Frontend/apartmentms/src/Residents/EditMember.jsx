import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Loader, User, IdCard, Mail, Phone, Save } from 'lucide-react';

export default function EditMember({ member, onClose, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.name || '',
                email: member.email || '',
                phone: member.phone || ''
            });
        }
    }, [member]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
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
            const response = await api.put(`/family/${member.id}`, formData);

            if (response.data.success) {
                onUpdated(response.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Error updating family member:', error);
            setErrors(prev => ({
                ...prev,
                general: error.response?.data?.message || 'Failed to update family member'
            }));
        } finally {
            setSaving(false);
        }
    };

    if (!member) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-white/0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <User className="text-purple-600 dark:text-purple-400 mr-3" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Edit Family Member
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

                <form onSubmit={handleSubmit} className="p-6">
                    {errors.general && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                        </div>
                    )}
                    
                    <div className="space-y-4">
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
                                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                                disabled={saving}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                        </div>

                        {/* <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <IdCard size={16} className="inline mr-2" />
                                NIC Number *
                            </label>
                            <input
                                type="text"
                                name="nic"
                                value={formData.nic}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.nic ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                required
                                disabled={saving}
                            />
                            {errors.nic && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nic}</p>}
                        </div> */}

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
                                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                disabled={saving}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Phone size={16} className="inline mr-2" />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                    errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'
                                }`}
                                disabled={saving}
                            />
                            {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
                        </div>
                    </div>

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
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
