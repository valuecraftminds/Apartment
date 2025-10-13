import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function CreateHouse({ onClose, onCreated, apartment_id, floor_id }) {
  const [numHouses, setNumHouses] = useState(1);
  const [houses, setHouses] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);
  const [lastHouseNumber, setLastHouseNumber] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [error, setError] = useState("");

  // Fetch existing houses to detect last house number
  useEffect(() => {
    const fetchExistingHouses = async () => {
      try {
        const res = await api.get(
          `/houses?apartment_id=${apartment_id}&floor_id=${floor_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (res.data?.data?.length > 0) {
          const maxNum = Math.max(
            ...res.data.data.map((h) => {
              const match = h.house_id?.match(/\d+/);
              return match ? parseInt(match[0]) : 0;
            })
          );
          setLastHouseNumber(maxNum);
        }
      } catch (err) {
        console.error("Error fetching existing houses:", err);
      } finally {
        setLoadingHouses(false);
      }
    };

    fetchExistingHouses();
  }, [apartment_id, floor_id]);

  // 🔹 Fetch house types for dropdown
  useEffect(() => {
    const fetchHouseTypes = async () => {
      try {
        const res = await api.get(`/housetype?apartment_id=${apartment_id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setHouseTypes(res.data.data || []);
      } catch (err) {
        console.error("Error fetching house types:", err);
      }
    };

    fetchHouseTypes();
  }, []);

  // 🔹 Generate houses
  const handleGenerate = () => {
    if (numHouses < 1) return;
    const generated = Array.from({ length: numHouses }, (_, i) => ({
      house_id: `H${lastHouseNumber + i + 1}`,
      housetype_id: "",
    }));
    setHouses(generated);
  };

  // 🔹 Handle field change
  const handleChange = (index, field, value) => {
    const updated = [...houses];
    updated[index][field] = value;
    setHouses(updated);
  };

  //Submit batch
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        apartment_id,
        floor_id,
        houses,
      };

      const res = await api.post("/houses/batch", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

       if (onCreated) onCreated(); // refresh the list
      if (onClose) onClose(); 
    } catch (err) {
      console.error("Error creating houses:", err);
      setError("Server error while creating houses.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-white">

      {error && <p className="text-red-500 mb-2">{error}</p>}
      <label className="text-sm  text-black dark:text-white">Number of Houses:</label>

      <div className="flex items-center gap-3 mb-3">
        <input
          type="number"
          value={numHouses}
          onChange={(e) => setNumHouses(parseInt(e.target.value))}
          className="border rounded p-2 text-black dark:text-white border-purple-600"
          min="1"
        />
        <button
          type="button"
          onClick={handleGenerate}
          className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white"
        >
          Generate
        </button>
      </div>

      {houses.length > 0 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {houses.map((house, i) => (
            <div key={i} className="border border-purple-600 rounded p-3">
              <p className="font-semibold mb-2">House {i + 1}</p>

              <div className="flex gap-3 mb-2">
                <input
                  type="text"
                  value={house.house_id}
                  disabled
                  className="border rounded p-2 text-black dark:text-white border-purple-600"
                />

                <select
                  value={house.housetype_id}
                  onChange={(e) => handleChange(i, "housetype_id", e.target.value)}
                  className="border rounded p-2 text-black dark:text-white border-purple-600 w-1/3"
                  required
                >
                  <option value="">Select Type</option>
                  {houseTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2 mt-3">
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
              {loading ? "Saving..." : "Save Houses"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
