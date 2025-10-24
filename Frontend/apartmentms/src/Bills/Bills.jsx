import React, { useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar';
import {Edit, Image, Loader, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';
import CreateBillType from '../Bills/CreateBillType';
import EditBillType from '../Bills/EditBillType';

export default function Bills() {
    const [loadingBills,setLoadingBills] = useState(false);
    const [error, setError] = useState(null);
    const [bills,setBills] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedBillType, setSelectedBillType] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingBill, setDeletingBill] = useState(null);

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

    //create Bill Type
    const handleAddNew = () =>{
        setShowCreateModal(true);
    }

    const handleCloseModal = () => {
        setShowCreateModal(false);
    };

    const handleCreateBillType = () => {
        loadBills();
        setShowCreateModal(false);
        toast.success('Bill type Created Successfully');
    }

    // //Update house types
    const handleEdit = (bills) => {
        setSelectedBillType(bills);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedBillType(null);
    };

    const handleBillTypeUpdated = () => {
        loadBills();
        setShowEditModal(false);
        toast.success('Bill Type updated successfully!');
    };

    //Delete bill
  const handleDeleteClick = (bill) => {
    setDeletingBill(bill);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!deletingBill) return;
      await api.delete(`/bills/${deletingBill.id}`);
      toast.success('Bill type deleted successfully');
      setShowDeleteModal(false);
      setDeletingBill(null);
      loadBills();
    } catch (err) {
      console.error('Delete bill type error:', err);
      toast.error('Failed to delete bill type');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingBill(null);
  };

  return (
    <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 text-gray-700 dark:text-gray-300'>
        <button 
        onClick={handleAddNew}
        className='flex items-center gap-2 mb-3 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105'>
            <Plus size={20} />
            <span>New Bill Type</span>
        </button>
        {loadingBills ? (
            <div className="flex justify-center items-center py-12">
                <Loader size={32} className="animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600 dark:text-gray-300">Loading Bill types...</span>
            </div>
            ) : error ? (
            <div className="text-center py-12 text-red-600 dark:text-red-400">
                {error}
                <button
                    onClick={loadingBills}
                    className="ml-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    Retry
                </button>
            </div>
            ) : bills.length === 0 ? (
            <div className="text-center py-12 text-gray-600 dark:text-gray-300">
                <Image size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg">No bill types found</p>
                <p className="text-sm">Get started by adding bill types</p>
            </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {bills.map((bills,index) => (
                            <tr key={bills.id}>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                    {index + 1}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {bills.bill_name}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(bills);
                                            }}
                                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                            title="Edit"
                                            >
                                            <Edit size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(bills);
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
        {showCreateModal && (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    >
                    ✖
                    </button>
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Add New Bill Type
                    </h2>
                    <CreateBillType
                        onClose={handleCloseModal} 
                        onCreated={handleCreateBillType}
                        // apartment_id={apartment_id}
                    />
                </div>
            </div>
        )}
        {showEditModal && selectedBillType && (
            <div className="fixed inset-0 bg-white/0 backdrop-blur-lg flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <button
                    onClick={handleCloseEditModal}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                >
                    ✖
                </button>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Update the Bill Type
                </h2>
                <EditBillType
                    onClose={handleCloseEditModal}
                    onUpdated={handleBillTypeUpdated}
                    bills={selectedBillType}
                />
                </div>
            </div>
        )}
        {showDeleteModal && deletingBill && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{deletingBill.bill_name}"?
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
  )
}
