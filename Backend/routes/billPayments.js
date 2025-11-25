// routes/billPayments.js
const express = require('express');
const router = express.Router();
const billPaymentsController = require('../controllers/billPaymentsController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Routes
router.get('/', billPaymentsController.getAllPayments);
router.get('/summary', billPaymentsController.getPaymentSummary);
router.get('/monthly-summary', billPaymentsController.getMonthlySummary);
router.get('/:id', billPaymentsController.getPaymentById);
router.patch('/:id/status', billPaymentsController.updatePaymentStatus);

module.exports = router;