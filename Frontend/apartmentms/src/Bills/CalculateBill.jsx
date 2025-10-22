import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf'; // <-- install this with: npm install jspdf

export default function CalculateBill({ apartment_id }) {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState('');
  const [usedUnits, setUsedUnits] = useState('');
  const [commonAreaCost, setCommonAreaCost] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [month, setMonth] = useState('');
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
    if (!selectedBill || !usedUnits || !unitPrice || !month) {
      toast.error('Please fill all required fields.');
      return;
    }

    const bill = bills.find((b) => b.bill_name === selectedBill);
    if (!bill) {
      toast.error('Invalid bill type.');
      return;
    }

    const units = parseFloat(usedUnits);
    const commonCost = parseFloat(commonAreaCost) || 0;
    const calculatedTotal = (unitPrice * units + commonCost).toFixed(2);

    setTotal(calculatedTotal);
    toast.success('Bill calculated successfully!');
  };

  // Generate invoice PDF
  const handleGenerateInvoice = () => {
    if (!total) {
      toast.error('Please calculate the bill before generating an invoice.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('🏢 Apartment Bill Invoice', 20, 20);

    doc.setFontSize(12);
    doc.text(`Apartment ID: ${apartment_id}`, 20, 35);
    doc.text(`Bill Type: ${selectedBill}`, 20, 45);
    doc.text(`Month: ${month}`, 20, 55);
    doc.text(`Used Units: ${usedUnits}`, 20, 65);
    doc.text(`Unit Price: Rs. ${unitPrice}`, 20, 75);

    if (
      selectedBill.toLowerCase() === 'electricity' ||
      selectedBill.toLowerCase() === 'water'
    ) {
      doc.text(`Common Area Cost: Rs. ${commonAreaCost || 0}`, 20, 85);
    }

    doc.text(`--------------------------------------`, 20, 95);
    doc.setFontSize(14);
    doc.text(`Total Bill: Rs. ${total}`, 20, 105);

    doc.save(`Invoice_${selectedBill}_${month}.pdf`);
  };

  return (
    <div className="mt-4 text-gray-800 dark:text-gray-200 font-medium space-y-3">
      <h3 className="text-lg font-semibold mb-2">Calculate Monthly Bill</h3>

      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-col gap-3 max-w-md">
        {/* Select Month */}
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
          required
        />

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

        {/* Unit Price */}
        <input
          type="number"
          placeholder="Enter unit price"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
        />

        {/* Common area cost (only for water/electricity) */}
        {(selectedBill === 'electricity' || 'Electricity Bill' ||
          selectedBill=== 'water' || 'Water Bill') && (
          <input
            type="number"
            placeholder="Enter common area cost"
            value={commonAreaCost}
            onChange={(e) => setCommonAreaCost(e.target.value)}
            className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
          />
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCalculate}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
          >
            Calculate
          </button>

          <button
            type="button"
            onClick={handleGenerateInvoice}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
          >
            Generate Invoice
          </button>
        </div>

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
