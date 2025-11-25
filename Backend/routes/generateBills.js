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
router.get('/:id',generateBillController.getGenerateBillById);
router.put('/:id',generateBillController.UpdateGenerateBills);
router.delete('/:id',generateBillController.deleteGeneratedBill);

module.exports = router;