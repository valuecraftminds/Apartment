const express = require('express');
const router = express.Router();
const billPriceController = require('../controllers/billPriceController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to ALL bill price routes
router.use(authenticateToken);

// Routes
router.post('/', billPriceController.createBillPrice);
router.get('/', billPriceController.getAllBillPrices); // Supports query params: ?bill_id=xxx&billrange_id=xxx
router.get('/bill/:bill_id', billPriceController.getByBillId);
router.get('/billrange/:billrange_id', billPriceController.getByBillRangeId);
router.get('/:id', billPriceController.getBillPriceById);
router.put('/:id', billPriceController.updateBillPrice);
router.delete('/:id', billPriceController.deleteBillPrice);

module.exports = router;