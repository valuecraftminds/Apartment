//UpdateBillPayments.jsx
import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Building, Home, Receipt } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function UpdateBillPayments({ payment, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    additionalAmount: 0, // Amount being paid now (not cumulative)
    payment_status: 'Pending',
    paid_at: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Determine if this is a measurable bill
  const isMeasurableBill = payment?.generateMeasurable_bills_id ? true : false;
  
  useEffect(() => {
    if (payment) {
      setFormData({
        additionalAmount: 0, // Start with 0 additional payment
        payment_status: payment.payment_status || 'Pending',
        paid_at: payment.paid_at ? new Date(payment.paid_at).toISOString().split('T')[0] : ''
      });
    }
  }, [payment, isMeasurableBill]);

  if (!payment) return null;

  // Calculate total amount based on bill type
  const getTotalAmount = () => {
    if (isMeasurableBill) {
      // For measurable bills, use generated_total_amount if available, otherwise unitPrice
      return parseFloat(payment.generated_total_amount) || parseFloat(payment.unitPrice) || 0;
    } else {
      // For shared bills, use unitPrice
      return parseFloat(payment.unitPrice) || 0;
    }
  };

  const totalAmount = getTotalAmount();
  const currentPaidAmount = parseFloat(payment.paidAmount) || 0;
  const currentPendingAmount = parseFloat(payment.pendingAmount) || 0;
  
  // Calculate new totals based on additional payment
  const newPaidAmount = currentPaidAmount + parseFloat(formData.additionalAmount || 0);
  const newPendingAmount = totalAmount - newPaidAmount;

  // Helper function to format currency safely
  const formatCurrency = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const additionalAmount = parseFloat(formData.additionalAmount || 0);
    
    if (additionalAmount < 0) {
      toast.error('Payment amount cannot be negative');
      return;
    }

    if (additionalAmount > currentPendingAmount) {
      toast.error(`Payment amount cannot exceed pending amount of $${formatCurrency(currentPendingAmount)}`);
      return;
    }

    // Calculate new payment status
    let newStatus = formData.payment_status;
    if (newPaidAmount >= totalAmount) {
      newStatus = 'Paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'Partial';
    } else {
      newStatus = 'Pending';
    }

    try {
      setLoading(true);
      
      // Prepare the data for backend
      // We send the TOTAL paid amount (cumulative), not just additional
      const updateData = {
        payment_status: newStatus,
        paidAmount: newPaidAmount // Send cumulative total
      };

      // Only include paid_at if it's being marked as paid now
      if (newStatus === 'Paid' && formData.paid_at) {
        updateData.paid_at = formData.paid_at;
      } else if (newStatus === 'Paid' && !formData.paid_at) {
        // If marking as paid without date, use current date
        updateData.paid_at = new Date().toISOString().split('T')[0];
      }

      console.log('Sending update data:', updateData); // Debug log
      console.log('Current paid:', currentPaidAmount);
      console.log('Additional:', additionalAmount);
      console.log('New total paid:', newPaidAmount);

      const response = await api.patch(`/bill-payments/${payment.id}/status`, updateData);
      
      if (response.data.success) {
        toast.success('Payment updated successfully');
        onUpdate(response.data.data);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to update payment: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdditionalAmountChange = (value) => {
    const additionalAmount = parseFloat(value) || 0;
    
    // Ensure additional amount doesn't exceed pending amount
    const maxAdditional = currentPendingAmount;
    const safeAdditional = Math.min(additionalAmount, maxAdditional);
    
    // Calculate new status
    const newPaidTotal = currentPaidAmount + safeAdditional;
    let newStatus = 'Pending';
    if (newPaidTotal >= totalAmount) {
      newStatus = 'Paid';
    } else if (newPaidTotal > 0) {
      newStatus = 'Partial';
    }

    setFormData(prev => ({
      ...prev,
      additionalAmount: safeAdditional,
      payment_status: newStatus
    }));
  };

  // Calculate if this will fully pay the bill
  const willFullyPay = newPendingAmount <= 0.01; // Small tolerance for floating point

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Receipt className="text-purple-600 dark:text-purple-400" size={24} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update Payment
            </h3>
            {isMeasurableBill && (
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded-full">
                Measurable
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Payment Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Payment Details</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bill:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {payment.bill_name} ({payment.billtype})
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Location:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {payment.apartment_name} - Floor {payment.floor_id} - House {payment.house_number}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Period:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {payment.month} {payment.year}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Bill Type:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {isMeasurableBill ? 'Measurable Bill' : 'Shared Bill'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Amounts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-green-800 dark:text-green-300 text-sm font-medium">Current Paid</div>
                <div className="text-green-600 dark:text-green-400 text-lg font-bold">
                  ${formatCurrency(currentPaidAmount)}
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                <div className="text-red-800 dark:text-red-300 text-sm font-medium">Current Pending</div>
                <div className="text-red-600 dark:text-red-400 text-lg font-bold">
                  ${formatCurrency(currentPendingAmount)}
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className={`rounded-lg p-3 ${isMeasurableBill ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
              <div className={`text-sm font-medium ${isMeasurableBill ? 'text-blue-800 dark:text-blue-300' : 'text-purple-800 dark:text-purple-300'}`}>
                {isMeasurableBill ? 'Total Amount' : 'Unit Price'}
              </div>
              <div className={`text-lg font-bold ${isMeasurableBill ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                ${formatCurrency(totalAmount)}
              </div>
              {isMeasurableBill && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Measurable Bill - Based on consumption
                </p>
              )}
            </div>

            {/* Additional Payment Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional Payment Amount ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={currentPendingAmount}
                  value={formData.additionalAmount}
                  onChange={(e) => handleAdditionalAmountChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-gray-700 bg-gray-100"
                  required
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <p className="text-gray-500 dark:text-gray-400">
                  Maximum: ${formatCurrency(currentPendingAmount)}
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  ${formatCurrency(formData.additionalAmount)} being paid now
                </p>
              </div>
            </div>

            {/* New Amounts Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-green-800 dark:text-green-300 text-sm font-medium">New Total Paid</div>
                <div className="text-green-600 dark:text-green-400 text-lg font-bold">
                  ${formatCurrency(newPaidAmount)}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  (+${formatCurrency(formData.additionalAmount)})
                </p>
              </div>
              
              <div className={`rounded-lg p-3 ${
                newPendingAmount > 0 && newPendingAmount < currentPendingAmount 
                  ? 'bg-orange-50 dark:bg-orange-900/20' 
                  : willFullyPay 
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className={`text-sm font-medium ${
                  newPendingAmount > 0 && newPendingAmount < currentPendingAmount 
                    ? 'text-orange-800 dark:text-orange-300' 
                    : willFullyPay 
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-red-800 dark:text-red-300'
                }`}>
                  New Pending Amount
                </div>
                <div className={`text-lg font-bold ${
                  newPendingAmount > 0 && newPendingAmount < currentPendingAmount 
                    ? 'text-orange-600 dark:text-orange-400' 
                    : willFullyPay 
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                }`}>
                  ${formatCurrency(newPendingAmount)}
                </div>
                {willFullyPay ? (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Bill will be fully paid! ✓
                  </p>
                ) : newPendingAmount < currentPendingAmount ? (
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    ${formatCurrency(currentPendingAmount - newPendingAmount)} will be paid
                  </p>
                ) : null}
              </div>
            </div>

            {/* Payment Status Display */}
            <div className="rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
              <div className="text-gray-800 dark:text-gray-300 text-sm font-medium">New Payment Status</div>
              <div className={`text-lg font-bold ${
                formData.payment_status === 'Paid' 
                  ? 'text-green-600 dark:text-green-400'
                  : formData.payment_status === 'Partial'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-yellow-600 dark:text-yellow-400'
              }`}>
                {formData.payment_status}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will update automatically based on payment amount
              </p>
            </div>

            {/* Payment Date */}
            {(formData.payment_status === 'Paid' || willFullyPay) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="date"
                    value={formData.paid_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, paid_at: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border  text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700"
                    required={formData.payment_status === 'Paid' || willFullyPay}
                  />
                </div>
                {!formData.paid_at && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    If no date is selected, current date will be used
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || formData.additionalAmount <= 0}
                className="px-6 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <DollarSign size={16} />
                    <span>Pay ${formatCurrency(formData.additionalAmount)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};