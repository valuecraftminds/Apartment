import React from 'react';
import { X, Building, Home, Calendar, DollarSign, Receipt, Users, Layers, MapPin } from 'lucide-react';

export default function ViewSharedValueBillDetails({ 
    bill, 
    onClose,
    getApartmentName,
    getFloorName,
    getHouseName,
    getLocationScope,
    getLocationDisplay 
}) {
    if (!bill) return null;

    const formatCurrency = (value) => {
        if (!value) return '0.00';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(numValue) ? '0.00' : numValue.toFixed(2);
    };

    const getStatusBadgeColor = (scope) => {
        switch (scope) {
            case 'House': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
            case 'Floor': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
            case 'Apartment': return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <div className="flex items-center space-x-2">
                        <Receipt className="text-purple-600 dark:text-purple-400" size={24} />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Bill Details
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <Receipt size={16} className="mr-2" />
                            Basic Information
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Bill Name
                                </label>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {bill.bill_name || 'Unnamed Bill'}
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Bill Type
                                </label>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    {bill.billtype || 'N/A'}
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    <Calendar size={14} className="inline mr-1" />
                                    Period
                                </label>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {bill.month} {bill.year}
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Scope
                                </label>
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(getLocationScope(bill))}`}>
                                    {getLocationScope(bill)} Level
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <MapPin size={16} className="mr-2" />
                            Location Details
                        </h4>
                        
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <Building size={14} className="text-gray-500 dark:text-gray-400" />
                                <div className="flex-1">
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Apartment
                                    </label>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {getApartmentName(bill.apartment_id)}
                                    </p>
                                </div>
                            </div>
                            
                            {bill.floor_id && (
                                <div className="flex items-center space-x-2">
                                    <Layers size={14} className="text-gray-500 dark:text-gray-400" />
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            Floor
                                        </label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {getFloorName(bill.floor_id)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {bill.house_id && (
                                <div className="flex items-center space-x-2">
                                    <Home size={14} className="text-gray-500 dark:text-gray-400" />
                                    <div className="flex-1">
                                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                            House
                                        </label>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {getHouseName(bill.house_id)}
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Full Location Path
                                </label>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                    {getLocationDisplay(bill)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Details */}
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <DollarSign size={16} className="mr-2" />
                            Financial Details
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bill.totalAmount && (
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Total Amount
                                    </label>
                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                        ${formatCurrency(bill.totalAmount)}
                                    </p>
                                </div>
                            )}
                            
                            {bill.unitPrice && (
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Unit Price
                                    </label>
                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        ${formatCurrency(bill.unitPrice)}
                                    </p>
                                </div>
                            )}
                            
                            {bill.assignedHouses && (
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        <Users size={12} className="inline mr-1" />
                                        Assigned Houses
                                    </label>
                                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                        {bill.assignedHouses}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            Additional Information
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Generated Date
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {new Date(bill.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            
                            <div>
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Generated Time
                                </label>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {new Date(bill.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                            
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    Status
                                </label>
                                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                    bill.totalAmount 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-100'
                                }`}>
                                    {bill.totalAmount ? 'Calculated' : 'Generated'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}