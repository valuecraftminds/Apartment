const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const houseController = require('../controllers/houseController');

// Apply authentication to ALL apartment routes
router.use(authenticateToken);

// Routes
router.post('/', houseController.createHouse);
router.post('/batch', houseController.createHousesBatch);
router.get('/', houseController.getAllHouses);
router.get('/:id', houseController.getHouseById);
router.put('/:id', houseController.updateHouse);
router.delete('/:id', houseController.deleteHouse);


module.exports = router;