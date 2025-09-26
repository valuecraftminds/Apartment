import React, { useState } from "react";
import api from "../api/axios";

export default function CreateFloors({ onClose, apartment_id }) {
  const [numFloors, setNumFloors] = useState(1);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    const generated = Array.from({ length: numFloors }, (_, i) => ({
      floor_id: `F${i + 1}`,  // auto-generate F1, F2, ...
    }));
    setFloors(generated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...floors];
    updated[index][field] = value;
    setFloors(updated);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await api.post(
      "/floors/batch",
      {
        apartment_id: apartment_id,floors  // your array
    },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, 
        },
      }
    );
    console.log("Created floors:", res.data);
    onClose();
  } catch (err) {
    console.error("Error creating floors:", err);
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label>
        How many floors do want to add?
        <input
          type="number"
          value={numFloors}
          min="1"
          onChange={(e) => setNumFloors(parseInt(e.target.value))}
          className="border rounded p-2"
        />
      </label>
      <button type="button" onClick={handleGenerate} className="bg-purple-500 text-white px-3 py-1 rounded">
        Generate Floors
      </button>

      {floors.map((floor, idx) => (
        <div key={idx} className="border p-2 rounded">
          <p>Floor {idx + 1}</p>
          <input
            type="text"
            value={floor.floor_id}
            onChange={(e) => handleChange(idx, "floor_id", e.target.value)}
            className="border rounded p-1 mr-2"
          />
          {/* <input
            type="number"
            value={floor.house_count}
            onChange={(e) => handleChange(idx, "house_count", e.target.value)}
            className="border rounded p-1"
          /> */}
        </div>
      ))}

      <div className="flex justify-end gap-2">
        <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 rounded bg-gray-400 text-white"
        >
          Cancel
        </button>
        <button 
            type="submit" 
            disabled={loading} 
            className="px-4 py-2 rounded bg-purple-600 text-white"
        >
          {loading ? "Saving..." : "Save All"}
        </button>
      </div>
    </form>
  );
}
