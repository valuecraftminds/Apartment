const express = require('express');
const router = express.Router();
const houseDocumentController = require('../controllers/houseDocumentController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads - FIXED: Use same pattern as floor documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/temp-house');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'house-document-' + uniqueSuffix + path.extname(file.originalname));
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
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// 🔥 CRITICAL FIX: Apply authentication middleware to all routes FIRST
router.use(authenticateToken);

// Routes - Now they work exactly like floor documents
router.post('/upload', upload.array('documents', 10), houseDocumentController.uploadDocuments);
router.get('/houses/:houseId/documents', houseDocumentController.getHouseDocuments);
router.get('/documents/:id/download', houseDocumentController.downloadDocument);
router.delete('/documents/:id', houseDocumentController.deleteDocument);

module.exports = router;