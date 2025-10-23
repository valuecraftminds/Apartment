import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import jsPDF from 'jspdf';

export default function CalculateBill({ apartment_id }) {
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState('');
  const [totalConsumption, setTotalConsumption] = useState('');
  const [totalBillAmount, setTotalBillAmount] = useState('');
  const [unitPrice, setUnitPrice] = useState(null);
  const [usedUnits, setUsedUnits] = useState('');
  const [commonAreaCost, setCommonAreaCost] = useState('');
  const [month, setMonth] = useState('');
  const [total, setTotal] = useState(null);
  const [loadingBills, setLoadingBills] = useState(false);
  const [error, setError] = useState(null);

  // Load bill types
  const loadBills = async () => {
    try {
      setLoadingBills(true);
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

  // Step 1: Calculate price per unit
  const handleCalculateUnitPrice = () => {
    if (!totalConsumption || !totalBillAmount) {
      toast.error('Please enter both total consumption and total bill amount.');
      return;
    }

    const pricePerUnit = parseFloat(totalBillAmount) / parseFloat(totalConsumption);
    const roundedPrice = pricePerUnit.toFixed(2);
    setUnitPrice(roundedPrice);
    // toast.success(`Unit price calculated: Rs. ${roundedPrice} per unit`);
  };

  // Step 2: Calculate specific house bill
  const handleCalculateHouseBill = () => {
    if (!selectedBill || !usedUnits || !unitPrice || !month) {
      toast.error('Please fill all required fields.');
      return;
    }

    const houseUnits = parseFloat(usedUnits);
    const commonCost = parseFloat(commonAreaCost) || 0;
    const houseTotal = (unitPrice * houseUnits + commonCost).toFixed(2);

    setTotal(houseTotal);
    toast.success('House bill calculated successfully!');
  };

  // Generate invoice
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

    if (['electricity', 'water', 'Electricity Bill', 'Water Bill'].includes(selectedBill.toLowerCase())) {
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
        {/* Month */}
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
          required
        />

        {/* Bill type */}
        <select
          className="border border-purple-600 rounded p-2 bg-white dark:bg-gray-700 dark:text-white"
          value={selectedBill}
          onChange={(e) => setSelectedBill(e.target.value)}
        >
          <option value="">-- Select Bill Type --</option>
          {bills.map((bill) => (
            <option key={bill.id} value={bill.bill_name}>
              {bill.bill_name}
            </option>
          ))}
        </select>

        {/* Step 1: Total apartment data */}
        <input
          type="number"
          placeholder="Total apartment consumption (units)"
          value={totalConsumption}
          onChange={(e) => setTotalConsumption(e.target.value)}
          className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="number"
          placeholder="Total apartment bill amount (Rs)"
          value={totalBillAmount}
          onChange={(e) => setTotalBillAmount(e.target.value)}
          className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
        />

        <button
          type="button"
          onClick={handleCalculateUnitPrice}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
        >
          Calculate Unit Price
        </button>

        {/* Display unit price */}
        {unitPrice && (
          <div className="p-3 border rounded bg-purple-100 dark:bg-purple-900 dark:text-white">
            <strong>Unit Price:</strong> Rs. {unitPrice} per unit
          </div>
        )}

        {/* Step 2: Specific house data */}
        <input
          type="number"
          placeholder="Used units for this house"
          value={usedUnits}
          onChange={(e) => setUsedUnits(e.target.value)}
          className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
        />

        {(selectedBill.toLowerCase().includes('electricity') ||
          selectedBill.toLowerCase().includes('water')) && (
          <input
            type="number"
            placeholder="Enter common area cost (optional)"
            value={commonAreaCost}
            onChange={(e) => setCommonAreaCost(e.target.value)}
            className="border border-purple-600 rounded p-2 dark:bg-gray-700 dark:text-white"
          />
        )}

        <button
          type="button"
          onClick={handleCalculateHouseBill}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
        >
          Calculate House Bill
        </button>

        {total && (
          <div className="p-3 border rounded bg-purple-100 dark:bg-purple-900 dark:text-white">
            <strong>Total Bill for House:</strong> Rs. {total}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerateInvoice}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
        >
          Generate Invoice PDF
        </button>
      </div>
      <ToastContainer position="top-center" autoClose={3000}/>
    </div>
  );
}
