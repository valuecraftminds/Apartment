const pool = require('../db');
const BillAssignment = require('../models/BillAssignment');
const Bill = require('../models/Bill'); // Assuming you have a Bill model

const billAssignmentController = {
    // Assign bill to multiple houses
    async assignBill(req, res) {
        const connection = await pool.getConnection();
        try {
            const { bill_id, apartment_id, floor_id, house_ids } = req.body;

            // Validation
            if (!bill_id || !apartment_id || !floor_id || !house_ids || !Array.isArray(house_ids) || house_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill ID, apartment ID, floor ID, and house IDs are required'
                });
            }

            await connection.beginTransaction();

            // Check if bill exists
            const bill = await Bill.findById(bill_id);
            if (!bill) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Bill type not found'
                });
            }

            const assignments = [];
            const skippedHouses = [];

            for (const house_id of house_ids) {
                // Check if bill is already assigned to this house
                const existingAssignment = await BillAssignment.checkExistingAssignment(bill_id, house_id);
                
                if (existingAssignment) {
                    skippedHouses.push(house_id);
                    continue; // Skip already assigned houses
                }

                assignments.push({
                    bill_id,
                    apartment_id,
                    floor_id,
                    house_id
                });
            }

            // Create new assignments
            let createdAssignments = [];
            if (assignments.length > 0) {
                createdAssignments = await BillAssignment.createMultiple(assignments);
            }

            await connection.commit();

            const response = {
                success: true,
                message: `Bill assigned successfully to ${createdAssignments.length} house(s)`,
                data: {
                    assigned: createdAssignments,
                    skipped: skippedHouses.length
                }
            };

            if (skippedHouses.length > 0) {
                response.message += `, ${skippedHouses.length} house(s) were already assigned`;
            }

            res.status(201).json(response);

        } catch (err) {
            await connection.rollback();
            console.error('Assign bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while assigning bill'
            });
        } finally {
            connection.release();
        }
    },

    // Get assignments by bill ID
    async getAssignmentsByBill(req, res) {
        try {
            const { bill_id } = req.params;

            if (!bill_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill ID is required'
                });
            }

            const assignments = await BillAssignment.findByBillId(bill_id);

            res.json({
                success: true,
                data: assignments
            });

        } catch (err) {
            console.error('Get assignments error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching assignments'
            });
        }
    },

    // Get assignments by house ID
    async getAssignmentsByHouse(req, res) {
        try {
            const { house_id } = req.params;

            if (!house_id) {
                return res.status(400).json({
                    success: false,
                    message: 'House ID is required'
                });
            }

            const assignments = await BillAssignment.findByHouseId(house_id);

            res.json({
                success: true,
                data: assignments
            });

        } catch (err) {
            console.error('Get house assignments error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching house assignments'
            });
        }
    },

    // Get assignments with filters
    async getAssignments(req, res) {
        try {
            const { bill_id, apartment_id, floor_id, house_id, is_active } = req.query;
            
            const filters = {};
            if (bill_id) filters.bill_id = bill_id;
            if (apartment_id) filters.apartment_id = apartment_id;
            if (floor_id) filters.floor_id = floor_id;
            if (house_id) filters.house_id = house_id;
            if (is_active !== undefined) filters.is_active = is_active === 1;

            const assignments = await BillAssignment.findWithFilters(filters);

            res.json({
                success: true,
                data: assignments
            });

        } catch (err) {
            console.error('Get filtered assignments error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching assignments'
            });
        }
    },

    // Deactivate assignment
    async deactivateAssignment(req, res) {
        try {
            const { id } = req.params;

            const assignment = await BillAssignment.findById(id);
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignment not found'
                });
            }

            await BillAssignment.deactivate(id);

            res.json({
                success: true,
                message: 'Assignment deactivated successfully'
            });

        } catch (err) {
            console.error('Deactivate assignment error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while deactivating assignment'
            });
        }
    },

    // Reactivate assignment
    async reactivateAssignment(req, res) {
        try {
            const { id } = req.params;

            const assignment = await BillAssignment.findById(id);
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignment not found'
                });
            }

            await BillAssignment.reactivate(id);

            res.json({
                success: true,
                message: 'Assignment reactivated successfully'
            });

        } catch (err) {
            console.error('Reactivate assignment error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while reactivating assignment'
            });
        }
    },

    // Delete assignment
    async deleteAssignment(req, res) {
        try {
            const { id } = req.params;

            const assignment = await BillAssignment.findById(id);
            if (!assignment) {
                return res.status(404).json({
                    success: false,
                    message: 'Assignment not found'
                });
            }

            await BillAssignment.delete(id);

            res.json({
                success: true,
                message: 'Assignment deleted successfully'
            });

        } catch (err) {
            console.error('Delete assignment error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while deleting assignment'
            });
        }
    },

    // Remove bill assignment from specific houses
    async removeAssignment(req, res) {
        const connection = await pool.getConnection();
        try {
            const { bill_id } = req.params;
            const { house_ids } = req.body;

            if (!bill_id || !house_ids || !Array.isArray(house_ids) || house_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill ID and house IDs are required'
                });
            }

            await connection.beginTransaction();

            await BillAssignment.deleteByBillAndHouses(bill_id, house_ids);

            await connection.commit();

            res.json({
                success: true,
                message: `Bill assignment removed from ${house_ids.length} house(s)`
            });

        } catch (err) {
            await connection.rollback();
            console.error('Remove assignment error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while removing assignment'
            });
        } finally {
            connection.release();
        }
    }
};

module.exports = billAssignmentController;