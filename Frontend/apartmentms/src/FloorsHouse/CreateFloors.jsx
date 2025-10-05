import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function CreateFloors({ onClose, apartment_id }) {
  const [numFloors, setNumFloors] = useState(1);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFloorNumber, setLastFloorNumber] = useState(0);
  const [loadingFloors, setLoadingFloors] = useState(true);

  // Fetch existing floors on mount
  useEffect(() => {
    const fetchExistingFloors = async () => {
      try {
        const res = await api.get(`/floors/apartment/${apartment_id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        console.log("Existing floors from backend:", res.data);

        if (res.data && res.data.length > 0) {
          // Extract the max number from ANY digits in floor_id
          const maxNum = Math.max(
            ...res.data.map((f) => {
              const match = f.floor_id.match(/\d+/); // find digits
              return match ? parseInt(match[0]) : 0;
            })
          );
          console.log("Detected last floor number:", maxNum);
          setLastFloorNumber(maxNum);
        }
      } catch (err) {
        console.error("Error fetching existing floors:", err);
      } finally {
        setLoadingFloors(false);
      }
    };

    fetchExistingFloors();
  }, [apartment_id]);

  const handleGenerate = () => {
    const generated = Array.from({ length: numFloors }, (_, i) => ({
      floor_id: `F${lastFloorNumber + i + 1}`, // continue from last floor
    }));
    console.log("Generated floors:", generated);
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
          apartment_id: apartment_id,
          floors,
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

  if (loadingFloors) {
    return <p>Loading existing floors...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-h-[90vh] overflow-hidden"
    >
      <label>
        How many floors do you want to add?
        <input
          type="number"
          value={numFloors}
          min="1"
          onChange={(e) => setNumFloors(parseInt(e.target.value))}
          className="border rounded p-2 text-black dark:text-white border-purple-600"
        />
      </label>

      <button
        type="button"
        onClick={handleGenerate}
        className="bg-purple-500 text-white px-3 py-1 rounded"
      >
        Generate Floors
      </button>

      {/* Scrollable floor list */}
      <div className="flex-1 overflow-y-auto border rounded p-2 max-h-64">
        {floors.map((floor, idx) => (
          <div key={idx} className="border rounded p-2 text-black dark:text-white border-purple-600">
            <p>Floor {lastFloorNumber + idx + 1}</p>
            <input
              type="text"
              value={floor.floor_id}
              onChange={(e) =>
                handleChange(idx, "floor_id", e.target.value)
              }
              className="border rounded p-1 mr-2"
            />
          </div>
        ))}
      </div>

      {/* Sticky buttons */}
      <div className="flex justify-end gap-2 sticky bottom-0 p-2 border-t">
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
