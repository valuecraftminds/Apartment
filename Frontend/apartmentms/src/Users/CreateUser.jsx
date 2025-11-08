import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function CreateUser({ onClose, onCreated}) {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // no need for FormData since we’re sending simple JSON
      const response = await api.post('/auth/invite', {
        email: formData.email,
        role: formData.role
      });

      toast.success('Invitation sent successfully!');

      if (onCreated) onCreated(); // refresh parent list
      if (onClose) onClose(); // close modal
    } catch (err) {
      console.error('Invite error:', err);
      const message =
        err.response?.data?.message || 'Failed to send invitation. Try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 text-black dark:text-white"
    >
      {error && <p className="text-red-500">{error}</p>}

      {/* Email Input */}
      <input
        type="email"
        name="email"
        placeholder="Enter user email"
        value={formData.email}
        onChange={handleChange}
        className="border rounded p-2 border-purple-600 bg-white dark:bg-gray-800"
        required
      />

      {/* Role Dropdown */}
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="border rounded p-2 border-purple-600 bg-white dark:bg-gray-800"
        required
      >
        <option value="">Select Role</option>
        <option value="Admin">Admin</option>
        <option value="Apartment_owner">Apartment Owner</option>
        <option value="Apartment_manager">Apartment Manager</option>
        <option value="Apartment_technician">Apartment Technician</option>
      </select>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Save & Invite'}
        </button>
      </div>
    </form>
  );
}
