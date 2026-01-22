// routes/ratings.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticateHouseOwner } = require('../middleware/houseOwnerAuth');
const { authenticateToken } = require('../middleware/auth');

// Admin/Staff routes
router.get('/get-rating/:id/rating', authenticateToken, ratingController.getRating);

// House owner routes
router.post('/complaints/:id/rate', authenticateHouseOwner, ratingController.submitRating);
router.get('/complaints/:id/rating', authenticateHouseOwner, ratingController.getRating);
router.get('/my-ratings', authenticateHouseOwner, ratingController.getMyRatings);
router.get('/technicians/:technician_id/rating', authenticateToken, ratingController.getTechnicianRating);
router.get('/company/rating', authenticateToken, ratingController.getCompanyRating);



module.exports = router;