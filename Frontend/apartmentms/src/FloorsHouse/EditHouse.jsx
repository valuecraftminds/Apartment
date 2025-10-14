import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Loader } from 'lucide-react';

export default function EditHouse({ house, onClose, onUpdated, apartment_id, floor_id }) {
    const [formData, setFormData] = useState({
        house_id: house.house_id,
        status: house.status,
        housetype_id: house.housetype_id,
        houseowner_id: house.houseowner_id
    });
    
    const [ownerFormData, setOwnerFormData] = useState({
        name: '',
        nic: '',
        occupation: '',
        country: '',
        mobile: '',
        occupied_way: 'own',
        proof: null
    });
    
    const [houseTypes, setHouseTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showOwnerForm, setShowOwnerForm] = useState(false);
    const [file, setFile] = useState(null);

    // Fetch house types
    useEffect(() => {
       const fetchHouseTypes = async () => {
      try {
        const res = await api.get(`/housetype?apartment_id=${apartment_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setHouseTypes(res.data.data || []);
      } catch (err) {
        console.error("Error fetching house types:", err);
      }
    };
        fetchHouseTypes();
    }, [apartment_id]);

    // Show owner form when status changes to occupied
    useEffect(() => {
        if (formData.status === 'occupied' && house.status !== 'occupied') {
            setShowOwnerForm(true);
        } else if (formData.status !== 'occupied') {
            setShowOwnerForm(false);
        }
    }, [formData.status, house.status]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleOwnerChange = (e) => {
        setOwnerFormData({
            ...ownerFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            let houseOwnerId = formData.houseowner_id;

            // If status is occupied and we need to create a new owner
            if (formData.status === 'occupied' && !houseOwnerId) {
                // Create form data for file upload
                const ownerFormDataToSend = new FormData();
                ownerFormDataToSend.append('name', ownerFormData.name);
                ownerFormDataToSend.append('nic', ownerFormData.nic);
                ownerFormDataToSend.append('occupation', ownerFormData.occupation);
                ownerFormDataToSend.append('country', ownerFormData.country);
                ownerFormDataToSend.append('mobile', ownerFormData.mobile);
                ownerFormDataToSend.append('occupied_way', ownerFormData.occupied_way);
                ownerFormDataToSend.append('apartment_id', apartment_id);
                if (file) {
                    ownerFormDataToSend.append('proof', file);
                }

                // Create house owner
                const ownerRes = await api.post('/houseowner', ownerFormDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (ownerRes.data.success) {
                    houseOwnerId = ownerRes.data.data.id;
                }
            }

            // Update house with owner ID
            const updateData = {
                ...formData,
                house_owner_id: houseOwnerId
            };

            const res = await api.put(`/houses/${house.id}`, updateData);
            if (res.data.success) {
                onUpdated();
            }
        } catch (err) {
            console.error('Error updating house:', err);
            alert('Error updating house. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                {/* Basic House Information */}
                <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">House ID</label>
                    <input
                        type="text"
                        name="house_id"
                        value={formData.house_id}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                        required
                    />
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">House Type</label>
                    <select
                        name="housetype_id"
                        value={formData.housetype_id}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                        required
                    >
                        <option value="">Select Type</option>
                          {houseTypes && houseTypes.length > 0 ? (
                              houseTypes.map((housetype) => (
                                  <option key={housetype.id} value={housetype.id}>
                                      {housetype.name || housetype.type_name || 'Unnamed Type'}
                                  </option>
                              ))
                          ) : (
                              <option value="" disabled>No house types available</option>
                          )}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700 dark:text-gray-200 mb-1">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                        required
                    >
                        <option value="vacant">Vacant</option>
                        <option value="occupied">Occupied</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>

                {/* Owner Form - Show only when status is occupied */}
                {showOwnerForm && (
                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                            Owner Information
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={ownerFormData.name}
                                    onChange={handleOwnerChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">NIC *</label>
                                <input
                                    type="text"
                                    name="nic"
                                    value={ownerFormData.nic}
                                    onChange={handleOwnerChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Occupation *</label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={ownerFormData.occupation}
                                    onChange={handleOwnerChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Country *</label>
                                <input
                                    type="text"
                                    name="country"
                                    value={ownerFormData.country}
                                    onChange={handleOwnerChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Mobile *</label>
                                <input
                                    type="text"
                                    name="mobile"
                                    value={ownerFormData.mobile}
                                    onChange={handleOwnerChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 dark:text-gray-200 mb-1">Occupation Type</label>
                                <select
                                    name="occupied_way"
                                    value={ownerFormData.occupied_way}
                                    onChange={handleOwnerChange}
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="own">Own</option>
                                    <option value="For rent">For Rent</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-3">
                            <label className="block text-gray-700 dark:text-gray-200 mb-1">Proof Document</label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {loading && <Loader size={16} className="animate-spin" />}
                        {showOwnerForm ? 'Save House & Owner' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </form>
    );
}