import React, { useState, useEffect } from 'react';
import { X, Receipt, Check, Search, Loader, DollarSign, FileText, BarChart } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function UserBillModal({ user, onClose, onAssignSuccess }) {
  const [allBills, setAllBills] = useState([]);
  const [assignedBills, setAssignedBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBills, setSelectedBills] = useState(new Set());

  // Load bills and current assignments
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load all available bills
        const billsResponse = await api.get('/bills');
        if (billsResponse.data.success) {
          // Filter bills to only show "Measurable" type
          const measurableBills = (billsResponse.data.data || []).filter(
            bill => bill.billtype?.toLowerCase() === 'measurable'
          );
          setAllBills(measurableBills);
        }

        // Load user's current bill assignments
        const assignmentsResponse = await api.get(`/user-bills/users/${user.id}/bills`);
        if (assignmentsResponse.data.success) {
          const assignedBillsData = assignmentsResponse.data.data || [];
          // Filter to only show measurable bills in assignments
          const measurableAssignedBills = assignedBillsData.filter(
            bill => bill.billtype?.toLowerCase() === 'measurable'
          );
          setAssignedBills(measurableAssignedBills);
          
          // Pre-select currently assigned measurable bills
          const assignedIds = new Set(measurableAssignedBills.map(bill => bill.id));
          setSelectedBills(assignedIds);
        }
      } catch (error) {
        console.error('Error loading bill data:', error);
        toast.error('Failed to load bill data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  // Filter bills based on search term - only measurable bills
  const filteredBills = allBills.filter(bill =>
    bill.bill_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Check if bill is assigned to user
  const isBillAssigned = (billId) => {
    return assignedBills.some(bill => bill.id === billId);
  };

  // Check if bill is selected
  const isBillSelected = (billId) => {
    return selectedBills.has(billId);
  };

  // Toggle bill selection
  const toggleBillSelection = (billId) => {
    setSelectedBills(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(billId)) {
        newSelection.delete(billId);
      } else {
        newSelection.add(billId);
      }
      return newSelection;
    });
  };

  // Select all bills
  const selectAllBills = () => {
    const allIds = new Set(allBills.map(bill => bill.id));
    setSelectedBills(allIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedBills(new Set());
  };

  // Save assignments
  const saveAssignments = async () => {
    try {
      setSaving(true);
      const billIds = Array.from(selectedBills);
      
      await api.post(`/user-bills/users/${user.id}/bills`, {
        bill_ids: billIds
      });
      
      toast.success('Measurable bills assigned successfully!');
      onAssignSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error assigning bills:', error);
      toast.error(error.response?.data?.message || 'Failed to assign bills');
    } finally {
      setSaving(false);
    }
  };

  // Get assigned bill info
  const getAssignedBillInfo = (billId) => {
    return assignedBills.find(bill => bill.id === billId);
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <>
      {/* Search and Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search measurable bills by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={selectAllBills}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearAllSelections}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader size={32} className="animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600 dark:text-gray-300">Loading measurable bills...</p>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <BarChart size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No measurable bills found</p>
            <p className="text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'No measurable bills available to assign'}
            </p>
            <p className="text-xs mt-2 text-gray-400">Only bills with type "Measurable" are shown here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {filteredBills.map((bill) => {
              const isSelected = isBillSelected(bill.id);
              const isAssigned = isBillAssigned(bill.id);
              const assignedInfo = getAssignedBillInfo(bill.id);

              return (
                <div
                  key={bill.id}
                  className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 ring-2 ring-purple-500/20'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-purple-300 dark:hover:border-purple-400'
                  }`}
                  onClick={() => toggleBillSelection(bill.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Receipt size={16} className="text-gray-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {bill.bill_name}
                        </h3>
                        {isAssigned && (
                          <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                            Currently Assigned
                          </span>
                        )}
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          Measurable
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <FileText size={14} />
                        <span className="capitalize">{bill.billtype}</span>
                        {bill.is_metered && (
                          <span className="ml-2 px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                            Metered
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>Created: {formatDate(bill.created_at)}</span>                        
                      </div>

                      {assignedInfo && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Assigned on: {formatDate(assignedInfo.assigned_at || assignedInfo.created_at)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center ml-4">
                      {isSelected ? (
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 border-2 border-gray-300 dark:border-gray-500 rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 dark:bg-gray-750 rounded-b-xl">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {selectedBills.size} measurable bill(s) selected
          {assignedBills.length > 0 && (
            <span> • {assignedBills.length} currently assigned</span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={saveAssignments}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && <Loader size={16} className="animate-spin" />}
            <span>{saving ? 'Saving...' : 'Save Assignments'}</span>
          </button>
        </div>
      </div>
    </>
  );
}