//routes/userApartments.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userApartmentController = require('../controllers/userApartmentController');

// Apply authentication to all routes
router.use(authenticateToken);

// User apartment assignments
router.get('/users/:userId/apartments', userApartmentController.getUserApartments);
router.post('/users/:userId/apartments', userApartmentController.assignApartments);

// Apartment user assignments
router.get('/apartments/:apartmentId/users', userApartmentController.getApartmentUsers);

// Access checks and management
router.get('/users/:userId/apartments/:apartmentId/access', userApartmentController.checkUserAccess);
router.delete('/users/:userId/apartments/:apartmentId', userApartmentController.removeAssignment);

// Company-wide assignments
router.get('/assignments', userApartmentController.getAllAssignments);

module.exports = router;