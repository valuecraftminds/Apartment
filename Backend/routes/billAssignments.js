const express = require('express');
const router = express.Router();
const billAssignmentController = require('../controllers/billAssignmentController');
const { authenticateToken } = require('../middleware/auth');

// All routes are protected
router.use(authenticateToken);

// Assign bill to houses
router.post('/assign', billAssignmentController.assignBill);

// Get assignments by bill ID
router.get('/bill/:bill_id', billAssignmentController.getAssignmentsByBill);

// Get assignments by house ID
router.get('/house/:house_id', billAssignmentController.getAssignmentsByHouse);

// Get assignments with filters
router.get('/', billAssignmentController.getAssignments);

// Deactivate assignment
router.patch('/:id/deactivate', billAssignmentController.deactivateAssignment);

// Reactivate assignment
router.patch('/:id/reactivate', billAssignmentController.reactivateAssignment);

// Delete assignment
router.delete('/:id', billAssignmentController.deleteAssignment);

// Remove assignment from specific houses
router.delete('/:bill_id/remove', billAssignmentController.removeAssignment);

module.exports = router;