const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleController = require('../controllers/roleController');

// Apply authentication to ALL apartment routes
router.use(authenticateToken);

// Routes
router.post('/', roleController.createRole);
router.get('/', roleController.getAllRoles);
router.get('/:id', roleController.getRoleById);
router.put('/:id', roleController.updateRoles);
router.delete('/:id', roleController.deleteRole);
// router.get("/apartment/:apartment_id",houseTypeController.getByApartment);
// router.patch('/:id/toggle',houseTypeController.toggleHouseTypeStatus);

module.exports = router;