const express = require('express');
const router = express.Router();
const apartmentController = require('../controllers/apartmentController');

router.post('/', apartmentController.createApartment);
router.get('/',apartmentController.getAllApartments);
router.get('/:id',apartmentController.getApartmentById);
router.put('/:id',apartmentController.updateApartment);
router.delete('/:id',apartmentController.deleteApartment);

module.exports = router;
