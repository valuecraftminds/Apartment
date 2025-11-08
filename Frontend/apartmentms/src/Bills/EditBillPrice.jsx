import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../api/axios";

export default function EditBillPrice({ bill_id, billrange_id, billPrice, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    unitprice: "",
    fixedamount: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with bill price data when component mounts or billPrice changes
  useEffect(() => {
    if (billPrice) {
      setFormData({
        year: billPrice.year || "",
        month: billPrice.month || "",
        unitprice: billPrice.unitprice || "",
        fixedamount: billPrice.fixedamount || "",
      });
    }
  }, [billPrice]);

  // Add this useEffect to debug the props
  useEffect(() => {
    console.log('EditBillPrice props:', { 
      bill_id, 
      billrange_id, 
      billPrice,
      formData 
    });
  }, [bill_id, billrange_id, billPrice, formData]);

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

    if (!billPrice || !billPrice.id) {
      setError("No bill price selected for editing");
      setLoading(false);
      return;
    }

    // Debug the data before sending
    const requestData = {
      ...formData,
      bill_id,
      billrange_id,
      id: billPrice.id // Include the bill price ID for update
    };
    
    console.log('Updating bill price data:', requestData);

    try {
      const result = await api.put(
        `/billprice/${billPrice.id}`, // Use the specific bill price ID in the URL
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (result.data.success) {
        onUpdated?.(result.data.data);
        onClose();
      } else {
        setError(result.data.message || "Failed to update bill price");
      }
    } catch (err) {
      console.error("Error updating bill price:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 400) {
        setError(err.response.data?.message || "Bad request. Please check all required fields.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Please check your login or permissions.");
      } else if (err.response?.status === 404) {
        setError("Bill price not found. It may have been deleted.");
      } else {
        setError("Error updating bill price. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Edit Bill Price
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Debug info - remove this in production */}
        {/* <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-xs">
          <strong>Debug Info:</strong><br />
          Bill Price ID: {billPrice?.id || 'UNDEFINED'}<br />
          Bill ID: {bill_id || 'UNDEFINED'}<br />
          Bill Range ID: {billrange_id || 'UNDEFINED'}
        </div> */}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Year *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Enter year"
              required
              min="2000"
              max="2100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Month *
            </label>
            <select
              name="month"
              value={formData.month}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select month</option>
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit Price (Rs) *
            </label>
            <input
              type="number"
              name="unitprice"
              value={formData.unitprice}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Enter unit price"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fixed Amount (Rs) *
            </label>
            <input
              type="number"
              name="fixedamount"
              value={formData.fixedamount}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
              placeholder="Enter fixed amount"
              required
              min="0"
              step="0.01"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !bill_id || !billrange_id || !billPrice}
              className={`px-4 py-2 rounded-lg text-white transition ${
                loading || !bill_id || !billrange_id || !billPrice
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}