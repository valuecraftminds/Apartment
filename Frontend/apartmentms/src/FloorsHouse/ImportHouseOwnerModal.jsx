// components/ImportHouseOwnerModal.jsx
import React, { useState } from 'react';
import { Upload, Download, X, CheckCircle, AlertCircle, FileSpreadsheet, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../api/axios';

export default function ImportHouseOwnerModal({ 
    isOpen, 
    onClose, 
    onImportSuccess, 
    apartment_id, 
    floor_id,
    house_id 
}) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState(null);
    const [selectedApartment, setSelectedApartment] = useState(apartment_id || '');

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            validateAndSetFile(droppedFile);
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (!allowedTypes.includes(selectedFile.type)) {
            toast.error('Please select an Excel file (.xlsx, .xls, .csv)');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        setResults(null);
    };

    const downloadTemplate = () => {
        // Create template content
        const templateContent = `name,nic,occupation,country,mobile,email,occupied_way
John Doe,123456789V,Software Engineer,Sri Lanka,+94 771234567,john.doe@example.com,own

Instructions:
1. Fill in the house owner details in the second row
2. Keep the column headers as shown in the first row
3. Save the file and upload it here
4. The system will extract the information automatically

Important:
- Fill only one row (single house owner)
- Email is required for verification
- Mobile should include country code
- occupied_way can be "own" or "For rent"`;

        // Create a Blob with the template content
        const blob = new Blob([templateContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'house_owner_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Template downloaded successfully!');
    };

    const handleImport = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        if (!apartment_id) {
            toast.error('Apartment information is missing');
            return;
        }

        setImporting(true);
        const formData = new FormData();
        formData.append('excelFile', file);
        formData.append('apartment_id', apartment_id);
        
        if (house_id) {
            formData.append('house_id', house_id);
        }

        try {
            const response = await api.post('/houseowner/import-from-excel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setResults(response.data.data);
                
                if (onImportSuccess) {
                    onImportSuccess(response.data.data.houseOwner);
                }
                
                toast.success('House owner imported successfully!');
            }
            
        } catch (error) {
            console.error('Import error:', error);
            toast.error(error.response?.data?.message || 'Failed to import house owner');
        } finally {
            setImporting(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setResults(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Import House Owner from Excel
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {!results ? (
                        <div className="space-y-6">
                            {/* Context Information */}
                            {/* <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                                    Importing for:
                                </h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-blue-600 dark:text-blue-400">Apartment:</span>
                                        <p className="font-medium text-blue-800 dark:text-blue-300">
                                            {apartment_id ? `Apartment ID: ${apartment_id.na}` : 'Not specified'}
                                        </p>
                                    </div>
                                    {house_id && (
                                        <div>
                                            <span className="text-blue-600 dark:text-blue-400">House:</span>
                                            <p className="font-medium text-blue-800 dark:text-blue-300">
                                                House ID: {house_id}
                                            </p>
                                        </div>
                                    )}
                                    {floor_id && (
                                        <div>
                                            <span className="text-blue-600 dark:text-blue-400">Floor:</span>
                                            <p className="font-medium text-blue-800 dark:text-blue-300">
                                                Floor ID: {floor_id}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div> */}

                            {/* Download Template */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-blue-800 dark:text-blue-300">
                                            Download Template
                                        </h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                                            Download our template to ensure proper formatting
                                        </p>
                                    </div>
                                    <button
                                        onClick={downloadTemplate}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Download size={16} />
                                        Download Template
                                    </button>
                                </div>
                            </div>

                            {/* File Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                    isDragging
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <div className="space-y-2">
                                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                        {file ? file.name : 'Drop your Excel file here'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        or{' '}
                                        <label className="text-purple-600 hover:text-purple-700 cursor-pointer">
                                            browse files
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".xlsx,.xls,.csv"
                                                onChange={handleFileSelect}
                                            />
                                        </label>
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Supports .xlsx, .xls, .csv files (max 10MB)
                                    </p>
                                </div>

                                {/* Required Format Info */}
                                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-left">
                                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                                        File Format Requirements:
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="font-medium text-gray-700 dark:text-gray-300">Column Name</div>
                                            <div className="font-medium text-gray-700 dark:text-gray-300">Description</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                            <div><strong>name</strong> (Required)</div>
                                            <div className="text-gray-600 dark:text-gray-400">Full name of house owner</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><strong>nic</strong> (Required)</div>
                                            <div className="text-gray-600 dark:text-gray-400">NIC or passport number</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><strong>email</strong> (Required)</div>
                                            <div className="text-gray-600 dark:text-gray-400">Email address</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><strong>occupation</strong> (Optional)</div>
                                            <div className="text-gray-600 dark:text-gray-400">Occupation</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><strong>country</strong> (Optional)</div>
                                            <div className="text-gray-600 dark:text-gray-400">Country name</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><strong>mobile</strong> (Optional)</div>
                                            <div className="text-gray-600 dark:text-gray-400">Mobile number with country code</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div><strong>occupied_way</strong> (Optional)</div>
                                            <div className="text-gray-600 dark:text-gray-400">"own" or "For rent"</div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                            <strong>Note:</strong> Only the first row of the Excel file will be imported.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    disabled={importing}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={!file || importing}
                                    className="flex items-center gap-2 px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
                                >
                                    {importing ? (
                                        <>
                                            <Loader size={16} className="animate-spin" />
                                            Importing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={16} />
                                            Import House Owner
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    <div>
                                        <h3 className="font-medium text-green-800 dark:text-green-300">
                                            House Owner Imported Successfully!
                                        </h3>
                                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                            Verification email has been sent to {results.houseOwner.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Imported Data Summary */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                <h3 className="font-medium text-gray-800 dark:text-white mb-3">
                                    Imported House Owner Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                                        <p className="font-medium text-gray-800 dark:text-white">{results.houseOwner.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">NIC/Passport</label>
                                        <p className="font-medium text-gray-800 dark:text-white">{results.houseOwner.nic}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Email</label>
                                        <p className="font-medium text-gray-800 dark:text-white">{results.houseOwner.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Mobile</label>
                                        <p className="font-medium text-gray-800 dark:text-white">{results.houseOwner.mobile}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">Occupation</label>
                                        <p className="font-medium text-gray-800 dark:text-white">{results.houseOwner.occupation}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 dark:text-gray-400">House Owner ID</label>
                                        <p className="font-medium text-gray-800 dark:text-white">{results.houseOwner.id}</p>
                                    </div>
                                </div>
                                
                                {results.house && (
                                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                                            Linked to House:
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">House ID:</span>
                                                <p className="font-medium">{results.house.house_id}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                                <p className="font-medium text-green-600">Occupied</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Import Another
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}