const express = require('express');
const router = express.Router();
const generateBillController = require('../controllers/generateBillController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to ALL routes
router.use(authenticateToken);

// Routes
router.post('/', generateBillController.generateBill);
router.post('/bulk', generateBillController.generateBulkBills);
router.get('/', generateBillController.getAllGeneratedBills);
router.get('/bills/:bill_id', generateBillController.getByBillId);

module.exports = router;