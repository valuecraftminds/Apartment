import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function CreateHouseType({ onClose, apartment_id,onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    sqrfeet: "",
    rooms: "",
    bathrooms: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch last house type and auto-increment ID
  const fetchLastTypeId = async () => {
    try {
      const result = await api.get(`/housetype?apartment_id=${apartment_id}`);
      const ty = result.data.data || [];
      const lastType = ty.length > 0 ? ty[ty.length - 1] : null;

      const lastTypeId = lastType ? parseInt(lastType.name.replace("Type", "")) : 0;
      const newTypeId = `Type ${String(lastTypeId + 1).padStart(2, "0")}`;

      setFormData((prev) => ({
        ...prev,
        name: newTypeId,
      }));
    } catch (error) {
      console.error("Error fetching last type:", error);
      setError("Failed to generate Type ID");
    }
  };

  useEffect(() => {
    fetchLastTypeId();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await api.post("/housetype", {
        ...formData,
        apartment_id:apartment_id,
      },
      {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
    );

      if (result.data.success) {
        onCreated?.(result.data.data); // callback for parent
        onClose();
      } else {
        setError("Failed to save house type");
      }
    } catch (err) {
      console.error("Error saving house type:", err);
      setError("Error saving house type");
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
  );
}
