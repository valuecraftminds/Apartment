// CreateSharedValueBillPrice.jsx
import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function CreateSharedValueBillPrice({ bill_id, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        amount: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

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

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.year || formData.year < 2000 || formData.year > 2100) {
            newErrors.year = 'Please enter a valid year (2000-2100)';
        }
        
        if (!formData.month || formData.month < 1 || formData.month > 12) {
            newErrors.month = 'Please select a valid month (1-12)';
        }
        
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            setLoading(true);
            const response = await api.post('/shared-value-prices', {
                bill_id,
                year: parseInt(formData.year),
                month: parseInt(formData.month),
                amount: parseFloat(formData.amount)
            });

            if (response.data.success) {
                onSuccess(); 
            } else {
                toast.error(response.data.message || 'Failed to create shared value price');
            }
        } catch (err) {
            console.error('Error creating shared value price:', err);
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Failed to create shared value price');
            }
        } finally {
            setLoading(false);
        }
    };

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white text-xl"
                >
                    ✖
                </button>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Set Shared Value Price
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Year *
                        </label>
                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                errors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                            min="2000"
                            max="2100"
                        />
                        {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Month *
                        </label>
                        <select
                            name="month"
                            value={formData.month}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                errors.month ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                        >
                            {months.map(month => (
                                <option key={month.value} value={month.value}>
                                    {month.label}
                                </option>
                            ))}
                        </select>
                        {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Amount (LKR) *
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                                errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                            placeholder="0.00"
                        />
                        {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                            {loading && <Loader size={16} className="animate-spin" />}
                            <span>{loading ? 'Creating...' : 'Create'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}