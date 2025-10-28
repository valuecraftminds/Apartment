import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { toast, ToastContainer } from "react-toastify";

export default function CalculateBill() {
  const [calculationType, setCalculationType] = useState("");
  const [bills, setBillTypes] = useState([]);
  const [selectedBill, setSelectedBill] = useState("");
  const [billRanges, setBillRanges] = useState([]);
  const [usedUnits, setUsedUnits] = useState("");
  const [fixedCharges, setFixedCharges] = useState('');
  const [commonCost, setCommonCost] = useState("");
  const [total, setTotal] = useState(null);

  const token = localStorage.getItem("token");

  // Load bill types
  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await api.get("/bills", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBillTypes(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load bill types");
      }
    };
    fetchBills();
  }, []);

  // Load bill ranges when bill type selected
  useEffect(() => {
  const fetchRanges = async () => {
    if (!selectedBill) return;
    try {
      const res = await api.get(`/billranges/bills/${selectedBill}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBillRanges(res.data.data || res.data || []);
    } catch (err) {
      console.error("Error fetching bill ranges:", err);
      toast.error("Failed to load bill ranges");
    }
  };
  fetchRanges();
}, [selectedBill]);


  // Bill calculation logic
  const handleCalculate = () => {
    if (!usedUnits || !selectedBill) {
      toast.error("Please fill in all fields");
      return;
    }

    let remainingUnits = parseFloat(usedUnits);
    let totalCost = 0;

    for (const range of billRanges) {
      const from = parseFloat(range.fromRange);
      const to = parseFloat(range.toRange);
      const price = parseFloat(range.unitPrice);

      if (remainingUnits > 0) {
        const unitsInRange = Math.min(remainingUnits, to - from + 1);
        totalCost += unitsInRange * price;
        remainingUnits -= unitsInRange;
      }
    }

    if (commonCost) totalCost += parseFloat(commonCost);

    setTotal(totalCost.toFixed(2));
    toast.success("Bill calculated successfully!");
  };

  return (
    <div className="p-6 space-y-4 text-gray-800 dark:text-gray-200">
      <h2 className="text-xl font-bold">Calculate Bill</h2>

      {/* <input
        type="text"
        placeholder="Calculation type (e.g., Monthly, 6 Months, Annual)"
        value={calculationType}
        onChange={(e) => setCalculationType(e.target.value)}
        className="border border-purple-600 rounded p-2 w-full dark:bg-gray-700 dark:text-white"
      /> */}

      <select
        value={selectedBill}
        onChange={(e) => setSelectedBill(e.target.value)}
        className="border border-purple-600 rounded p-2 w-full dark:bg-gray-700 dark:text-white"
      >
        <option value="">-- Select Bill Type --</option>
        {bills.map((bill) => (
          <option key={bill.id} value={bill.id}>
            {bill.bill_name}
          </option>
        ))}
      </select>

      {billRanges.length > 0 && (
        <div className="border rounded p-3 bg-gray-50 dark:bg-gray-800">
          <h3 className="font-semibold mb-2">Bill Ranges</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-purple-200 dark:bg-purple-700">
                <th>From</th>
                <th>To</th>
                <th>Unit Price (Rs)</th>
              </tr>
            </thead>
            <tbody>
              {billRanges.map((r, i) => (
                <tr key={i} className="text-center border-t">
                  <td>{r.fromRange}</td>
                  <td>{r.toRange}</td>
                  <td>{r.unitPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* <input
        type="number"
        placeholder="Levy"
        value={usedUnits}
        onChange={(e) => setUsedUnits(e.target.value)}
        className="border border-purple-600 rounded p-2 w-full dark:bg-gray-700 dark:text-white"
      /> */}

      {/* <input
        type="number"
        placeholder="Used units"
        value={usedUnits}
        onChange={(e) => setUsedUnits(e.target.value)}
        className="border border-purple-600 rounded p-2 w-full dark:bg-gray-700 dark:text-white"
      /> */}

      {/* <input
        type="number"
        placeholder="Common area cost (optional)"
        value={commonCost}
        onChange={(e) => setCommonCost(e.target.value)}
        className="border border-purple-600 rounded p-2 w-full dark:bg-gray-700 dark:text-white"
      /> */}

      {/* <button
        onClick={handleCalculate}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
      >
        Calculate Bill
      </button> */}

      {total && (
        <div className="mt-4 p-3 border rounded bg-purple-100 dark:bg-purple-900 dark:text-white">
          <strong>Total Bill:</strong> Rs. {total}
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
