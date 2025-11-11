import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

export default function CreateRoles({ onClose, onCreated }) {
  const [formData, setFormData] = useState({
    role_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (name === 'role_name' && error) {
      setError("");
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.role_name.trim()) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      const result = await api.post("/roles", 
        {
          role_name: formData.role_name.trim()
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (result.data.success) {
        onCreated?.(result.data.data);
        toast.success("Role created successfully");
        onClose();
      } else {
        setError(result.data.message || "Failed to save role");
      }
    } catch (err) {
      console.error("Error saving role:", err);
      const errorMessage = err.response?.data?.message || "Error saving role. Please try again.";
      setError(errorMessage);
      
      // Show specific message for duplicate role
      if (err.response?.status === 409) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Role Name Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Role Name *
        </label>
        <input
          type="text"
          name="role_name"
          value={formData.role_name}
          onChange={handleChange}
          placeholder="Enter unique bill name (e.g., Electricity, Water, Maintenance)"
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tip: Use clear, distinct names to avoid duplicates
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 text-white transition-colors font-medium"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !formData.role_name.trim()}
          className={`px-4 py-2 rounded-lg text-white transition-colors font-medium ${
            loading || !formData.role_name.trim()
              ? "bg-purple-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            "Save Role"
          )}
        </button>
      </div>
    </form>
  );
}