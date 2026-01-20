// //controllers/complaintController.js
// const Complaint = require('../models/Complaint');

// const complaintController = {
//     // House owner creates a complaint
//     async createComplaint(req, res) {
//         try {
//             const {
//                 title,
//                 description,
//                 apartment_id,
//                 floor_id,
//                 house_id
//             } = req.body;
            
//             const houseowner_id = req.houseowner?.id;
//             const company_id = req.houseowner?.company_id;

//             if (!houseowner_id) {
//                 return res.status(401).json({
//                     success: false,
//                     message: 'Authentication required'
//                 });
//             }

//             // Validation
//             if (!title || !description || !apartment_id || !floor_id || !house_id === undefined) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Title, description, and location details are required'
//                 });
//             }
//                 const complaint = await Complaint.create({
//                     company_id,
//                     apartment_id,
//                     floor_id,
//                     house_id,
//                     houseowner_id,
//                     title,
//                     description
//                 });

//                 res.status(201).json({
//                     success: true,
//                     message: 'Complaint filed successfully',
//                     data: complaint
//                 });

//         } catch (err) {
//             console.error('Create complaint error:', err);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while filing complaint'
//             });
//         }
//     },

//     // House owner gets their complaints
//     async getMyComplaints(req, res) {
//         try {
//             const houseowner_id = req.houseowner?.id;
            
//             if (!houseowner_id) {
//                 return res.status(401).json({
//                     success: false,
//                     message: 'Authentication required'
//                 });
//             }

//             const { 
//                 status, 
//                 start_date,
//                 end_date
//             } = req.query;

//             const filters = {};
//             if (status) filters.status = status;
//             if (start_date) filters.start_date = start_date;
//             if (end_date) filters.end_date = end_date;

//             const complaints = await Complaint.findByHouseOwner(houseowner_id, filters);
//             const statistics = await Complaint.getHouseOwnerStatistics(houseowner_id);

//             res.json({
//                 success: true,
//                 data: complaints,
//                 statistics: statistics,
//                 count: complaints.length
//             });

//         } catch (err) {
//             console.error('Get my complaints error:', err);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while fetching complaints'
//             });
//         }
//     },

//     // House owner gets single complaint
//     async getComplaintById(req, res) {
//         try {
//             const { id } = req.params;
//             const houseowner_id = req.houseowner?.id;

//             const complaint = await Complaint.findById(id);

//             if (!complaint) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Complaint not found'
//                 });
//             }

//             // Verify house owner owns this complaint
//             if (complaint.houseowner_id !== houseowner_id) {
//                 return res.status(403).json({
//                     success: false,
//                     message: 'You are not authorized to view this complaint'
//                 });
//             }

//             res.json({
//                 success: true,
//                 data: complaint
//             });

//         } catch (err) {
//             console.error('Get complaint error:', err);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while fetching complaint'
//             });
//         }
//     },

//     // House owner updates their complaint (only allowed for Pending status)
//     async updateMyComplaint(req, res) {
//         try {
//             const { id } = req.params;
//             const houseowner_id = req.houseowner?.id;
//             const { title, description } = req.body;

//             // Get current complaint
//             const complaint = await Complaint.findById(id);

//             if (!complaint) {
//                 return res.status(404).json({
//                     success: false,
//                     message: 'Complaint not found'
//                 });
//             }

//             // Verify house owner owns this complaint
//             if (complaint.houseowner_id !== houseowner_id) {
//                 return res.status(403).json({
//                     success: false,
//                     message: 'You are not authorized to update this complaint'
//                 });
//             }

//             // Only allow updates if complaint is Pending
//             if (complaint.status !== 'Pending') {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Complaint can only be updated while it is Pending'
//                 });
//             }

//             const updateData = {
//                     title: title || complaint.title,
//                     description: description || complaint.description,
//                 };

//                 const updatedComplaint = await Complaint.update(id, updateData);

//                 res.json({
//                     success: true,
//                     message: 'Complaint updated successfully',
//                     data: updatedComplaint
//                 });

//         } catch (err) {
//             console.error('Update complaint error:', err);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while updating complaint'
//             });
//         }
//     },

