//routes/generateMeasurableBills.js
const express = require('express');
const router = express.Router();
const generateMeasurableBillController = require('../controllers/generateMeasubleBillController')
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Create measurable bills
router.post('/', generateMeasurableBillController.createMeasurableBill);
router.post('/multiple', generateMeasurableBillController.createMultipleMeasurableBills);
router.post('/from-calculation', generateMeasurableBillController.generateFromCalculation);

// Get measurable bills
router.get('/', generateMeasurableBillController.getAllMeasurableBills);
router.get('/bill/:bill_id', generateMeasurableBillController.getMeasurableBillsByBillId);
router.get('/period', generateMeasurableBillController.getMeasurableBillsByPeriod);
router.get('/house/:house_id', generateMeasurableBillController.getMeasurableBillsByHouseId);
router.get('/:id', generateMeasurableBillController.getMeasurableBillById);

// Utility endpoints
router.get('/previous-reading', generateMeasurableBillController.getPreviousReading);
router.get('/statistics', generateMeasurableBillController.getMeasurableBillsStatistics);
router.get('/monthly-summary', generateMeasurableBillController.getMonthlySummary);

// Update and delete
router.put('/:id', generateMeasurableBillController.updateMeasurableBill);
router.delete('/:id', generateMeasurableBillController.deleteMeasurableBill);

module.exports = router;