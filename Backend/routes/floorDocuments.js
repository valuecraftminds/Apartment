//routes/floorDocuments.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  uploadDocuments,
  getFloorDocuments,
  downloadDocument,
  deleteDocument
} = require('../controllers/floorDocumentController');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/temp-floor');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'floor-document-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, XLS, XLSX are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Upload documents for a floor
router.post('/upload', upload.array('documents', 10), uploadDocuments);

// Get all documents for a floor
router.get('/:floorId/documents', getFloorDocuments);

// Download a floor document
router.get('/documents/:documentId/download', downloadDocument);

// Delete a floor document
router.delete('/documents/:documentId', deleteDocument);

module.exports = router;