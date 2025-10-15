const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const billController = require('../controllers/billController');

// Apply authentication to ALL apartment routes
router.use(authenticateToken);

// Routes
router.post('/', billController.createBill);
router.get('/', billController.getAllBills);
router.get('/:id', billController.getBillById);
router.put('/:id', billController.updateBill);
router.delete('/:id', billController.deleteBill);
router.get("/apartment/:apartment_id",billController.getByApartment);
// router.patch('/:id/toggle',houseTypeController.toggleHouseTypeStatus);

module.exports = router;