//     // Admin/Staff gets all complaints for company
//     async getAllComplaints(req, res) {
//         try {
//             const company_id = req.user?.company_id;
            
//             if (!company_id) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Company ID is required'
//                 });
//             }

//             const { 
//                 status, 
//                 apartment_id,
//             } = req.query;

//             const filters = {};
//             if (status) filters.status = status;
//             if (apartment_id) filters.apartment_id = apartment_id;

//             const complaints = await Complaint.findByCompany(company_id, filters);
//             const statistics = await Complaint.getCompanyStatistics(company_id);

//             res.json({
//                 success: true,
//                 data: complaints,
//                 statistics: statistics,
//                 count: complaints.length
//             });

//         } catch (err) {
//             console.error('Get all complaints error:', err);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while fetching complaints'
//             });
//         }
//     },

//     // Admin/Staff updates complaint status
//     async updateComplaintStatus(req, res) {
//         try {
//             const { id } = req.params;
//             const { status} = req.body;

//             if (!status) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Status is required'
//                 });
//             }

//             const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
//             if (!validStatuses.includes(status)) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Invalid status'
//                 });
//             }

//             const updateData = { status };

//             const updatedComplaint = await Complaint.update(id, updateData);

//             res.json({
//                 success: true,
//                 message: 'Complaint status updated successfully',
//                 data: updatedComplaint
//             });

//         } catch (err) {
//             console.error('Update complaint status error:', err);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while updating complaint status'
//             });
//         }
//     },

//     // Get recent complaints for dashboard
//     async getRecentComplaints(req, res) {
//         try {
//             const houseowner_id = req.houseowner?.id;
            
//             if (!houseowner_id) {
//                 return res.status(401).json({
//                     success: false,
//                     message: 'Authentication required'
//                 });
//             }

//             const recentComplaints = await Complaint.getRecentComplaints(houseowner_id, 5);

//             res.json({
//                 success: true,
//                 data: recentComplaints
//             });

//         } catch (err) {
//             console.error('Get recent complaints error:', err);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while fetching recent complaints'
//             });
//         }
//     }
// };

// module.exports = complaintController;

