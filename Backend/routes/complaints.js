// //routes/complaints.js
// const express = require('express');
// const router = express.Router();
// const complaintController = require('../controllers/complaintController');
// const { authenticateHouseOwner } = require('../middleware/houseOwnerAuth');
// const { authenticateToken } = require('../middleware/auth');

// // House owner routes
// router.post('/', authenticateHouseOwner, complaintController.createComplaint);
// router.get('/my-complaints', authenticateHouseOwner, complaintController.getMyComplaints);
// router.get('/recent', authenticateHouseOwner, complaintController.getRecentComplaints);
// router.get('/:id', authenticateHouseOwner, complaintController.getComplaintById);
// router.put('/:id', authenticateHouseOwner, complaintController.updateMyComplaint);

// // Admin/Staff routes
// router.get('/', authenticateToken, complaintController.getAllComplaints);
// router.patch('/:id/status', authenticateToken, complaintController.updateComplaintStatus);

// module.exports = router;

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
router.patch('/:id/assign', authenticateToken, complaintController.assignComplaint);
router.get('/technicians/category', authenticateToken, complaintController.getTechniciansByCategory);
router.get('/categories', authenticateToken, complaintController.getCategories);
router.get('/my-complaints/technician', authenticateToken, complaintController.getTechnicianComplaints);

// Timer routes for technicians
router.post('/:id/timer/start', authenticateToken, complaintController.startTimer);
router.post('/:id/timer/pause', authenticateToken, complaintController.pauseTimer);
router.post('/:id/timer/resume', authenticateToken, complaintController.resumeTimer);
router.post('/:id/timer/stop', authenticateToken, complaintController.stopTimer);
router.get('/:id/timer/status', authenticateToken, complaintController.getTimerStatus);

module.exports = router;