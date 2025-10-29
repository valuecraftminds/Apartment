const express = require('express');
const router = express.Router();
const billPriceController = require('../controllers/billPriceController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to ALL apartment routes
router.use(authenticateToken);

// Routes
router.post('/', billPriceController.createBillPrice);
router.get('/', billPriceController.getAllBillPrices);
router.get('/billranges/:billrange_id',billPriceController.getByBillRangeId);
router.get('/:id', billPriceController.getBillPriceById);
router.put('/:id', billPriceController.updateBillRangePrice);
router.delete('/:id', billPriceController.deleteBillRangePrice);

module.exports = router;