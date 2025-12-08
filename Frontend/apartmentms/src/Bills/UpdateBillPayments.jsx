// import React, { useState, useEffect } from 'react';
// import { X, DollarSign, Calendar, Building, Home, Receipt } from 'lucide-react';
// import api from '../api/axios';
// import { toast } from 'react-toastify';

// export default function UpdateBillPayments({ payment, onClose, onUpdate }) {
//   const [formData, setFormData] = useState({
//     paidAmount: 0,
//     payment_status: 'Pending',
//     paid_at: ''
//   });
//   const [loading, setLoading] = useState(false);
  
//   // Determine if this is a measurable bill
//   const isMeasurableBill = payment?.generateMeasurable_bills_id ? true : false;
  
//   useEffect(() => {
//     if (payment) {
//       // For measurable bills, use generated_total_amount if available
//       const totalAmount = isMeasurableBill 
//         ? (parseFloat(payment.generated_total_amount) || parseFloat(payment.unitPrice) || 0)
//         : (parseFloat(payment.unitPrice) || 0);
      
//       const paidAmount = parseFloat(payment.paidAmount) || 0;
//       const pendingAmount = parseFloat(payment.pendingAmount) || 0;
      
//       setFormData({
//         paidAmount: paidAmount,
//         payment_status: payment.payment_status || 'Pending',
//         paid_at: payment.paid_at ? new Date(payment.paid_at).toISOString().split('T')[0] : ''
//       });
//     }
//   }, [payment, isMeasurableBill]);

//   if (!payment) return null;

//   // Calculate total amount based on bill type
//   const getTotalAmount = () => {
//     if (isMeasurableBill) {
//       // For measurable bills, use generated_total_amount if available, otherwise unitPrice
//       return parseFloat(payment.generated_total_amount) || parseFloat(payment.unitPrice) || 0;
//     } else {
//       // For shared bills, use unitPrice
//       return parseFloat(payment.unitPrice) || 0;
//     }
//   };

//   const totalAmount = getTotalAmount();
//   const currentPaidAmount = parseFloat(payment.paidAmount) || 0;
//   const currentPendingAmount = parseFloat(payment.pendingAmount) || 0;
  
//   // Calculate new pending amount
//   const newPendingAmount = totalAmount - formData.paidAmount;

//   // Helper function to format currency safely
//   const formatCurrency = (value) => {
//     const numValue = typeof value === 'string' ? parseFloat(value) : value;
//     return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
    
//   //   if (formData.paidAmount > totalAmount) {
//   //     toast.error('Paid amount cannot exceed total amount');
//   //     return;
//   //   }

//   //   if (formData.paidAmount < 0) {
//   //     toast.error('Paid amount cannot be negative');
//   //     return;
//   //   }

//   //   try {
//   //     setLoading(true);
      
//   //     const updateData = {
//   //       paidAmount: parseFloat(formData.paidAmount),
//   //       payment_status: formData.payment_status,
//   //       paid_at: formData.payment_status === 'Paid' && formData.paid_at ? formData.paid_at : null
//   //     };

//   //     const response = await api.patch(`/bill-payments/${payment.id}/status`, updateData);
      
//   //     if (response.data.success) {
//   //       toast.success('Payment updated successfully');
//   //       onUpdate(response.data.data);
//   //     }
//   //   } catch (error) {
//   //     console.error('Error updating payment:', error);
//   //     toast.error('Failed to update payment');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (formData.paidAmount > totalAmount) {
//       toast.error('Paid amount cannot exceed total amount');
//       return;
//     }

//     if (formData.paidAmount < 0) {
//       toast.error('Paid amount cannot be negative');
//       return;
//     }

//     try {
//       setLoading(true);
      
//       // Prepare the data exactly as backend expects
//       const updateData = {
//         payment_status: formData.payment_status,
//         paidAmount: parseFloat(formData.paidAmount)
//       };

//       // Only include paid_at if it's a paid status and has a value
//       if (formData.payment_status === 'Paid' && formData.paid_at) {
//         updateData.paid_at = formData.paid_at;
//       }

//       console.log('Sending update data:', updateData); // Debug log

//       const response = await api.patch(`/bill-payments/${payment.id}/status`, updateData);
      
//       if (response.data.success) {
//         toast.success('Payment updated successfully');
//         onUpdate(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error updating payment:', error);
//       console.error('Error details:', error.response?.data); // Add this for more details
//       toast.error(`Failed to update payment: ${error.response?.data?.message || error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePaidAmountChange = (value) => {
//     const paidAmount = parseFloat(value) || 0;
    
