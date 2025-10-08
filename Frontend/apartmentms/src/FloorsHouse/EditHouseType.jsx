import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import api from '../api/axios';

export default function EditHouseType({housetype,onClose,onUpdated}) {
    const [formData, setFormData] = useState({
        name: "",
        members: "",
        sqrfeet: "",
        rooms: "",
        bathrooms: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const token = localStorage.getItem("token"); 
    
    useEffect(() => {
    if (housetype) {
      setFormData({
        name: housetype.name || "",
        members: housetype.members || "",
        sqrfeet: housetype.sqrfeet || "",
        rooms: housetype.rooms || "",
        bathrooms: housetype.bathrooms || "",
      });
      
    }
  }, [housetype]);

   const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.put(`/housetype/${housetype.id}`, 
        formData ,{
          headers: {
          Authorization: `Bearer ${token}`,
          }
    });

      if (res.data.success) {
        onUpdated && onUpdated(res.data.data); // notify parent
        onClose && onClose(); // close modal
      } else {
        setError(res.data.message || "Failed to update house type");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating house type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
        disabled
      />

      <input
        type="number"
        name="members"
        placeholder="How many people can stay"
        value={formData.members}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      />

      <input
        type="number"
        name="sqrfeet"
        placeholder="SQT FEET"
        value={formData.sqrfeet}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      />

      <input
        type="number"
        name="rooms"
        placeholder="No of Bed Rooms"
        value={formData.rooms}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
      />

      <input
        type="number"
        name="bathrooms"
        placeholder="No of Bath Rooms"
        value={formData.bathrooms}
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
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  )
}
