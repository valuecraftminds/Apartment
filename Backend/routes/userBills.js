//routes/userBills.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userBillController = require('../controllers/userBillController');

// Apply authentication to all routes
router.use(authenticateToken);

// User apartment assignments
router.get('/users/:userId/bills', userBillController.getUserBills);
router.post('/users/:userId/bills', userBillController.assignBills);

// Apartment user assignments
router.get('/bills/:billId/users', userBillController.getBillUsers);

// Access checks and management
router.get('/users/:userId/bills/:billId/access', userBillController.checkUserAccess);
router.delete('/users/:userId/bills/:billId', userBillController.removeAssignment);

// Company-wide assignments
router.get('/assignments', userBillController.getAllAssignments);

module.exports = router;