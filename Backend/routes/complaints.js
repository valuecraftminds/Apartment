const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateHouseOwner } = require('../middleware/houseOwnerAuth');
const { authenticateToken } = require('../middleware/auth');

// House owner routes
router.post('/', authenticateHouseOwner, complaintController.createComplaint);
router.get('/my-complaints', authenticateHouseOwner, complaintController.getMyComplaints);
router.get('/recent', authenticateHouseOwner, complaintController.getRecentComplaints);
router.get('/:id', authenticateHouseOwner, complaintController.getComplaintById);
router.put('/:id', authenticateHouseOwner, complaintController.updateMyComplaint);

// Admin/Staff routes
router.get('/', authenticateToken, complaintController.getAllComplaints);
router.patch('/:id/status', authenticateToken, complaintController.updateComplaintStatus);

module.exports = router;