// controllers/complaintController.js - COMPLETE VERSION
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
                category = 'General'
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
                category
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
            const user_id = req.user?.id;
            
            if (!company_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
            }

            const { 
                status, 
                apartment_id,
                category,
                assigned
            } = req.query;

            const filters = {};
            if (status && status !== 'all') filters.status = status;
            if (apartment_id && apartment_id !== 'all') filters.apartment_id = apartment_id;
            if (category && category !== 'all') filters.category = category;
            if (assigned && assigned !== 'all') filters.assigned = assigned;

            const complaints = await Complaint.findByCompany(company_id, filters);
            const statistics = await Complaint.getCompanyStatistics(company_id);
            const categories = await Complaint.getCategories(company_id);

            res.json({
                success: true,
                data: complaints,
                statistics: statistics,
                categories: categories || [],
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

    // Assign complaint to technician
    // async assignComplaint(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const { technician_id, assignment_note } = req.body;
    //         const assigned_by = req.user?.id;
    //         const company_id = req.user?.company_id;

    //         if (!technician_id) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: 'Technician ID is required'
    //             });
    //         }

    //         // Get the complaint first
    //         const complaint = await Complaint.findById(id);
            
    //         if (!complaint) {
    //             return res.status(404).json({
    //                 success: false,
    //                 message: 'Complaint not found'
    //             });
    //         }

    //         // Verify complaint belongs to company
    //         if (complaint.company_id !== company_id) {
    //             return res.status(403).json({
    //                 success: false,
    //                 message: 'You are not authorized to assign this complaint'
    //             });
    //         }

    //         // Check if already assigned
    //         if (complaint.assigned_to) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: 'Complaint is already assigned to a technician'
    //             });
    //         }

    //         // Assign technician
    //         const assignmentData = {
    //             technician_id,
    //             assigned_by,
    //             assignment_note
    //         };

    //         const assigned = await Complaint.assignTechnician(id, assignmentData);

    //         if (assigned) {
    //             const updatedComplaint = await Complaint.findById(id);
                
    //             res.json({
    //                 success: true,
    //                 message: 'Complaint assigned successfully',
    //                 data: updatedComplaint
    //             });
    //         } else {
    //             res.status(400).json({
    //                 success: false,
    //                 message: 'Failed to assign complaint'
    //             });
    //         }

    //     } catch (err) {
    //         console.error('Assign complaint error:', err);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Server error while assigning complaint'
    //         });
    //     }
    // },
    // controllers/complaintController.js - Update assignComplaint method
    async assignComplaint(req, res) {
        try {
            const { id } = req.params;
            const { technician_id, assignment_note, category } = req.body; // Add category here
            const assigned_by = req.user?.id;
            const company_id = req.user?.company_id;

            if (!technician_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Technician ID is required'
                });
            }

            // Get the complaint first
            const complaint = await Complaint.findById(id);
            
            if (!complaint) {
                return res.status(404).json({
                    success: false,
                    message: 'Complaint not found'
                });
            }

            // Verify complaint belongs to company
            if (complaint.company_id !== company_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to assign this complaint'
                });
            }

            // Check if already assigned
            if (complaint.assigned_to) {
                return res.status(400).json({
                    success: false,
                    message: 'Complaint is already assigned to a technician'
                });
            }

            // Assign technician WITH category
            const assignmentData = {
                technician_id,
                assigned_by,
                assignment_note: assignment_note || '',
                category: category || complaint.category // Use new category or keep existing
            };

            const assigned = await Complaint.assignTechnician(id, assignmentData);

            if (assigned) {
                const updatedComplaint = await Complaint.findById(id);
                
                res.json({
                    success: true,
                    message: 'Complaint assigned successfully',
                    data: updatedComplaint
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to assign complaint'
                });
            }

        } catch (err) {
            console.error('Assign complaint error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while assigning complaint'
            });
        }
    },

    // Get technicians by category
    // async getTechniciansByCategory(req, res) {
    //     try {
    //         const company_id = req.user?.company_id;
            
    //         if (!company_id) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: 'Company ID is required'
    //             });
    //         }

    //         const technicians = await Complaint.getTechniciansByCategory(company_id);

    //         res.json({
    //             success: true,
    //             data: technicians || [],
    //             count: (technicians || []).length
    //         });

    //     } catch (err) {
    //         console.error('Get technicians error:', err);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Server error while fetching technicians'
    //         });
    //     }
    // },

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

    // Get complaints assigned to technician
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

            const complaints = await Complaint.findByTechnician(technician_id, filters);
            const statistics = await Complaint.getTechnicianStatistics(technician_id);

            res.json({
                success: true,
                data: complaints,
                statistics: statistics,
                count: complaints.length
            });

        } catch (err) {
            console.error('Get technician complaints error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching complaints'
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

            const started = await Complaint.startTimer(id, technician_id);

            if (started) {
                const timerStatus = await Complaint.getTimerStatus(id);
                res.json({
                    success: true,
                    message: 'Timer started successfully',
                    data: timerStatus
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to start timer. Timer might already be running or complaint not assigned to you.'
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

            const paused = await Complaint.pauseTimer(id, technician_id);

            if (paused) {
                const timerStatus = await Complaint.getTimerStatus(id);
                res.json({
                    success: true,
                    message: 'Timer paused successfully',
                    data: timerStatus
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to pause timer. Timer might not be running or complaint not assigned to you.'
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

            const resumed = await Complaint.resumeTimer(id, technician_id);

            if (resumed) {
                const timerStatus = await Complaint.getTimerStatus(id);
                res.json({
                    success: true,
                    message: 'Timer resumed successfully',
                    data: timerStatus
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to resume timer. Timer might already be running or complaint not assigned to you.'
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

    // Stop/Complete timer
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

            const stopped = await Complaint.stopTimer(id, technician_id);

            if (stopped) {
                const timerStatus = await Complaint.getTimerStatus(id);
                res.json({
                    success: true,
                    message: 'Timer stopped and work marked as completed',
                    data: timerStatus
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: 'Failed to stop timer. Complaint not assigned to you.'
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
    }
};

module.exports = complaintController;