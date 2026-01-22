// controllers/ratingController.js
const Rating = require('../models/Rating');
const Complaint = require('../models/Complaint');

const ratingController = {
    // Submit rating for a complaint
    async submitRating(req, res) {
        try {
            const { id } = req.params; // complaint ID
            const { rating, feedback } = req.body;
            const houseowner_id = req.houseowner?.id;

            if (!houseowner_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Validation
            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }

            // Check if complaint exists and belongs to house owner
            const complaint = await Complaint.findById(id);
            if (!complaint) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }

            // Verify house owner owns this complaint
            if (complaint.houseowner_id !== houseowner_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to rate this complaint'
                });
            }

            // Check if complaint is closed
            if (complaint.status !== 'Closed') {
                return res.status(400).json({
                    success: false,
                    message: 'Only closed complaints can be rated'
                });
            }

            // Check if already rated
            const existingRating = await Rating.findByComplaintId(id);
            if (existingRating) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already rated this complaint'
                });
            }

            // Get company ID from complaint
            const company_id = complaint.company_id;

            // Create rating
            const ratingData = await Rating.create({
                id: require('uuid').v4(),
                company_id,
                complaint_id: id,
                houseowner_id,
                rating: parseInt(rating),
                feedback: feedback || null
            });

            res.status(201).json({
                success: true,
                message: 'Thank you for your feedback!',
                data: ratingData
            });

        } catch (err) {
            console.error('Submit rating error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while submitting rating'
            });
        }
    },

    // Get rating for a complaint
    async getRating(req, res) {
        try {
            const { id } = req.params;
            const houseowner_id = req.houseowner?.id;
            const user_id = req.user?.id; 

            const rating = await Rating.findByComplaintId(id);
            
            if (!rating) {
                return res.status(404).json({
                    success: false,
                    message: 'No rating found for this complaint'
                });
            }

            // Allow access for either house owner OR admin
            const isHouseOwner = houseowner_id && rating.houseowner_id === houseowner_id;
            const isAdmin = user_id; 

            if (!isHouseOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to view this rating'
                });
            }

            res.json({
                success: true,
                data: rating
            });

        } catch (err) {
            console.error('Get rating error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching rating'
            });
        }
    },
    // Get house owner's ratings
    async getMyRatings(req, res) {
        try {
            const houseowner_id = req.houseowner?.id;

            if (!houseowner_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const ratings = await Rating.findByHouseOwner(houseowner_id);

            res.json({
                success: true,
                data: ratings,
                count: ratings.length
            });

        } catch (err) {
            console.error('Get my ratings error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching ratings'
            });
        }
    },

    // Get technician average rating
    async getTechnicianRating(req, res) {
        try {
            const { technician_id } = req.params;

            const ratingStats = await Rating.getTechnicianAverage(technician_id);

            res.json({
                success: true,
                data: ratingStats
            });

        } catch (err) {
            console.error('Get technician rating error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching technician rating'
            });
        }
    },

    // Get company average rating
    async getCompanyRating(req, res) {
        try {
            const company_id = req.user?.company_id;

            if (!company_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
            }

            const ratingStats = await Rating.getCompanyAverage(company_id);

            res.json({
                success: true,
                data: ratingStats
            });

        } catch (err) {
            console.error('Get company rating error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching company rating'
            });
        }
    }
};

module.exports = ratingController;