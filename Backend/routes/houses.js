//routes/houses.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { authenticateHouseOwner } = require('../middleware/houseOwnerAuth');
const houseController = require('../controllers/houseController');

// Add this test route at the TOP of routes/houses.js
router.get('/test-auth', (req, res) => {
  console.log('Test route hit');
  res.json({
    success: true,
    message: 'Test route works',
    timestamp: new Date().toISOString()
  });
});

router.get('/my-houses', authenticateHouseOwner, houseController.getMyHouses);
router.get('/owner/me', authenticateHouseOwner, houseController.getHousesByAuthenticatedOwner);
// Apply authentication to ALL apartment routes
// router.use(authenticateToken);
// Routes
router.post('/', authenticateToken, houseController.createHouse);
router.post('/batch', authenticateToken, houseController.createHousesBatch);
router.get('/', authenticateToken, houseController.getAllHouses);
router.get('/:id', authenticateToken, houseController.getHouseById);
router.put('/:id', authenticateToken, houseController.updateHouse);
router.delete('/:id', authenticateToken, houseController.deleteHouse);
router.patch('/:id/toggle', authenticateToken, houseController.toggleHouseStatus);
router.get('/by-owner', authenticateToken, houseController.getHouseByOwnerId);


module.exports = router;