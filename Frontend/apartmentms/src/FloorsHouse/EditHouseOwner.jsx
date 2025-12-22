import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Loader, Upload, User, Briefcase, Globe, Phone, Mail, CreditCard, FileText } from 'lucide-react';

export default function EditHouseOwner({ houseowner, onClose, onUpdated }) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [countries, setCountries] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '',
        occupation: '',
        country: '',
        mobile: '',
        email: '',
        occupied_way: 'own',
        proof: ''
    });

    // Initialize form data when houseowner prop changes
    useEffect(() => {
        if (houseowner) {
            setFormData({
                name: houseowner.name || '',
                occupation: houseowner.occupation || '',
                country: houseowner.country || '',
                mobile: houseowner.mobile || '',
                email: houseowner.email || '',
                occupied_way: houseowner.occupied_way || 'own',
                proof: houseowner.proof || ''
            });
            
            // Set file preview if proof exists
            if (houseowner.proof) {
                setFilePreview(houseowner.proof);
            }
        }
    }, [houseowner]);

    // Fetch countries on mount
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await api.get('/countries');
                setCountries(res.data.data || []);
            } catch (err) {
                console.error("Error fetching countries:", err);
            }
        };
        fetchCountries();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            
            // Create preview for image files
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };

    const handleCountryChange = (e) => {
        const countryId = e.target.value;
        const selectedCountry = countries.find(c => c.id.toString() === countryId);

        if (selectedCountry) {
            setFormData(prev => ({
                ...prev,
                country: selectedCountry.country_name,
                mobile: selectedCountry.phone_code + ' ' + prev.mobile.replace(/^\+\d+\s?/, '')
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                country: '',
                mobile: prev.mobile.replace(/^\+\d+\s?/, '')
            }));
        }
    };

    const handleMobileChange = (e) => {
        const value = e.target.value;
        
        // Preserve country code if present
        if (formData.mobile && formData.mobile.includes('+')) {
            const countryCodeMatch = formData.mobile.match(/^(\+\d+)(?:\s|$)/);
            if (countryCodeMatch) {
                const countryCode = countryCodeMatch[1];
                if (value.startsWith(countryCode)) {
                    setFormData(prev => ({
                        ...prev,
                        mobile: value
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        mobile: countryCode + ' ' + value.replace(/^\+\d+\s?/, '')
                    }));
                }
                return;
            }
        }
        
        setFormData(prev => ({
            ...prev,
            mobile: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formDataToSend = new FormData();
            
            // Add all form fields
            Object.keys(formData).forEach(key => {
                if (key !== 'proof') { // Don't add old proof path
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Add new file if selected
            if (file) {
                formDataToSend.append('proof', file);
            }

            // Update house owner
            const res = await api.put(`/houseowner/${houseowner.id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.data.success) {
                onUpdated(res.data.data);
                onClose();
            }
        } catch (error) {
            console.error('Error updating house owner:', error);
            alert('Error updating house owner. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const selectedCountry = countries.find(c => c.country_name === formData.country);
    const currentCountryCode = selectedCountry?.phone_code || '';

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8">
                    <Loader className="animate-spin mx-auto text-purple-600" size={32} />
                    <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    if (!houseowner) {
        return null;
    }

  return (
        <div className="fixed inset-0 bg-white/0 backdrop-blur-lg bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <User className="text-purple-600 dark:text-purple-400 mr-3" size={24} />
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                            Edit House Owner
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column - Personal Details */}
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
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Briefcase size={16} className="inline mr-2" />
                                    Occupation *
                                </label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={formData.occupation}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Globe size={16} className="inline mr-2" />
                                    Country *
                                </label>
                                <select
                                    name="country"
                                    value={countries.find(c => c.country_name === formData.country)?.id || ''}
                                    onChange={handleCountryChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Country</option>
                                    {countries.map(country => (
                                        <option key={country.id} value={country.id}>
                                            {country.country_name} ({country.phone_code})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Right Column - Contact & File */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Phone size={16} className="inline mr-2" />
                                    Mobile Number *
                                </label>
                                <div className="flex">
                                    {currentCountryCode && (
                                        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-3 rounded-l-lg border border-gray-300  dark:text-white text-gray-700 dark:border-gray-600 border-r-0">
                                            {currentCountryCode}
                                        </div>
                                    )}
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile.replace(/^\+\d+\s?/, '')}
                                        onChange={handleMobileChange}
                                        placeholder="Enter phone number"
                                        className={`w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${currentCountryCode ? 'rounded-l-none' : ''}`}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Mail size={16} className="inline mr-2" />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Occupation Type
                                </label>
                                <select
                                    name="occupied_way"
                                    value={formData.occupied_way}
                                    onChange={handleChange}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="own">Own</option>
                                    <option value="For rent">For Rent</option>
                                </select>
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Upload size={16} className="inline mr-2" />
                                    Proof Document
                                </label>
                                
                                {/* Current proof preview */}
                                {filePreview && (
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Document:</p>
                                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <FileText size={20} className="text-gray-500 mr-3" />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                    {formData.proof.split('/').pop()}
                                                </p>
                                            </div>
                                            <a
                                                href={`${api.defaults.baseURL}/houseowner/view-proof/${houseowner.id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                                            >
                                                View
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {/* New file upload */}
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-purple-500 transition-colors">
                                    <input
                                        type="file"
                                        id="proof"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <label htmlFor="proof" className="cursor-pointer block">
                                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                            Click to upload new document
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500">
                                            PNG, JPG, JPEG up to 5MB
                                        </p>
                                    </label>
                                    
                                    {file && (
                                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <p className="text-sm text-green-700 dark:text-green-300">
                                                New file selected: {file.name}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
