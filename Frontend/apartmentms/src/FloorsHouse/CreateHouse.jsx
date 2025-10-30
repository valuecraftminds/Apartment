import React, { useState, useEffect } from "react";
import api from "../api/axios";

export default function CreateHouse({ onClose, onCreated, apartment_id, floor_id }) {
  const [numHouses, setNumHouses] = useState(1);
  const [keyLetter, setKeyLetter] = useState(""); // New state for key letter
  const [houses, setHouses] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);
  const [existingHouses, setExistingHouses] = useState([]); // Store all existing houses
  const [loading, setLoading] = useState(false);
  const [loadingHouses, setLoadingHouses] = useState(true);
  const [error, setError] = useState("");

  // Fetch existing houses to detect last house number for each prefix
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
          setExistingHouses(res.data.data);
          console.log("Existing houses:", res.data.data);
        }
      } catch (err) {
        console.error("Error fetching existing houses:", err);
      } finally {
        setLoadingHouses(false);
      }
    };

    fetchExistingHouses();
  }, [apartment_id, floor_id]);

  // Fetch house types for dropdown
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
  }, [apartment_id]);

  // Function to get the last house number for a specific key letter
  const getLastHouseNumber = (prefix) => {
    if (!prefix || existingHouses.length === 0) return 0;

    // Filter houses that start with the prefix and extract numbers
    const housesWithPrefix = existingHouses
      .filter(house => house.house_id && house.house_id.startsWith(prefix))
      .map(house => {
        // Extract number part after the prefix
        const numberPart = house.house_id.slice(prefix.length);
        const numberMatch = numberPart.match(/^\d+$/); // Match only digits
        return numberMatch ? parseInt(numberMatch[0]) : 0;
      })
      .filter(num => num > 0); // Remove invalid numbers

    console.log(`Houses with prefix "${prefix}":`, housesWithPrefix);

    if (housesWithPrefix.length === 0) return 0;
    
    const maxNumber = Math.max(...housesWithPrefix);
    console.log(`Last house number for prefix "${prefix}":`, maxNumber);
    return maxNumber;
  };

  // Generate houses with the key letter prefix
  const handleGenerate = () => {
    if (numHouses < 1) {
      setError("Number of houses must be at least 1");
      return;
    }

    if (!keyLetter.trim()) {
      setError("Please enter a key letter/prefix");
      return;
    }

    setError("");

    const prefix = keyLetter.trim().toUpperCase();
    const lastNumber = getLastHouseNumber(prefix);
    const startNumber = lastNumber + 1;

    console.log(`Generating ${numHouses} houses with prefix "${prefix}" starting from ${startNumber}`);

    const generated = Array.from({ length: numHouses }, (_, i) => ({
      house_id: `${prefix}${startNumber + i}`,
      housetype_id: "",
    }));

    setHouses(generated);
  };

  // Handle field change
  const handleChange = (index, field, value) => {
    const updated = [...houses];
    updated[index][field] = value;
    setHouses(updated);
  };

  // Submit batch
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate all houses have types selected
    const invalidHouses = houses.filter(house => !house.housetype_id);
    if (invalidHouses.length > 0) {
      setError("Please select house type for all houses");
      setLoading(false);
      return;
    }

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
      setError(err.response?.data?.message || "Server error while creating houses.");
    } finally {
      setLoading(false);
    }
  };

  // Clear houses when key letter changes
  const handleKeyLetterChange = (e) => {
    setKeyLetter(e.target.value);
    setHouses([]); // Clear generated houses when prefix changes
  };

  return (
    <div className="p-4 text-white">
      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Key Letter Input */}
      <div className="mb-4">
        <label className="block text-sm text-black dark:text-white mb-2">
          Key Letter/Prefix:
        </label>
        <input
          type="text"
          value={keyLetter}
          onChange={handleKeyLetterChange}
          placeholder="Enter prefix (e.g., H, E, EH, A)"
          className="w-full p-2 border border-purple-600 rounded text-black dark:text-white dark:bg-gray-700"
          maxLength={10} // Reasonable limit for prefix
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter letters that will prefix your house numbers (e.g., H for H1, H2... or EH for EH1, EH2...)
        </p>
      </div>

      {/* Number of Houses Input */}
      <div className="mb-4">
        <label className="block text-sm text-black dark:text-white mb-2">
          Number of Houses:
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={numHouses}
            onChange={(e) => setNumHouses(parseInt(e.target.value) || 1)}
            className="border rounded p-2 text-black dark:text-white border-purple-600 dark:bg-gray-700 w-20"
            min="1"
            max="50" // Reasonable limit
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!keyLetter.trim() || loadingHouses}
            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loadingHouses ? "Loading..." : "Generate Houses"}
          </button>
        </div>
      </div>

      {/* Preview Information */}
      {keyLetter.trim() && existingHouses.length > 0 && (
        <div className="mb-3 p-2 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
          <strong>Prefix "{keyLetter.toUpperCase()}":</strong> Found {getLastHouseNumber(keyLetter.trim().toUpperCase())} existing houses. 
          {getLastHouseNumber(keyLetter.trim().toUpperCase()) === 0 
            ? " Will start from 1." 
            : ` Will continue from ${getLastHouseNumber(keyLetter.trim().toUpperCase()) + 1}.`
          }
        </div>
      )}

      {/* Generated Houses Form */}
      {houses.length > 0 && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="border border-purple-600 rounded p-3 max-h-80 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3 text-black dark:text-white">
              Generated Houses ({houses.length})
            </h3>
            
            {houses.map((house, i) => (
              <div key={i} className="border border-purple-300 rounded p-3 mb-3 bg-white dark:bg-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <label className="block text-sm text-black dark:text-white mb-1">
                      House ID:
                    </label>
                    <input
                      type="text"
                      value={house.house_id}
                      disabled
                      className="border rounded p-2 text-black dark:text-white border-purple-600 bg-gray-100 dark:bg-gray-700 w-full"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm text-black dark:text-white mb-1">
                      House Type:
                    </label>
                    <select
                      value={house.housetype_id}
                      onChange={(e) =>
                        handleChange(i, "housetype_id", e.target.value)
                      }
                      className="w-full p-2 border border-purple-600 rounded-md dark:bg-gray-700 dark:text-white text-black"
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
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-3 sticky bottom-0 bg-white dark:bg-gray-800 p-2 rounded">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white disabled:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                `Save ${houses.length} House${houses.length > 1 ? 's' : ''}`
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}