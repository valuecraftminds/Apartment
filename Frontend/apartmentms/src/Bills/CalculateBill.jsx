import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function CalculateBill({ apartment_id }) {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState('');
  const [usedUnits, setUsedUnits] = useState('');
  const [commonAreaCost, setCommonAreaCost] = useState('');
  const [total, setTotal] = useState(null);
  const [loadingBills, setLoadingBills] = useState(false);
  const [error, setError] = useState(null);

  // Load bill types from backend
  const loadBills = async () => {
    try {
      setLoadingBills(true);
      setError(null);
      const result = await api.get(`/bills?apartment_id=${apartment_id}`);
      if (result.data.success && Array.isArray(result.data.data)) {
        setBills(result.data.data);
      } else {
        setBills([]);
      }
    } catch (err) {
      console.error('Error loading bills:', err);
      setError('Failed to load bills. Please try again.');
    } finally {
      setLoadingBills(false);
    }
  };

  useEffect(() => {
    if (apartment_id) loadBills();
  }, [apartment_id]);

  // Calculate bill logic
  const handleCalculate = () => {
    if (!selectedBill || !usedUnits) {
      toast.error('Please select a bill type and enter used units.');
      return;
    }

    const bill = bills.find((b) => b.type === selectedBill);
    if (!bill) {
      toast.error('Invalid bill type.');
      return;
    }

    // Example calculation: total = unitRate * usedUnits + commonAreaCost
    const unitRate = bill.unit_rate || 0;
    const units = parseFloat(usedUnits);
    const commonCost = parseFloat(commonAreaCost) || 0;

    const calculatedTotal = (unitRate * units + commonCost).toFixed(2);
    setTotal(calculatedTotal);
  };

  return (
    <div className="mt-4 text-gray-800 dark:text-gray-200 font-medium space-y-3">
      <h3 className="text-lg font-semibold mb-2">Select your bill type</h3>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col gap-3 max-w-md">
        {/* Bill type selector */}
        <select
          className="border border-purple-600 rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
          value={selectedBill}
          onChange={(e) => setSelectedBill(e.target.value)}
        >
          <option value="">-- Select Bill Type --</option>
          {bills.map((bills) => (
            <option key={bills.id} value={bills.bill_name}>
              {bills.bill_name}
            </option>
          ))}
        </select>

        {/* Used units */}
        <input
          type="number"
          placeholder="Enter used units"
          value={usedUnits}
          onChange={(e) => setUsedUnits(e.target.value)}
          className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
        />

        {/* Common area cost (only for water/electricity) */}
        {(selectedBill.toLowerCase() === 'electricity' ||
          selectedBill.toLowerCase() === 'water') && (
          <input
            type="number"
            placeholder="Enter common area cost"
            value={commonAreaCost}
            onChange={(e) => setCommonAreaCost(e.target.value)}
            className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
          />
        )}

        <button
          type="button"
          onClick={handleCalculate}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
        >
          Calculate
        </button>

        {total !== null && (
          <div className="mt-3 p-3 border rounded bg-purple-100 dark:bg-purple-900 dark:text-white">
            <p>
              <strong>Total Bill:</strong> Rs. {total}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
