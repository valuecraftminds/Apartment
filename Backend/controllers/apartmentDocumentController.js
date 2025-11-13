//controllers/apartmentDocumentController.js
const ApartmentDocument = require('../models/ApartmentDocument');
const fs = require('fs').promises;
const path = require('path');

// Configure upload directory
const UPLOAD_DIR = path.join(__dirname, '../uploads/apartment-documents');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

// Upload documents for an apartment
const uploadDocuments = async (req, res) => {
  try {
    await ensureUploadDir();

    const { apartmentId } = req.body;
    const companyId = req.user.company_id; // Assuming user info is in req.user
    const uploadedBy = req.user.id;

    if (!apartmentId) {
      return res.status(400).json({
        success: false,
        message: 'Apartment ID is required'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedDocuments = [];

    // Process each file
    for (const file of req.files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          message: `File ${file.originalname} exceeds maximum size of 10MB`
        });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
      const filePath = path.join(UPLOAD_DIR, uniqueFileName);

      // Move file to upload directory
      await fs.rename(file.path, filePath);

      // Create document record in database
      const documentData = {
        company_id: companyId,
        apartment_id: apartmentId,
        file_name: uniqueFileName,
        original_name: file.originalname,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: uploadedBy
      };

      const document = await ApartmentDocument.create(documentData);
      uploadedDocuments.push(document);
    }

    res.status(201).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: uploadedDocuments
    });

  } catch (error) {
    console.error('Upload documents error:', error);
    
    // Clean up uploaded files if error occurred
    if (req.files) {
      req.files.forEach(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error cleaning up file:', unlinkError);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload documents',
      error: error.message
    });
  }
};

// Get all documents for an apartment
const getApartmentDocuments = async (req, res) => {
  try {
    const { apartmentId } = req.params;
    const companyId = req.user.company_id;

    if (!apartmentId) {
      return res.status(400).json({
        success: false,
        message: 'Apartment ID is required'
      });
    }

    const documents = await ApartmentDocument.findByApartmentId(apartmentId);

    // Filter documents by company (additional security)
    const companyDocuments = documents.filter(doc => doc.company_id === companyId);

    res.json({
      success: true,
      data: companyDocuments
    });

  } catch (error) {
    console.error('Get apartment documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
};

// Download a document
const downloadDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const companyId = req.user.company_id;

    // Check if document belongs to user's company
    const belongsToCompany = await ApartmentDocument.belongsToCompany(documentId, companyId);
    if (!belongsToCompany) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = await ApartmentDocument.getDocumentWithDetails(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Check if file exists
    try {
      await fs.access(document.file_path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Set headers for download
    res.setHeader('Content-Type', document.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${document.original_name}"`);
    res.setHeader('Content-Length', document.file_size);

    // Stream the file
    const fileStream = require('fs').createReadStream(document.file_path);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message
    });
  }
};

// Delete a document
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const companyId = req.user.company_id;

    // Check if document belongs to user's company
    const belongsToCompany = await ApartmentDocument.belongsToCompany(documentId, companyId);
    if (!belongsToCompany) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = await ApartmentDocument.findById(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(document.file_path);
    } catch (error) {
      console.error('Error deleting file from filesystem:', error);
      // Continue with database deletion even if file deletion fails
    }

    // Delete record from database
    const deleted = await ApartmentDocument.delete(documentId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Failed to delete document'
      });
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message
    });
  }
};

// Get document info (without downloading)
const getDocumentInfo = async (req, res) => {
  try {
    const { documentId } = req.params;
    const companyId = req.user.company_id;

    // Check if document belongs to user's company
    const belongsToCompany = await ApartmentDocument.belongsToCompany(documentId, companyId);
    if (!belongsToCompany) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    const document = await ApartmentDocument.getDocumentWithDetails(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: document
    });

  } catch (error) {
    console.error('Get document info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document info',
      error: error.message
    });
  }
};

module.exports = {
  uploadDocuments,
  getApartmentDocuments,
  downloadDocument,
  deleteDocument,
  getDocumentInfo
};