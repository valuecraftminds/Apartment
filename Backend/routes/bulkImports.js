// routes/bulkImportRoutes.js
const express = require('express');
const router = express.Router();
const bulkImportController = require('../controllers/bulkImportController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls, .csv) are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Bulk import apartments, floors, house types, and houses
router.post('/import', authenticateToken, upload.single('excelFile'), bulkImportController.bulkImport);

// Download template
router.get('/template', authenticateToken, bulkImportController.downloadTemplate);

module.exports = router;