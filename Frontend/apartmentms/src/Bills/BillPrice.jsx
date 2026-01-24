import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader, FileText, Edit, Trash2, Plus } from "lucide-react";
import api from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import CreateBillPrice from "./CreateBillPrice";
import EditBillPrice from "./EditBillPrice";

export default function BillPrice() {
  const { bill_id, billrange_id } = useParams();
  const navigate = useNavigate();

  const [billPrices, setBillPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBillPrice, setEditingBillPrice] = useState(null);

  // Add this useEffect to debug the route parameters
  React.useEffect(() => {
    console.log('Route parameters:', { bill_id, billrange_id });
  }, [bill_id, billrange_id]);

  // Fetch bill prices for this range
  const loadBillPrices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // console.log('Loading bill prices with:', { bill_id, billrange_id });
      
      // Use the correct API endpoint with query parameters
      const res = await api.get(`/billprice?bill_id=${bill_id}&billrange_id=${billrange_id}`);
      
      console.log('API Response:', res.data);

      if (res.data.success) {
        setBillPrices(res.data.data || []);
      } else {
        setBillPrices([]);
        setError(res.data.message || 'Failed to load bill prices');
      }
    } catch (err) {
      console.error("Error loading bill prices:", err);
      setError(err.response?.data?.message || "Failed to load bill prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bill_id && billrange_id) {
      loadBillPrices();
    } else {
      setError("Missing bill_id or billrange_id in URL parameters");
    }
  }, [bill_id, billrange_id]);

  const handleBack = () => {
    navigate(-1);
  };

  //create bill price
  const handleCreateBillPrice = () => {
    loadBillPrices();
    setShowCreateModal(false);
    toast.success('Bill price created successfully!');
  }

  // Handle edit button click
  const handleEditClick = (billPrice) => {
    setEditingBillPrice(billPrice);
    setShowEditModal(true);
  };

  //handle edit
  const handleEditBillPrice = () => {
    loadBillPrices();
    setShowEditModal(false);
    setEditingBillPrice(null);
    toast.success('Updated!');
  }

   // Handle modal close
  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditingBillPrice(null);
  }

  //handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bill price?')) {
      return;
    }

    try {
      await api.delete(`/billprice/${id}`);
      toast.success('Bill price deleted successfully');
      loadBillPrices();
    } catch (err) {
      console.error('Error deleting bill price:', err);
      toast.error('Failed to delete bill price');
    }
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
              {/* <div className="text-sm text-gray-600 dark:text-gray-400">
                Bill ID: {bill_id || 'NOT FOUND'} | Range ID: {billrange_id || 'NOT FOUND'}
              </div> */}
            </div>

            {/* Show error if parameters are missing */}
            {/* {(!bill_id || !billrange_id) && (
              <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
                <strong>Error:</strong> Missing bill_id or billrange_id in URL parameters. 
                Please check your route configuration.
              </div>
            )} */}

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300">
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={!bill_id || !billrange_id}
                className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white ${
                  !bill_id || !billrange_id 
                    ? 'bg-purple-400 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700 hover:scale-105'
                }`}
              >
                <Plus size={20} />
                <span>Set Bill Price</span>
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
                  <p className="text-sm">Add new prices for this bill range.</p>
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
                          <td className="px-4 py-4">{bp.unitprice}</td>
                          <td className="px-4 py-4">{bp.fixedamount}</td>
                          <td className="px-4 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditClick(bp)} 
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Edit"
                              >
                                <Edit size={20} />
                              </button>
                              <button
                                onClick={() => handleDelete(bp.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
        <CreateBillPrice 
          onClose={() => setShowCreateModal(false)} 
          onCreated={handleCreateBillPrice}
          billrange_id={billrange_id}
          bill_id={bill_id}
        />
      )}
      {showEditModal && editingBillPrice && (
        <EditBillPrice
          onClose={handleEditModalClose}
          onUpdated={handleEditBillPrice}
          billrange_id={billrange_id}
          bill_id={bill_id}
          billPrice={editingBillPrice} 
        />
      )}


      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}