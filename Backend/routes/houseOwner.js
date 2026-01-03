//routes/houseOwner.js
const express = require('express');
const router = express.Router();
const houseOwnerController = require('../controllers/houseOwnerController')
const houseController = require('../controllers/houseController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateHouseOwner } = require('../middleware/houseOwnerAuth');
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
// router.use(authenticateToken);
router.get('/health-check', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'House owner route is working',
    timestamp: new Date().toISOString()
  });
});

router.get('/my-profile', authenticateHouseOwner, houseOwnerController.getMyProfile);
router.put('/my-profile', authenticateHouseOwner, upload.single('proof'), houseOwnerController.updateMyProfile);


// Add this route in houseOwner.js
router.get('/my-houses', authenticateHouseOwner, houseController.getHousesByAuthenticatedOwner);

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

//remove once error fixed
// Add this route for testing
router.get('/test-auth-flow', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.json({ message: 'No token provided' });
  }
  
  try {
    // 1. Decode JWT
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const houseOwnerId = decoded.houseowner_id || decoded.id;
    
    // 2. Direct database query
    const [result] = await pool.execute(
      'SELECT id, email, name, is_active FROM houseowner WHERE id = ?',
      [houseOwnerId]
    );
    
    if (result.length === 0) {
      // Try with different query
      const [allResults] = await pool.execute(
        'SELECT id, email FROM houseowner LIMIT 5'
      );
      
      return res.json({
        success: false,
        message: 'Houseowner not found in direct query',
        searchedId: houseOwnerId,
        first5HouseOwners: allResults,
        decodedToken: decoded
      });
    }
    
    return res.json({
      success: true,
      message: 'Authentication flow works!',
      houseowner: result[0],
      decodedToken: decoded
    });
    
  } catch (error) {
    return res.json({
      success: false,
      message: 'Error in auth flow',
      error: error.message,
      errorName: error.name
    });
  }
});

module.exports = router;