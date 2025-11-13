import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, Download, Trash2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function DocumentModal({ apartment, onClose, onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(true);
    const fileInputRef = useRef(null);

    // Load documents when component mounts
    useEffect(() => {
        loadDocuments();
    }, [apartment.id]);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // FIXED: Updated API endpoint
    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            toast.error('Please select at least one file');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            
            selectedFiles.forEach(file => {
                formData.append('documents', file);
            });

            formData.append('apartmentId', apartment.id);

            // FIXED: Correct endpoint
            const response = await api.post('/apartment-documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setSelectedFiles([]);
                onUploadSuccess?.();
                loadDocuments();
                
                // Clear file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to upload documents';
            toast.error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    // FIXED: Updated API endpoint
    const loadDocuments = async () => {
        try {
            setLoadingDocuments(true);
            const response = await api.get(`/apartment-documents/apartments/${apartment.id}/documents`);
            if (response.data.success) {
                setDocuments(response.data.data);
            }
        } catch (error) {
            console.error('Error loading documents:', error);
            const errorMessage = error.response?.data?.message || 'Failed to load documents';
            toast.error(errorMessage);
        } finally {
            setLoadingDocuments(false);
        }
    };

    // FIXED: Updated API endpoint
    const handleDeleteDocument = async (documentId) => {
        if (!window.confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await api.delete(`/apartment-documents/documents/${documentId}`);
            toast.success('Document deleted successfully');
            loadDocuments();
        } catch (error) {
            console.error('Delete error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete document';
            toast.error(errorMessage);
        }
    };

    // FIXED: Updated API endpoint
    const handleDownload = async (document) => {
        try {
            const response = await api.get(`/apartment-documents/documents/${document.id}/download`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', document.original_name || document.file_name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to download document';
            toast.error(errorMessage);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Documents - {apartment.name}
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
                >
                    ✖
                </button>
            </div>

            {/* Upload Section */}
            <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Upload New Documents
                </h3>
                
                <div className="mb-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Upload size={20} />
                        Select Files
                    </button>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Supported formats: PDF, DOC, DOCX, JPG, PNG, XLSX (Max: 10MB per file)
                    </p>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-medium mb-2 text-gray-800 dark:text-white">Selected Files:</h4>
                        <div className="space-y-2">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded border">
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-300">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeSelectedFile(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedFiles.length > 0 && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {uploading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={20} />
                                Upload {selectedFiles.length} File(s)
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Existing Documents Section */}
            <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Existing Documents
                </h3>
                
                {loadingDocuments ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Loading documents...</p>
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No documents uploaded yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500">
                                <div className="flex items-center gap-3 flex-1">
                                    <FileText size={24} className="text-blue-500" />
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800 dark:text-white">
                                            {doc.original_name || doc.file_name}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-300">
                                            {formatFileSize(doc.file_size)} • 
                                            Uploaded on {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        title="Download"
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteDocument(doc.id)}
                                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}