const express = require('express');
const router = express.Router();
const sharedValuePriceController = require('../controllers/sharedValuePriceController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to ALL bill price routes
router.use(authenticateToken);

// Routes
router.post('/', sharedValuePriceController.createSharedValuePrice);
router.get('/', sharedValuePriceController.getAllBillPrices); // Supports query params: ?bill_id=xxx&billrange_id=xxx
router.get('/bill/:bill_id', sharedValuePriceController.getByBillId);
// router.get('/billrange/:billrange_id', billPriceController.getByBillRangeId);
router.get('/:id', sharedValuePriceController.getSharedValuePriceById);
router.put('/:id', sharedValuePriceController.updateSharedValuePrice);
router.delete('/:id', sharedValuePriceController.deleteSharedValuePrice);

module.exports = router;