//     // Determine status based on amounts
//     let newStatus = 'Pending';
//     if (paidAmount >= totalAmount) {
//       newStatus = 'Paid';
//     } else if (paidAmount > 0) {
//       newStatus = 'Partial';
//     }

//     setFormData(prev => ({
//       ...prev,
//       paidAmount: paidAmount,
//       payment_status: newStatus
//     }));
//   };

//   return (
//     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
//           <div className="flex items-center space-x-2">
//             <Receipt className="text-purple-600 dark:text-purple-400" size={24} />
//             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//               Update Payment
//             </h3>
//             {isMeasurableBill && (
//               <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded-full">
//                 Measurable
//               </span>
//             )}
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Payment Information */}
//           <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
//             <h4 className="font-medium text-gray-900 dark:text-white mb-3">Payment Details</h4>
            
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Bill:</span>
//                 <span className="font-medium text-gray-900 dark:text-white">
//                   {payment.bill_name} ({payment.billtype})
//                 </span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Location:</span>
//                 <span className="font-medium text-gray-900 dark:text-white">
//                   {payment.apartment_name} - Floor {payment.floor_id} - House {payment.house_number}
//                 </span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Period:</span>
//                 <span className="font-medium text-gray-900 dark:text-white">
//                   {payment.month} {payment.year}
//                 </span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-gray-600 dark:text-gray-400">Bill Type:</span>
//                 <span className="font-medium text-gray-900 dark:text-white">
//                   {isMeasurableBill ? 'Measurable Bill' : 'Shared Bill'}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Current Amounts */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
//                 <div className="text-green-800 dark:text-green-300 text-sm font-medium">Current Paid</div>
//                 <div className="text-green-600 dark:text-green-400 text-lg font-bold">
//                   ${formatCurrency(currentPaidAmount)}
//                 </div>
//               </div>
              
//               <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
//                 <div className="text-red-800 dark:text-red-300 text-sm font-medium">Current Pending</div>
//                 <div className="text-red-600 dark:text-red-400 text-lg font-bold">
//                   ${formatCurrency(currentPendingAmount)}
//                 </div>
//               </div>
//             </div>

//             {/* Total Amount */}
//             <div className={`rounded-lg p-3 ${isMeasurableBill ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-purple-50 dark:bg-purple-900/20'}`}>
//               <div className={`text-sm font-medium ${isMeasurableBill ? 'text-blue-800 dark:text-blue-300' : 'text-purple-800 dark:text-purple-300'}`}>
//                 {isMeasurableBill ? 'Total Amount' : 'Unit Price'}
//               </div>
//               <div className={`text-lg font-bold ${isMeasurableBill ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
//                 ${formatCurrency(totalAmount)}
//               </div>
//               {isMeasurableBill && (
//                 <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
//                   Measurable Bill - Based on consumption
//                 </p>
//               )}
//             </div>

//             {/* Paid Amount Input */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Paid Amount ($)
//               </label>
//               <div className="relative">
//                 <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="0"
//                   max={totalAmount}
//                   value={formData.paidAmount}
//                   onChange={(e) => handlePaidAmountChange(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-gray-700 bg-gray-100"
//                   required
//                 />
//               </div>
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Maximum: ${formatCurrency(totalAmount)}
//               </p>
//             </div>

//             {/* New Pending Amount Display */}
//             <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
//               <div className="text-orange-800 dark:text-orange-300 text-sm font-medium">New Pending Amount</div>
//               <div className={`text-lg font-bold ${
//                 newPendingAmount > 0 
//                   ? 'text-orange-600 dark:text-orange-400' 
//                   : 'text-green-600 dark:text-green-400'
//               }`}>
//                 ${formatCurrency(newPendingAmount)}
//               </div>
//               {newPendingAmount <= 0 && (
//                 <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                   Payment will be fully paid!
//                 </p>
//               )}
//             </div>

//             {/* Payment Status */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Payment Status
//               </label>
//               <select
//                 value={formData.payment_status}
//                 onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value }))}
//                 className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-gray-700 bg-gray-100"
//               >
//                 <option value="Pending">Pending</option>
//                 <option value="Partial">Partial</option>
//                 <option value="Paid">Paid</option>
//                 <option value="Failed">Failed</option>
//                 <option value="Refunded">Refunded</option>
//               </select>
//             </div>

