// //controllers/complaintController.js
const pool = require('../db');
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
                house_id,
                category_id  // Change from category to category_id
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
            if (!title || !description || !apartment_id || !floor_id || house_id === undefined) {
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
                description,
                category_id: category_id || null  // Ensure it's passed as category_id
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
                category_id,  // Change from category to category_id
                assigned
            } = req.query;

            const filters = {};
            if (status && status !== 'all') filters.status = status;
            if (apartment_id && apartment_id !== 'all') filters.apartment_id = apartment_id;
            if (category_id && category_id !== 'all') filters.category_id = category_id;  // Change this
            if (assigned && assigned !== 'all') filters.assigned = assigned;

            const complaints = await Complaint.findByCompany(company_id, filters);
            const statistics = await Complaint.getCompanyStatistics(company_id);
            const categories = await Complaint.getCategories(company_id);  // This returns different structure now

            res.json({
                success: true,
                data: complaints,
                statistics: statistics,
                categories: categories || [],  // This will be array of objects with category_name and category_id
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
            const { status } = req.body;

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

    // Get technicians by category
    async getTechniciansByCategory(req, res) {
        try {
            const company_id = req.user?.company_id;
            const { category } = req.query; // Get category from query params
            
            if (!company_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
            }

            const technicians = await Complaint.getTechniciansByCategory(company_id, category);

            res.json({
                success: true,
                data: technicians || [],
                count: (technicians || []).length
            });

        } catch (err) {
            console.error('Get technicians error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching technicians'
            });
        }
    },

    // Get complaint categories
    async getCategories(req, res) {
        try {
            const company_id = req.user?.company_id;

            if (!company_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
            }

            const categories = await Complaint.getCategories(company_id);

            res.json({
                success: true,
                data: categories || []
            });

        } catch (err) {
            console.error('Get categories error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching categories'
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
    },

   // Get complaints for technician (based on assigned apartments and categories)
    async getTechnicianComplaints(req, res) {
        try {
            const technician_id = req.user?.id;
            const company_id = req.user?.company_id;
            
            if (!technician_id) {
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
            if (status && status !== 'all') filters.status = status;
            if (start_date) filters.start_date = start_date;
            if (end_date) filters.end_date = end_date;

            // Get technician's assigned apartments
            const [apartmentRows] = await pool.execute(
                'SELECT apartment_id FROM user_apartments WHERE user_id = ?',
                [technician_id]
            );
            
            const assignedApartmentIds = apartmentRows.map(row => row.apartment_id);
            
            if (assignedApartmentIds.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    statistics: { total: 0, pending: 0, in_progress: 0, resolved: 0 },
                    count: 0,
                    message: 'No apartments assigned to you'
                });
            }
            
            // Get technician's assigned categories
            const TechnicianCategory = require('../models/TechnicianCategory');
            const assignedCategories = await TechnicianCategory.findByTechnicianId(technician_id, company_id);
            const assignedCategoryIds = assignedCategories.map(cat => cat.category_id);
            
            // Use UPDATED method WITHOUT technician_id filter
            const complaints = await Complaint.findByTechnicianWithFilters(
                company_id, 
                assignedApartmentIds, 
                assignedCategoryIds, 
                filters
            );
            
            // Get statistics for assigned apartments and categories
            let statsQuery = `
                SELECT 
                    status,
                    COUNT(*) as count
                FROM complaints 
                WHERE company_id = ?
                AND apartment_id IN (${assignedApartmentIds.map(() => '?').join(', ')})
            `;
            
            const statsParams = [company_id, ...assignedApartmentIds];
            
            if (assignedCategoryIds.length > 0) {
                statsQuery += ` AND (category_id IS NULL OR category_id IN (${assignedCategoryIds.map(() => '?').join(', ')}))`;
                statsParams.push(...assignedCategoryIds);
            }
            
            statsQuery += ' GROUP BY status';
            
            const [statsRows] = await pool.execute(statsQuery, statsParams);
            
            // Calculate statistics
            const total = statsRows.reduce((sum, row) => sum + row.count, 0);
            const pending = statsRows.find(row => row.status === 'Pending')?.count || 0;
            const in_progress = statsRows.find(row => row.status === 'In Progress')?.count || 0;
            const resolved = statsRows.find(row => row.status === 'Resolved' || row.status === 'Closed')?.count || 0;

            res.json({
                success: true,
                data: complaints,
                statistics: {
                    total,
                    pending,
                    in_progress,
                    resolved,
                    by_status: statsRows
                },
                count: complaints.length,
                assignments: {
                    apartments_count: assignedApartmentIds.length,
                    categories_count: assignedCategoryIds.length
                }
            });

        } catch (err) {
            console.error('Get technician complaints error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching complaints',
                error: err.message
            });
        }
    },

    //Timer Functionality for Technicians
    // Start timer
    async startTimer(req, res) {
        try {
            const { id } = req.params;
            const technician_id = req.user?.id;

            if (!technician_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            try {
                // Fix: use technician_id instead of technicianId
                const started = await Complaint.startTimer(id, technician_id);

                if (started) {
                    const timerStatus = await Complaint.getTimerStatus(id);
                    return res.json({
                        success: true,
                        message: 'Timer started successfully',
                        data: timerStatus
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Failed to start timer. Timer might already be running.'
                    });
                }
            } catch (error) {
                console.error('Timer start error:', error.message);
                return res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to start timer'
                });
            }

        } catch (err) {
            console.error('Start timer error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while starting timer'
            });
        }
    },

    // Pause timer
    async pauseTimer(req, res) {
        try {
            const { id } = req.params;
            const technician_id = req.user?.id;

            if (!technician_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            try {
                const paused = await Complaint.pauseTimer(id, technician_id);

                if (paused) {
                    const timerStatus = await Complaint.getTimerStatus(id);
                    return res.json({
                        success: true,
                        message: 'Timer paused successfully',
                        data: timerStatus
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Failed to pause timer. Timer might not be running.'
                    });
                }
            } catch (error) {
                console.error('Timer pause error:', error.message);
                return res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to pause timer'
                });
            }

        } catch (err) {
            console.error('Pause timer error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while pausing timer'
            });
        }
    },

    // Resume timer
    async resumeTimer(req, res) {
        try {
            const { id } = req.params;
            const technician_id = req.user?.id;

            if (!technician_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            try {
                const resumed = await Complaint.resumeTimer(id, technician_id);

                if (resumed) {
                    const timerStatus = await Complaint.getTimerStatus(id);
                    return res.json({
                        success: true,
                        message: 'Timer resumed successfully',
                        data: timerStatus
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Failed to resume timer. Timer might already be running or not paused.'
                    });
                }
            } catch (error) {
                console.error('Timer resume error:', error.message);
                return res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to resume timer'
                });
            }

        } catch (err) {
            console.error('Resume timer error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while resuming timer'
            });
        }
    },

    // Update the stopTimer method in complaintController.js (around line 519):
    async stopTimer(req, res) {
        try {
            const { id } = req.params;
            const technician_id = req.user?.id;

            if (!technician_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            try {
                const stopped = await Complaint.stopTimer(id, technician_id);

                if (stopped) {
                    const timerStatus = await Complaint.getTimerStatus(id);
                    return res.json({
                        success: true,
                        message: 'Timer stopped and work marked as completed',
                        data: timerStatus
                    });
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Failed to stop timer.'
                    });
                }
            } catch (error) {
                console.error('Timer stop error:', error.message);
                return res.status(400).json({
                    success: false,
                    message: error.message || 'Failed to stop timer'
                });
            }

        } catch (err) {
            console.error('Stop timer error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while stopping timer'
            });
        }
    },

    // Get timer status
    async getTimerStatus(req, res) {
        try {
            const { id } = req.params;
            
            const timerStatus = await Complaint.getTimerStatus(id);

            if (timerStatus) {
                res.json({
                    success: true,
                    data: timerStatus
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }

        } catch (err) {
            console.error('Get timer status error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while getting timer status'
            });
        }
    },


    // Hold a complaint
    async holdComplaint(req, res) {
        try {
            const { id } = req.params;
            const { reason, expected_resolution_date } = req.body;
            const technician_id = req.user?.id;

            if (!technician_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!reason || reason.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Hold reason is required'
                });
            }

            const result = await Complaint.holdComplaint(
                id, 
                technician_id, 
                reason.trim(), 
                expected_resolution_date || null
            );

            res.json({
                success: true,
                message: 'Complaint placed on hold successfully',
                data: result
            });

        } catch (err) {
            console.error('Hold complaint error:', err);
            res.status(500).json({
                success: false,
                message: err.message || 'Server error while placing complaint on hold'
            });
        }
    },

    // Resume a complaint from hold
    async resumeComplaint(req, res) {
        try {
            const { id } = req.params;
            const technician_id = req.user?.id;

            if (!technician_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const result = await Complaint.resumeComplaint(id, technician_id);

            res.json({
                success: true,
                message: 'Complaint resumed successfully',
                data: result
            });

        } catch (err) {
            console.error('Resume complaint error:', err);
            res.status(500).json({
                success: false,
                message: err.message || 'Server error while resuming complaint'
            });
        }
    },

    // Get hold history for a complaint
    async getHoldHistory(req, res) {
        try {
            const { id } = req.params;

            const holdHistory = await Complaint.getHoldHistory(id);

            res.json({
                success: true,
                data: holdHistory,
                count: holdHistory.length
            });

        } catch (err) {
            console.error('Get hold history error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching hold history'
            });
        }
    },

    // Get current hold status
    async getCurrentHoldStatus(req, res) {
        try {
            const { id } = req.params;

            const holdStatus = await Complaint.getCurrentHoldStatus(id);

            res.json({
                success: true,
                data: holdStatus
            });

        } catch (err) {
            console.error('Get hold status error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching hold status'
            });
        }
    },

    // House owner closes complaint
    async houseOwnerCloseComplaint(req, res) {
        try {
            const { id } = req.params;
            const houseowner_id = req.houseowner?.id;

            if (!houseowner_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const result = await Complaint.houseOwnerClose(id, houseowner_id);

            // Check if rating exists
            const hasRating = await Complaint.hasBeenRated(id);
            
            res.json({
                success: true,
                message: result.message,
                requiresRating: !hasRating,
                data: result
            });

        } catch (err) {
            console.error('House owner close complaint error:', err);
            res.status(500).json({
                success: false,
                message: err.message || 'Server error while closing complaint'
            });
        }
    },

    // House owner reopens complaint
    async houseOwnerReopenComplaint(req, res) {
        try {
            const { id } = req.params;
            const houseowner_id = req.houseowner?.id;

            if (!houseowner_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const result = await Complaint.houseOwnerReopen(id, houseowner_id);

            res.json({
                success: true,
                message: result.message,
                data: result
            });

        } catch (err) {
            console.error('House owner reopen complaint error:', err);
            res.status(500).json({
                success: false,
                message: err.message || 'Server error while reopening complaint'
            });
        }
    },

    // Check if complaint can be rated
    async checkRatingStatus(req, res) {
        try {
            const { id } = req.params;
            const houseowner_id = req.houseowner?.id;

            if (!houseowner_id) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Get complaint
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
                return res.json({
                    success: true,
                    canRate: false,
                    reason: 'Only closed complaints can be rated'
                });
            }

            // Check if already rated
            const hasRating = await Complaint.hasBeenRated(id);
            
            if (hasRating) {
                return res.json({
                    success: true,
                    canRate: false,
                    reason: 'Already rated',
                    hasRating: true
                });
            }

            res.json({
                success: true,
                canRate: true,
                message: 'Ready to rate this complaint',
                complaint: {
                    id: complaint.id,
                    complaint_number: complaint.complaint_number,
                    title: complaint.title,
                    assigned_to_name: complaint.assigned_to_name
                }
            });

        } catch (err) {
            console.error('Check rating status error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while checking rating status'
            });
        }
    }
};

module.exports = complaintController;