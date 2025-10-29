import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function EditBillRange({ range, onClose, onUpdated }) {
  const [formData, setFormData] = useState({
    fromRange: "",
    toRange: "",
    unitPrice: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (range) {
      setFormData({
        fromRange: range.fromRange ?? "",
        toRange: range.toRange ?? "",
        unitPrice: range.unitPrice ?? "",
        });
    }
  }, [range]);

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
      const res = await api.put(`/billranges/${range.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        onUpdated && onUpdated(res.data.data); // Notify parent
        onClose && onClose(); // Close modal
      } else {
        setError(res.data.message || "Failed to update bill range");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Error updating bill range");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/0 backdrop-blur-lg">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Edit Bill Range
        </h2>

        {error && <p className="text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="number"
            name="fromRange"
            value={formData.fromRange}
            onChange={handleChange}
            placeholder="From Range"
            className="border rounded p-2 text-black dark:text-white border-purple-600"
            required
          />

          <input
            type="number"
            name="toRange"
            value={formData.toRange}
            onChange={handleChange}
            placeholder="To Range"
            className="border rounded p-2 text-black dark:text-white border-purple-600"
            required
          />

          {/* <input
            type="number"
            name="unitPrice"
            value={formData.unitPrice}
            onChange={handleChange}
            placeholder="Unit Price"
            className="border rounded p-2 text-black dark:text-white border-purple-600"
            required
          /> */}

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
      </div>
    </div>
  );
}