//             {/* Payment Date */}
//             {formData.payment_status === 'Paid' && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Payment Date
//                 </label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//                   <input
//                     type="date"
//                     value={formData.paid_at}
//                     onChange={(e) => setFormData(prev => ({ ...prev, paid_at: e.target.value }))}
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
//                     required
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-6 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
//               >
//                 {loading ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     <span>Updating...</span>
//                   </>
//                 ) : (
//                   <span>Update Payment</span>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };
import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Building, Home, Receipt } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function UpdateBillPayments({ payment, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    paidAmount: 0,
    payment_status: 'Pending',
    paid_at: ''
  });
  const [loading, setLoading] = useState(false);
  
  // Determine if this is a measurable bill
  const isMeasurableBill = payment?.generateMeasurable_bills_id ? true : false;
  
  useEffect(() => {
    if (payment) {
      // For measurable bills, use generated_total_amount if available
      const totalAmount = isMeasurableBill 
        ? (parseFloat(payment.generated_total_amount) || parseFloat(payment.unitPrice) || 0)
        : (parseFloat(payment.unitPrice) || 0);
      
      const paidAmount = parseFloat(payment.paidAmount) || 0;
      const pendingAmount = parseFloat(payment.pendingAmount) || 0;
      
      setFormData({
        paidAmount: paidAmount, // This is the cumulative paid amount
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
  
  // Calculate new pending amount (based on cumulative paid amount)
  const newPendingAmount = totalAmount - formData.paidAmount;

  // Helper function to format currency safely
  const formatCurrency = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.paidAmount > totalAmount) {
      toast.error('Paid amount cannot exceed total amount');
      return;
    }

    if (formData.paidAmount < 0) {
      toast.error('Paid amount cannot be negative');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the data exactly as backend expects
      const updateData = {
        payment_status: formData.payment_status,
        paidAmount: parseFloat(formData.paidAmount) // This should be cumulative total
      };

      // Only include paid_at if it's a paid status and has a value
      if (formData.payment_status === 'Paid' && formData.paid_at) {
        updateData.paid_at = formData.paid_at;
      }

      console.log('Sending update data:', updateData); // Debug log

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

  const handlePaidAmountChange = (value) => {
    const paidAmount = parseFloat(value) || 0;
    
    // Determine status based on cumulative amounts
    let newStatus = 'Pending';
    if (paidAmount >= totalAmount) {
      newStatus = 'Paid';
    } else if (paidAmount > 0) {
      newStatus = 'Partial';
    }

    setFormData(prev => ({
      ...prev,
      paidAmount: paidAmount,
      payment_status: newStatus
    }));
  };

  // Calculate additional amount being paid now
  const getAdditionalAmount = () => {
    return parseFloat(formData.paidAmount) - currentPaidAmount;
  };

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

            {/* Additional Payment Information */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <div className="text-blue-800 dark:text-blue-300 text-sm font-medium">Additional Payment</div>
              <div className="text-blue-600 dark:text-blue-400 text-lg font-bold">
                +${formatCurrency(getAdditionalAmount())}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Amount being added to existing payment
              </p>
            </div>

            {/* Paid Amount Input (Cumulative) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Paid Amount ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={totalAmount}
                  value={formData.paidAmount}
                  onChange={(e) => handlePaidAmountChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-gray-700 bg-gray-100"
                  required
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <p className="text-gray-500 dark:text-gray-400">
                  Previously paid: ${formatCurrency(currentPaidAmount)}
                </p>
                <p className="text-blue-600 dark:text-blue-400">
                  +${formatCurrency(getAdditionalAmount())} additional
                </p>
              </div>
            </div>

            {/* New Amounts Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-green-800 dark:text-green-300 text-sm font-medium">New Total Paid</div>
                <div className="text-green-600 dark:text-green-400 text-lg font-bold">
                  ${formatCurrency(formData.paidAmount)}
                </div>
              </div>
              
              <div className={`rounded-lg p-3 ${newPendingAmount > 0 ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                <div className={`text-sm font-medium ${newPendingAmount > 0 ? 'text-orange-800 dark:text-orange-300' : 'text-green-800 dark:text-green-300'}`}>
                  New Pending
                </div>
                <div className={`text-lg font-bold ${newPendingAmount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                  ${formatCurrency(newPendingAmount)}
                </div>
                {newPendingAmount <= 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Payment will be fully paid!
                  </p>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Status
              </label>
              <select
                value={formData.payment_status}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value }))}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white text-gray-700 bg-gray-100"
              >
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>

            {/* Payment Date */}
            {formData.payment_status === 'Paid' && (
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
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
                disabled={loading}
                className="px-6 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Payment</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};