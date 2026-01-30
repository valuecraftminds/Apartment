// routes/houseOwnerBulkRoutes.js
const express = require('express');
const router = express.Router();
const houseOwnerBulkController = require('../controllers/houseOwnerBulkController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for Excel files
const excelStorage = multer.memoryStorage();
const uploadExcel = multer({
    storage: excelStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel/CSV files are allowed'), false);
        }
    }
});

// Generate Excel template for selected houses
router.post('/generate-template', authenticateToken, houseOwnerBulkController.generateExcelTemplate);

// Bulk import from Excel
router.post('/bulk-import', authenticateToken, uploadExcel.single('excelFile'), houseOwnerBulkController.bulkImportHouseOwners);

// Get houses for selection
router.get('/houses-for-selection', authenticateToken, houseOwnerBulkController.getHousesForSelection);

// Send verification email
router.post('/send-verification', authenticateToken, houseOwnerBulkController.sendVerificationEmail);

// Error handling for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
    }
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    next();
});

module.exports = router;