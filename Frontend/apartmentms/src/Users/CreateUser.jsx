import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { Loader } from 'lucide-react';

export default function CreateUser({ onClose, onCreated, roles, rolesLoading }) {
  const [formData, setFormData] = useState({
    email: '',
    role_id: '', // Changed from role to role_id
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
      const response = await api.post('/auth/invite', {
        email: formData.email,
        role_id: formData.role_id // Send role_id instead of role
      });

      toast.success('Invitation sent successfully!');

      if (onCreated) onCreated();
      if (onClose) onClose();
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

      {/* Role Dropdown - Dynamic from roles API */}
      <div>
        <select
          name="role_id"
          value={formData.role_id}
          onChange={handleChange}
          className="w-full border rounded p-2 border-purple-600 bg-white dark:bg-gray-800"
          required
          disabled={rolesLoading}
        >
          <option value="">Select Role</option>
          {rolesLoading ? (
            <option value="" disabled>Loading roles...</option>
          ) : (
            roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.role_name}
              </option>
            ))
          )}
        </select>
        {rolesLoading && (
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <Loader size={14} className="animate-spin mr-1" />
            Loading roles...
          </div>
        )}
      </div>

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
          disabled={loading || rolesLoading}
          className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin mr-2" />
              Sending...
            </>
          ) : (
            'Save & Invite'
          )}
        </button>
      </div>
    </form>
  );
}
