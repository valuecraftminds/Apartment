const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const floorController = require('../controllers/floorController');

// Apply authentication to ALL apartment routes
router.use(authenticateToken);

// Routes
router.post('/', floorController.createFloors);
router.post('/batch', floorController.createFloorsBatch);
router.get('/', floorController.getAllFloors);
router.get('/:id', floorController.getFloorById);
router.put('/:id', floorController.updateFloors);
router.delete('/:id', floorController.deleteFloors);
router.patch('/:id/toggle', floorController.toggleFloorStatus);

module.exports = router;