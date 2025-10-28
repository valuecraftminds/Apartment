const express = require('express');
const router = express.Router();
const billRangeController = require('../controllers/billRangeController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to ALL apartment routes
router.use(authenticateToken);

// Routes
router.post('/', billRangeController.createBillRange);
router.get('/', billRangeController.getAllBillRanges);
router.get('/:id', billRangeController.getBillRangeById);
router.get('/bills/:bill_id',billRangeController.getByBillId);
router.put('/:id', billRangeController.updateBillRange);
router.delete('/:id', billRangeController.deleteBillRange);
// router.get("/apartment/:apartment_id",billController.getByApartment);
// router.get("/tenants/company_id"),billController.
// router.patch('/:id/toggle',houseTypeController.toggleHouseTypeStatus);

module.exports = router;