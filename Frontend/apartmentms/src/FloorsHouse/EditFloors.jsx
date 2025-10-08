import React, { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function EditFloors({ floor, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    floor_id: floor.floor_id || "",
    status: floor.status || "active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const token = localStorage.getItem("token"); 
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await api.put(`/floors/${floor.id}`, formData ,{
          headers: {
          Authorization: `Bearer ${token}`,
          }
      });
       
  
      if (result.data.success) {
        onUpdated();
      } else {
        toast.error('Failed to update floor');
      }
    } catch (err) {
      console.error("Error updating floor:", err);
      toast.error("Error updating floor");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Floor Name/Number
        </label>
        <input
          type="text"
          name="floor_id"
          value={formData.floor_id}
          onChange={handleChange}
          className="border rounded p-2 text-black dark:text-white border-purple-600"
          disabled
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm 
                     focus:ring-purple-500 border-purple-500 sm:text-sm  text-black dark:text-white"
        >
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}
