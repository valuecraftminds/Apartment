// CreateApartment.jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios'; 
import { toast } from 'react-toastify';

export default function CreateApartment({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    apartment_id:'',
    name: '',
    address: '',
    city: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  //fetch last apartment id and increment it automatically
  const fetchLastApyId = async () => {
    try {
      const result = await api.get('/apartments')
      const apt = result.data.data
      const lastApt = apt[0];
      const lastAptId = lastApt ? parseInt(lastApt.apartment_id.slice(3)) : 0; // Extract the number part and convert to integer
      const newAptId = `A${String(lastAptId + 1).padStart(3, '0')}`; // Increment the number part and format it
      setFormData(prevApartment => ({
        ...prevApartment,
        apartment_id: newAptId
      }));
    } catch (error) {
      console.error("Error fetching last apartment id:", error);
    }
  };

  useEffect(() => {
    fetchLastApyId(); // Fetch the last attendance id when the component mounts
  }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const submitFormData = new FormData(); 
    submitFormData.append('apartment_id',formData.apartment_id);
    submitFormData.append('name', formData.name); 
    submitFormData.append('address', formData.address);
    submitFormData.append('city', formData.city);
    
    if (formData.image) {
      submitFormData.append('picture', formData.image);
    }

    const response = await api.post('/apartments', submitFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
   
    setLoading(false);

    if (onCreated) onCreated(); // refresh the list
    if (onClose) onClose(); // close the modal
  } catch (err) {
    console.error(err);
    toast.error('Failed to create apartment')
    setLoading(false);
  }
};
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        name="apartment_id"
        value={formData.apartment_id}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
        disabled
      />
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
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
