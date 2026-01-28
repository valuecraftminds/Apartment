import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Loader, Image, Edit, Trash2, Receipt, ChevronLeft } from "lucide-react";
import api from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/navbar";
import CreateBillRange from "./CreateBillRange";
import EditBillRange from "./EditBillRange";

export default function BillRange() {
  const { bill_id } = useParams(); // get from route
  //console.log('Bill ID:', bill_id);
  const [loadingRanges, setLoadingRanges] = useState(false);
  const [error, setError] = useState(null);
  const [billRanges, setBillRanges] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [bills,setBills] = useState([]);
  const [loadingBills,setLoadingBills] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRange, setSelectedRange] = useState(null);
  const [deletingBillRange, setDeletingBillRange] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadBillRanges = async () => {
    try {
      setLoadingRanges(true);
      setError(null);
      const result = await api.get(`/billranges?bill_id=${bill_id}`);
      if (result.data.success && Array.isArray(result.data.data)) {
        const filtered = result.data.data.filter(
          (range) => (range.bill_id) === bill_id
        );
        setBillRanges(filtered);
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

  //handle back
  const handleBack = () =>{
    navigate('/bills-and-calculations')
  }

  const loadBills = async () => {
        try {
            setLoadingBills(true);
            setError(null);
            // const result = await api.get(`/bills?apartment_id=${apartment_id}`);
            const result = await api.get('/bills');
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

    useEffect(()=>{
        loadBills();
    },[]);

    //Delete bill range
  const handleDeleteClick = (billranges) => {
    setDeletingBillRange(billranges);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!deletingBillRange) return;
      await api.delete(`/billranges/${deletingBillRange.id}`);
      toast.success('Bill range deleted successfully');
      setShowDeleteModal(false);
      setDeletingBillRange(null);
      loadBillRanges();
    } catch (err) {
      console.error('Delete bill range error:', err);
      toast.error('Failed to delete bill range');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingBillRange(null);
  };


  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
      <Sidebar onCollapse={setIsSidebarCollapsed}/>
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Navbar/>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
              <div className='flex items-center'>
                <button onClick={handleBack} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                    <ChevronLeft size={25} />
                </button>
                  <Receipt size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                  <h1 
                  className="text-2xl font-bold text-gray-800 dark:text-white">Bill Ranges for {" "}
                    {(() => {
                      const selectedBill = bills.find((b) => b.id === bill_id);
                      return selectedBill ? selectedBill.bill_name : "Loading...";
                    })()}
                  </h1>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300">
            <button
               onClick={() => setShowModal(true)}
              className="flex items-center gap-2 mb-3 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105"
            >
              <Plus size={20} />
              <span>Set Bill Range</span>
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
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {billRanges.map((range, index) => (
                      <tr
                        key={range.id}
                        onClick={() => navigate(`/billprice/${bill_id}/${range.id}`)}
                        className="cursor-pointer hover:bg-purple-100 dark:hover:bg-gray-700 transition"
                      >
                        <td className="px-4 py-4">{index + 1}</td>
                        <td className="px-4 py-4">{range.fromRange}</td>
                        <td className="px-4 py-4">{range.toRange}</td>
                        <td className="px-4 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                    e.stopPropagation();
                                setSelectedRange(range); // store the range to edit
                                setShowEditModal(true);
                              }}
                              className="text-green-600 hover:text-green-900"
                              title="Edit"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                                onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(range);
                                }}
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
            <CreateBillRange
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={async (formData) => {
                  try {
                    const response = await api.post("/billranges", {
                      ...formData,
                      bill_id,
                    });
                    if (response.data.success) {
                      toast.success("Bill range added successfully!");
                      setShowModal(false);
                      loadBillRanges();
                    } else {
                      toast.error("Failed to add bill range.");
                    }
                  } catch (err) {
                    console.error("Error adding bill range:", err);
                    toast.error("Error adding bill range.");
                  }
                }}
              />

              {/* Edit Modal */}
              {showEditModal && (
                <EditBillRange
                  range={selectedRange}
                  onClose={() => setShowEditModal(false)}
                  onUpdated={() => {
                    toast.success("Bill range updated!");
                    loadBillRanges();
                  }}
                />
              )}
              {showDeleteModal && deletingBillRange && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                      Confirm Deletion
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Are you sure you want to delete this bill range?
                    </p>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={handleCancelDelete}
                        className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            <ToastContainer position="top-center" autoClose={3000} />
          </div>
    
  );
}
