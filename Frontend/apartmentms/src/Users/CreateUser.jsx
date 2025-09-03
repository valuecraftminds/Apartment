// CreateApartment.jsx
import React, { useState } from 'react';
import api from '../api/axios'; 
import { toast } from 'react-toastify';

export default function CreateApartment({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    email: '',
    role:'',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const submitFormData = new FormData(); 
    submitFormData.append('email', formData.name); 
    submitFormData.append('role', formData.address);
    
    // if (formData.image) { 
    //   submitFormData.append('picture', formData.image);
    // }

    const response = await api.post('/auth/register', submitFormData, {
    });
   
    setLoading(false);

    if (onCreated) onCreated(); // refresh the list
    if (onClose) onClose(); // close the modal
  } catch (err) {
    console.error(err);
    // setError('Failed to create apartment.');
    toast.error('Failed to create apartment')
    setLoading(false);
  }
};
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      />
      {/* <input
        type="text"
        name="role"
        placeholder="Address"
        value={formData.address}
        onChange={handleChange}
        className="border rounded p-2  text-black dark:text-white border-purple-600"
        required
      /> */}
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      >
        <option value="active">Admin</option>
        <option value="maintenance">Apartment Owner</option>
        <option value="inactive">Apartment Manager</option>
        <option value="inactive">Apartment Technician</option>
      </select>
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
          // disabled={loading}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
        >
          Save & Invite
        </button>
      </div>
    </form>
  );
}
