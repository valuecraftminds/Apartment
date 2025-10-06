const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const houseTypeController = require('../controllers/houseTypeController');

// Apply authentication to ALL apartment routes
router.use(authenticateToken);

// Routes
router.post('/', houseTypeController.createHouseType);
router.get('/', houseTypeController.getAllHouseTypes);
router.get('/:id', houseTypeController.getHouseTypeById);
router.put('/:id', houseTypeController.updateHouseType);
router.delete('/:id', houseTypeController.deleteHouseType);
router.get("/apartment/:apartment_id",houseTypeController.getByApartment);

module.exports = router;