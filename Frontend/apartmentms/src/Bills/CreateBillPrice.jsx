import React, { useState } from "react";
import { X } from "lucide-react";
import api from "../api/axios";

export default function CreateBillPrice({ bill_id, billrange_id, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    year: "",
    month: "",
    unitprice: "",
    fixedamount: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add this useEffect to debug the props
  React.useEffect(() => {
    console.log('CreateBillPrice props:', { bill_id, billrange_id });
  }, [bill_id, billrange_id]);

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

    // Debug the data before sending
    const requestData = {
      ...formData,
      bill_id,
      billrange_id,
    };
    
    console.log('Submitting bill price data:', requestData);

    try {
      const result = await api.post(
        "/billprice",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (result.data.success) {
        onCreated?.(result.data.data);
        setFormData({ year: "", month: "", unitprice: "", fixedamount: "" });
        onClose();
      } else {
        setError(result.data.message || "Failed to save bill price");
      }
    } catch (err) {
      console.error("Error saving bill price:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 400) {
        setError(err.response.data?.message || "Bad request. Please check all required fields.");
      } else if (err.response?.status === 403) {
        setError("Access denied. Please check your login or permissions.");
      } else {
        setError("Error saving bill price. Please try again.");
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
            Create Bill Price
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
              disabled={loading || !bill_id || !billrange_id}
              className={`px-4 py-2 rounded-lg text-white transition ${
                loading || !bill_id || !billrange_id
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}