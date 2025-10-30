import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import api from '../api/axios';

export default function EditBillType({bills,onClose,onUpdated}) {
    const [formData, setFormData] = useState({
        bill_name: "",
        billtype:"",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const token = localStorage.getItem("token"); 
    
    useEffect(() => {
    if (bills) {
      setFormData({
        bill_name: bills.bill_name || "",
        billtype: bills.billtype || "",
      });
      
    }
  }, [bills]);

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
      const res = await api.put(`/bills/${bills.id}`, 
        formData ,{
          headers: {
          Authorization: `Bearer ${token}`,
          }
    });

      if (res.data.success) {
        onUpdated && onUpdated(res.data.data); // notify parent
        onClose && onClose(); // close modal
      } else {
        setError(res.data.message || "Failed to update bill type");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating bill type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bill Type *
        </label>
        <select
          name="billtype"
          value={formData.billtype}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        >
          <option value="">Select Bill Type</option>
          <option value="Measurable">Measurable</option>
          <option value="Shared">Shared</option>
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Measurable: Bills based on usage (electricity, water, etc.)<br />
          Shared: Bills divided equally among houses (maintenance, security, etc.)
        </p>
      </div>

      <input
        type="text"
        name="bill_name"
        value={formData.bill_name}
        onChange={handleChange}
        className="border rounded p-2 text-black dark:text-white border-purple-600"
        required
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
