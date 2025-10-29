import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader, FileText, Edit, Trash2, Plus } from "lucide-react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import CreateBillPrice from "./CreateBillPrice";

export default function BillPrice() {
  const { billrange_id } = useParams();
  const navigate = useNavigate();

  const [billPrices, setBillPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch bill prices for this range
  const loadBillPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/billprice?billrange_id=${billrange_id}`);

      if (res.data.success && Array.isArray(res.data.data)) {
        const filtered = res.data.data.filter(
          (bp) => bp.billrange_id === billrange_id
        );
        setBillPrices(filtered);
      } else {
        setBillPrices([]);
      }
    } catch (err) {
      console.error("Error loading bill prices:", err);
      setError("Failed to load bill prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillPrices();
  }, [billrange_id]);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar onCollapse={setIsSidebarCollapsed} />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Navbar />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6">
              <div className="flex items-center">
                <button
                  onClick={handleBack}
                  className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-purple-700 transition"
                >
                  <ChevronLeft size={25} />
                </button>
                <FileText
                  size={40}
                  className="text-purple-600 dark:text-purple-400 mr-3"
                />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Bill Prices
                </h1>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300">
                <button
             onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 mb-3 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105"
            >
              <Plus size={20} />
              <span>Set Bill Range Price</span>
            </button>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader size={32} className="animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">
                    Loading Bill Prices...
                  </span>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600 dark:text-red-400">
                  {error}
                  <button
                    onClick={loadBillPrices}
                    className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Retry
                  </button>
                </div>
              ) : billPrices.length === 0 ? (
                <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-lg">No Bill Prices Found</p>
                  <p className="text-sm">Add new prices for this range.</p>
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
                          Year
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Unit Price (Rs)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Fixed Amount (Rs)
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {billPrices.map((bp, index) => (
                        <tr key={bp.id}>
                          <td className="px-4 py-4">{index + 1}</td>
                          <td className="px-4 py-4">{bp.year}</td>
                          <td className="px-4 py-4">{bp.month}</td>
                          <td className="px-4 py-4">{bp.unitpice}</td>
                          <td className="px-4 py-4">{bp.fixedamount}</td>
                          <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button
                            //   onClick={() => {
                            //     setSelectedRange(range); // store the range to edit
                            //     setShowEditModal(true);
                            //   }}
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
            </div>
          </div>
        </div>
      </div>
       {showCreateModal && (
        <CreateBillPrice onClose={() => setShowCreateModal(false)} />
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
