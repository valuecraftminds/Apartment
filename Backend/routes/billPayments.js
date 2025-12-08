// routes/billPayments.js
const express = require('express');
const router = express.Router();
const billPaymentController = require('../controllers/billPaymentController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

//Routes
router.get('/', billPaymentController.getAllPayments);
router.get('/summary', billPaymentController.getPaymentSummary);
router.get('/monthly-summary', billPaymentController.getMonthlySummary);
router.get('/:id', billPaymentController.getPaymentById);
router.patch('/:id/status', billPaymentController.updatePaymentStatus);
router.get('/measurable', billPaymentController.getMeasurableBillPayments);
router.delete('/:id', billPaymentController.deletePayment);

module.exports = router;