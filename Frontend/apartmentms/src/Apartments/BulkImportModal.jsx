// components/BulkImportModal.jsx
import React, { useState } from 'react';
import { Upload, Download, FileText, CheckCircle, XCircle, AlertCircle, X, Building, Layers, Home, Users } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function BulkImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);

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

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await api.post('/bulk-import/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResults(response.data.data);
      toast.success('Bulk import completed successfully!');
      
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || 'Failed to import data');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/bulk-import/template', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'apartment-import-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Bulk Import Apartments
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* File Upload Area */}
          {!results && (
            <div className="space-y-6">
              {/* Download Template */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-blue-800 dark:text-blue-300">
                      Download Template
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Download our Excel template to ensure proper formatting
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

              {/* Upload Area */}
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
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
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
                    Required Columns:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Apartment Details</h5>
                      <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• <strong>apartment_name</strong> - Name of apartment</li>
                        <li>• <strong>address</strong> - Address (optional)</li>
                        <li>• <strong>city</strong> - City (optional)</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Floor & House Details</h5>
                      <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• <strong>floor_number</strong> - Floor number/name</li>
                        <li>• <strong>house_number</strong> - House/unit number</li>
                        <li>• <strong>house_type</strong> - Type of house</li>
                        <li>• <strong>status</strong> - vacant/occupied/maintenance</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">House Type Details</h5>
                      <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• <strong>sqrfeet</strong> - Area in sq ft (default: 1000)</li>
                        <li>• <strong>rooms</strong> - Room count (default: 3)</li>
                        <li>• <strong>bathrooms</strong> - Bathroom count (default: 2)</li>
                      </ul>
                    </div>
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Import Data
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-medium text-green-800 dark:text-green-300">
                      Import Completed Successfully!
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Processed {results.total} rows from your file
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                  <Building className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {results.created.apartments}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Apartments</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                  <Layers className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {results.created.floors}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Floors</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                  <Home className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {results.created.houseTypes}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">House Types</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {results.created.houses}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Houses</div>
                </div>
              </div>

              {/* Updated Houses */}
              {results.updated.houses > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                        Updated Existing Houses
                      </h3>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                        {results.updated.houses} houses were updated with new information
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Errors Display */}
              {results.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <h3 className="font-medium text-red-800 dark:text-red-300">
                      {results.errors.length} Error(s) Found
                    </h3>
                  </div>
                  <div className="max-h-40 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 py-1">
                        <XCircle size={14} />
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Import Another File
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