const express = require('express');
const router = express.Router();
const apartmentController = require('../controllers/apartmentController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', apartmentController.createApartment);
//router.get('/',apartmentController.getAllApartments);
router.get('/:id',apartmentController.getApartmentById);
router.put('/:id',apartmentController.updateApartment);
router.delete('/:id',apartmentController.deleteApartment);

router.get('/', authenticateToken, apartmentController.getAllApartments);

module.exports = router;
