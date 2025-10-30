import React, { useState } from "react";
import { X } from "lucide-react";

export default function CreateBillRange({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    fromRange: "",
    toRange: ""
  });

  if (!show) return null; // Don't render anything if modal is closed

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.fromRange || !formData.toRange) {
      alert("Please fill all fields.");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/0 backdrop-blur-lg">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-[90%] max-w-md relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Add Bill Range
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <input
            type="number"
            name="fromRange"
            placeholder="From Range"
            value={formData.fromRange}
            onChange={handleChange}
            className="p-2 border rounded-md text-black dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <input
            type="number"
            name="toRange"
            placeholder="To Range"
            value={formData.toRange}
            onChange={handleChange}
            className="p-2 border rounded-md text-black dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
