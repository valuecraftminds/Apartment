// components/HoldComplaintModal.jsx
import React, { useState } from 'react';
import { Calendar, AlertCircle, X, Wrench, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function HoldComplaintModal({ 
  complaint, 
  onClose, 
  onHoldSuccess 
}) {
  const [reason, setReason] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedReasonType, setSelectedReasonType] = useState('');
  const { auth } = useContext(AuthContext);
  
  const commonReasons = [
    'Waiting for parts/equipment',
    'Need specialist assistance',
    'Material shortage',
    'Weather conditions',
    'Safety concerns',
    'Access issues',
    'Waiting for approval',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a reason for placing the complaint on hold');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post(`/complaints/${complaint.id}/hold`, {
        reason: reason,
        expected_resolution_date: expectedDate || null
      }, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`
        }
      });

      if (response.data.success) {
        toast.success('Complaint placed on hold successfully');
        onHoldSuccess();
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to place complaint on hold');
      }
    } catch (error) {
      console.error('Error holding complaint:', error);
      toast.error(error.response?.data?.message || 'Failed to place complaint on hold');
    } finally {
      setLoading(false);
    }
  };

  const handleReasonSelect = (reasonText) => {
    setSelectedReasonType(reasonText);
    if (reasonText === 'Other') {
      setReason('');
    } else {
      setReason(reasonText);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center mb-4">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg mr-3">
            <AlertCircle size={24} className="text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Hold Complaint
          </h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Complaint: <span className="font-semibold">{complaint.complaint_number}</span>
        </p>

        <form onSubmit={handleSubmit}>
          {/* Common Reasons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Common Reasons
            </label>
            <div className="grid grid-cols-2 gap-2">
              {commonReasons.map((reasonType) => (
                <button
                  key={reasonType}
                  type="button"
                  onClick={() => handleReasonSelect(reasonType)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    selectedReasonType === reasonType
                      ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-700'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                  }`}
                >
                  {reasonType}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Details */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hold Reason Details
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (e.target.value !== selectedReasonType) {
                  setSelectedReasonType('');
                }
              }}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Describe why you need to hold this complaint..."
              required
            />
          </div>

          {/* Expected Resolution Date */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expected Resolution Date (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                min={minDate}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              When do you expect to resume work on this complaint?
            </p>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle size={18} className="text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                <span className="font-semibold">Note:</span> The complaint timer will be paused while on hold. 
                You will need to resume the complaint before completing the work.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <AlertCircle size={18} />
                  Place on Hold
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}