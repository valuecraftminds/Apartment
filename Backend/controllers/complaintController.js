const Complaint = require('../models/Complaint');

const complaintController = {
    // House owner creates a complaint
    async createComplaint(req, res) {
        try {
            const {
                title,
                description,
                apartment_id,
                floor_id,
                house_id
            } = req.body;
            
            const houseowner_id = req.houseowner?.id;
            const company_id = req.houseowner?.company_id;

            if (!houseowner_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Validation
            if (!title || !description || !apartment_id || !floor_id || !house_id === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Title, description, and location details are required'
                });
            }
                const complaint = await Complaint.create({
                    company_id,
                    apartment_id,
                    floor_id,
                    house_id,
                    houseowner_id,
                    title,
                    description
                });

                res.status(201).json({
                    success: true,
                    message: 'Complaint filed successfully',
                    data: complaint
                });

        } catch (err) {
            console.error('Create complaint error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while filing complaint'
            });
        }
    },

    // House owner gets their complaints
    async getMyComplaints(req, res) {
        try {
            const houseowner_id = req.houseowner?.id;
            
            if (!houseowner_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { 
                status, 
                start_date,
                end_date
            } = req.query;

            const filters = {};
            if (status) filters.status = status;
            if (start_date) filters.start_date = start_date;
            if (end_date) filters.end_date = end_date;

            const complaints = await Complaint.findByHouseOwner(houseowner_id, filters);
            const statistics = await Complaint.getHouseOwnerStatistics(houseowner_id);

            res.json({
                success: true,
                data: complaints,
                statistics: statistics,
                count: complaints.length
            });

        } catch (err) {
            console.error('Get my complaints error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching complaints'
            });
        }
    },

    // House owner gets single complaint
    async getComplaintById(req, res) {
        try {
            const { id } = req.params;
            const houseowner_id = req.houseowner?.id;

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
                    message: 'You are not authorized to view this complaint'
                });
            }

            res.json({
                success: true,
                data: complaint
            });

        } catch (err) {
            console.error('Get complaint error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching complaint'
            });
        }
    },

    // House owner updates their complaint (only allowed for Pending status)
    async updateMyComplaint(req, res) {
        try {
            const { id } = req.params;
            const houseowner_id = req.houseowner?.id;
            const { title, description } = req.body;

            // Get current complaint
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
                    message: 'You are not authorized to update this complaint'
                });
            }

            // Only allow updates if complaint is Pending
            if (complaint.status !== 'Pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Complaint can only be updated while it is Pending'
                });
            }

            const updateData = {
                    title: title || complaint.title,
                    description: description || complaint.description,
                };

                const updatedComplaint = await Complaint.update(id, updateData);

                res.json({
                    success: true,
                    message: 'Complaint updated successfully',
                    data: updatedComplaint
                });

        } catch (err) {
            console.error('Update complaint error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating complaint'
            });
        }
    },

    // Admin/Staff gets all complaints for company
    async getAllComplaints(req, res) {
        try {
            const company_id = req.user?.company_id;
            
            if (!company_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
            }

            const { 
                status, 
                apartment_id,
            } = req.query;

            const filters = {};
            if (status) filters.status = status;
            if (apartment_id) filters.apartment_id = apartment_id;

            const complaints = await Complaint.findByCompany(company_id, filters);
            const statistics = await Complaint.getCompanyStatistics(company_id);

            res.json({
                success: true,
                data: complaints,
                statistics: statistics,
                count: complaints.length
            });

        } catch (err) {
            console.error('Get all complaints error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching complaints'
            });
        }
    },

    // Admin/Staff updates complaint status
    async updateComplaintStatus(req, res) {
        try {
            const { id } = req.params;
            const { status} = req.body;

            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is required'
                });
            }

            const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            const updateData = { status };

            const updatedComplaint = await Complaint.update(id, updateData);

            res.json({
                success: true,
                message: 'Complaint status updated successfully',
                data: updatedComplaint
            });

        } catch (err) {
            console.error('Update complaint status error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating complaint status'
            });
        }
    },

    // Get recent complaints for dashboard
    async getRecentComplaints(req, res) {
        try {
            const houseowner_id = req.houseowner?.id;
            
            if (!houseowner_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const recentComplaints = await Complaint.getRecentComplaints(houseowner_id, 5);

            res.json({
                success: true,
                data: recentComplaints
            });

        } catch (err) {
            console.error('Get recent complaints error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching recent complaints'
            });
        }
    }
};

module.exports = complaintController;