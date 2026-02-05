// routes/complaints.js - FIXED VERSION
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
router.get('/technicians/category', authenticateToken, complaintController.getTechniciansByCategory);
router.get('/categories', authenticateToken, complaintController.getCategories);
router.get('/my-complaints/technician', authenticateToken, complaintController.getTechnicianComplaints);
router.delete('/:id', authenticateToken, complaintController.deleteComplaint);

// Timer routes for technicians
router.post('/:id/timer/start', authenticateToken, complaintController.startTimer);
router.post('/:id/timer/pause', authenticateToken, complaintController.pauseTimer);
router.post('/:id/timer/resume', authenticateToken, complaintController.resumeTimer);
router.post('/:id/timer/stop', authenticateToken, complaintController.stopTimer);
router.get('/:id/timer/status', authenticateToken, complaintController.getTimerStatus);

//Hold complaint
router.post('/:id/hold', authenticateToken, complaintController.holdComplaint);
router.post('/:id/resume', authenticateToken, complaintController.resumeComplaint);
router.get('/:id/hold-history', authenticateToken, complaintController.getHoldHistory);
router.get('/:id/hold-status', authenticateToken, complaintController.getCurrentHoldStatus);

// routes for house owner to close/reopen complaint
router.post('/:id/close', authenticateHouseOwner, complaintController.houseOwnerCloseComplaint);
router.post('/:id/reopen', authenticateHouseOwner, complaintController.houseOwnerReopenComplaint);
router.get('/:id/rating-status', authenticateHouseOwner, complaintController.checkRatingStatus);

module.exports = router;