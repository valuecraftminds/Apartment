// EditApartment.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios'; 
import { toast } from 'react-toastify';

export default function CreateApartment({ onClose, onEdited, apartment  }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    floors:'',
    houses:'',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(()=>{
    if (apartment) {
      setFormData({
        name: apartment.name || '',
        address: apartment.address || '',
        city: apartment.city || '',
        floors: apartment.floors || '',
        houses: apartment.houses || '',
        image: null, // Keep image as null, user can choose to update
      });
    }
  },[apartment]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const submitFormData = new FormData(); 
      submitFormData.append('name', formData.name); 
      submitFormData.append('address', formData.address);
      submitFormData.append('city', formData.city);
      submitFormData.append('floors', formData.floors);
      submitFormData.append('houses', formData.houses);
      
      if (formData.image) {
        submitFormData.append('picture', formData.image);
      }

      // Use PUT request instead of POST
      const response = await api.put(`/apartments/${apartment.apartment_id}`, submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Apartment updated successfully!');
      setLoading(false);

      if (onEdited) onEdited(); // refresh the list
      if (onClose) onClose(); // close the modal
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update apartment');
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        name="name"
        placeholder="Apartment Name"
        value={formData.name}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      />
      <input
        type="text"
        name="address"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        className="border rounded p-2  text-black dark:text-white border-purple-600"
        required
      />
      <input
        type="text"
        name="city"
        placeholder="City"
        value={formData.city}
        onChange={handleChange}
        className="border rounded p-2  text-black dark:text-white border-purple-600"
        required
      />
      <input
        type="number"
        name="floors"
        placeholder="No of Floors"
        value={formData.floors}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      />
      <input
        type="number"
        name="houses"
        placeholder="No of Houses"
        value={formData.houses}
        onChange={handleChange}
        className="border rounded p-2  text-black dark:text-white border-purple-600"
        required
      />
      <input
        type="file"
        name="image"
        accept="image/*"
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? 'Updating...' : 'Update'}
        </button>
      </div>
    </form>
  );
}
