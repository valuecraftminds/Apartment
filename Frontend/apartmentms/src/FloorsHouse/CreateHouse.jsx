import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Plus, Trash2, ArrowRight } from "lucide-react";

export default function CreateHouse({ onClose, onCreated, apartment_id, floor_id }) {
  const [houseTypeRows, setHouseTypeRows] = useState([
    { numHouses: 1, housetype_id: "" }
  ]);
  const [keyLetter, setKeyLetter] = useState("");
  const [houses, setHouses] = useState([]);
  const [houseTypes, setHouseTypes] = useState([]);
  const [existingHouses, setExistingHouses] = useState([]);
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
          //console.log("Existing houses:", res.data.data);
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

    const housesWithPrefix = existingHouses
      .filter(house => house.house_id && house.house_id.startsWith(prefix))
      .map(house => {
        const numberPart = house.house_id.slice(prefix.length);
        const numberMatch = numberPart.match(/^\d+$/);
        return numberMatch ? parseInt(numberMatch[0]) : 0;
      })
      .filter(num => num > 0);

    //console.log(`Houses with prefix "${prefix}":`, housesWithPrefix);

    if (housesWithPrefix.length === 0) return 0;
    
    const maxNumber = Math.max(...housesWithPrefix);
    //console.log(`Last house number for prefix "${prefix}":`, maxNumber);
    return maxNumber;
  };

  // Add new house type row
  const addHouseTypeRow = () => {
    setHouseTypeRows(prev => [
      ...prev,
      { numHouses: 1, housetype_id: "" }
    ]);
  };

  // Remove house type row
  const removeHouseTypeRow = (index) => {
    if (houseTypeRows.length === 1) {
      setError("At least one house type row is required");
      return;
    }
    setHouseTypeRows(prev => prev.filter((_, i) => i !== index));
  };

  // Update house type row
  const updateHouseTypeRow = (index, field, value) => {
    setHouseTypeRows(prev => 
      prev.map((row, i) => 
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  // Generate houses based on house type rows
  const handleGenerate = () => {
    if (!keyLetter.trim()) {
      setError("Please enter a key letter/prefix");
      return;
    }

    // Validate all rows have house types selected
    const invalidRows = houseTypeRows.filter(row => !row.housetype_id || row.numHouses < 1);
    if (invalidRows.length > 0) {
      setError("Please select house type and ensure number of houses is at least 1 for all rows");
      return;
    }

    setError("");

    const prefix = keyLetter.trim().toUpperCase();
    const lastNumber = getLastHouseNumber(prefix);
    let currentNumber = lastNumber + 1;

    const generatedHouses = [];

    // Generate houses for each row
    houseTypeRows.forEach(row => {
      const houseType = houseTypes.find(type => type.id === row.housetype_id);
      
      for (let i = 0; i < row.numHouses; i++) {
        generatedHouses.push({
          house_id: `${prefix}${currentNumber}`,
          housetype_id: row.housetype_id,
          house_type_name: houseType?.name || "" // Store for display
        });
        currentNumber++;
      }
    });

    //console.log(`Generated ${generatedHouses.length} houses:`, generatedHouses);
    setHouses(generatedHouses);
  };

  // Handle individual house type change in the generated list
  const handleHouseTypeChange = (index, housetype_id) => {
    const updated = [...houses];
    updated[index].housetype_id = housetype_id;
    
    // Update house type name for display
    const houseType = houseTypes.find(type => type.id === housetype_id);
    updated[index].house_type_name = houseType?.name || "";
    
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
        houses: houses.map(house => ({
          house_id: house.house_id,
          housetype_id: house.housetype_id
        })),
      };

      const res = await api.post("/houses/batch", payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (onCreated) onCreated();
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
    setHouses([]);
  };

  // Calculate total houses to generate
  const totalHouses = houseTypeRows.reduce((total, row) => total + (row.numHouses || 0), 0);

  return (
    <div className="p-4 text-white">
      {error && (
        <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Configuration */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-300 p-4">
            <h3 className="text-lg font-semibold mb-4 text-black dark:text-white flex items-center">
              <span className="bg-purple-600 text-white p-2 rounded-full mr-2">
                1
              </span>
              Configure Houses
            </h3>

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
                maxLength={10}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter letters that will prefix your house numbers (e.g., H for H1, H2... or EH for EH1, EH2...)
              </p>
            </div>

            {/* House Type Configuration Rows */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-black dark:text-white">
                  House Type Configuration:
                </label>
                <button
                  type="button"
                  onClick={addHouseTypeRow}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                >
                  <Plus size={16} />
                  Add Row
                </button>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto border border-purple-300 rounded p-3 bg-gray-50 dark:bg-gray-700">
                {houseTypeRows.map((row, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-600 rounded border">
                    <div className="flex-1">
                      <label className="block text-xs text-black dark:text-white mb-1">
                        Number:
                      </label>
                      <input
                        type="number"
                        value={row.numHouses}
                        onChange={(e) => updateHouseTypeRow(index, "numHouses", parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-purple-600 rounded text-black dark:text-white dark:bg-gray-500"
                        min="1"
                        max="50"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-xs text-black dark:text-white mb-1">
                        Type:
                      </label>
                      <select
                        value={row.housetype_id}
                        onChange={(e) => updateHouseTypeRow(index, "housetype_id", e.target.value)}
                        className="w-full p-2 border border-purple-600 rounded text-black dark:text-white dark:bg-gray-500"
                      >
                        <option value="">Select Type</option>
                        {houseTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end pt-2">
                      <button
                        type="button"
                        onClick={() => removeHouseTypeRow(index)}
                        disabled={houseTypeRows.length === 1}
                        className="p-1 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title="Remove row"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 dark:text-gray-300">Total houses to generate:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 text-lg">
                    {totalHouses}
                  </span>
                </div>
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

            {/* Generate Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!keyLetter.trim() || loadingHouses || totalHouses === 0}
              className="w-full px-4 py-3 rounded bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
            >
              {loadingHouses ? (
                "Loading..."
              ) : (
                <>
                  Generate {totalHouses} House{totalHouses !== 1 ? 's' : ''}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Generated Houses */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-300 p-4 h-full">
            <h3 className="text-lg font-semibold mb-4 text-black dark:text-white flex items-center">
              <span className="bg-purple-600 text-white p-2 rounded-full mr-2">
                2
              </span>
              Review & Save
            </h3>

            {houses.length > 0 ? (
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
                <div className="flex-1 border border-purple-300 rounded p-3 overflow-y-auto max-h-96">
                  <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                    Generated {houses.length} house{houses.length !== 1 ? 's' : ''} with prefix "{keyLetter.toUpperCase()}"
                  </div>
                  
                  {houses.map((house, i) => (
                    <div key={i} className="border border-purple-200 rounded p-3 mb-3 bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-black dark:text-white mb-1">
                            House ID:
                          </label>
                          <input
                            type="text"
                            value={house.house_id}
                            disabled
                            className="border rounded p-2 text-black dark:text-white border-purple-600 bg-gray-100 dark:bg-gray-600 w-full text-sm"
                          />
                        </div>

                        <div className="flex-1">
                          <label className="block text-xs text-black dark:text-white mb-1">
                            House Type:
                          </label>
                          <select
                            value={house.housetype_id}
                            onChange={(e) => handleHouseTypeChange(i, e.target.value)}
                            className="w-full p-2 border border-purple-600 rounded text-black dark:text-white dark:bg-gray-600 text-sm"
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
                      {house.house_type_name && (
                        <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                          Type: {house.house_type_name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 rounded bg-gray-400 hover:bg-gray-500 text-white disabled:bg-gray-300 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white disabled:bg-purple-400 flex items-center gap-2 text-sm"
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
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                <div className="text-4xl mb-2">🏠</div>
                <p className="text-center">Houses will appear here</p>
                <p className="text-center text-sm">Configure and generate houses on the left</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}