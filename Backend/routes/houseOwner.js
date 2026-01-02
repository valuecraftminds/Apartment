//routes/houseOwner.js
const express = require('express');
const router = express.Router();
const houseOwnerController = require('../controllers/houseOwnerController')
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'evidance/proof/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'e_ho-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Apply authentication to ALL apartment routes
router.use(authenticateToken);
router.get('/health-check', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'House owner route is working',
    timestamp: new Date().toISOString()
  });
});

// Routes
router.post('/', upload.single('proof'), houseOwnerController.createHouseOwner);
router.get('/', houseOwnerController.getAllHouseOwner);
router.get('/:id', houseOwnerController.getHouseOwnerById);
router.put('/:id', upload.single('proof'), houseOwnerController.updateHouseOwner);
// router.delete('/:id', apartmentController.deleteApartment);
// router.patch('/:id/toggle', apartmentController.toggleApartmentStatus);
router.get('/by-house', houseOwnerController.getHouseOwnerByHouseId);
// Add near other routes, before the error middleware
router.get('/download-proof/:id', houseOwnerController.downloadProof);
// In routes/houseOwner.js, add this route:
router.get('/view-proof/:id', houseOwnerController.viewProof);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 5MB.'
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