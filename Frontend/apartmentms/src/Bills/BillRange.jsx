import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Loader, Image, Edit, Trash2 } from "lucide-react";
import api from "../api/axios";
import { toast, ToastContainer } from "react-toastify";

export default function BillRange() {
  const { bill_id } = useParams(); // get from route
  const [loadingRanges, setLoadingRanges] = useState(false);
  const [error, setError] = useState(null);
  const [billRanges, setBillRanges] = useState([]);

  const loadBillRanges = async () => {
    try {
      setLoadingRanges(true);
      setError(null);
      const result = await api.get(`/billranges?bill_id=${bill_id}`);
      if (result.data.success && Array.isArray(result.data.data)) {
        setBillRanges(result.data.data);
      } else {
        setBillRanges([]);
      }
    } catch (err) {
      console.error("Error loading bill ranges:", err);
      setError("Failed to load bill ranges. Please try again.");
    } finally {
      setLoadingRanges(false);
    }
  };

  useEffect(() => {
    loadBillRanges();
  }, [bill_id]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300">
      <button
        onClick={() => toast.info("Add new bill range clicked!")}
        className="flex items-center gap-2 mb-3 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105"
      >
        <Plus size={20} />
        <span>New Bill Range</span>
      </button>

      {loadingRanges ? (
        <div className="flex justify-center items-center py-12">
          <Loader size={32} className="animate-spin text-purple-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">
            Loading Bill Ranges...
          </span>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600 dark:text-red-400">
          {error}
          <button
            onClick={loadBillRanges}
            className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      ) : billRanges.length === 0 ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-300">
          <Image size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg">No bill ranges found</p>
          <p className="text-sm">Add new ranges for this bill type</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  From Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  To Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {billRanges.map((range, index) => (
                <tr key={range.id}>
                  <td className="px-4 py-4">{index + 1}</td>
                  <td className="px-4 py-4">{range.fromRange}</td>
                  <td className="px-4 py-4">{range.toRange}</td>
                  <td className="px-4 py-4">{range.unitPrice}</td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
