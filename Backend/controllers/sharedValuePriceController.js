const e = require('express');
const SharedValuePrice = require('../models/SharedValuePrice');

const sharedValuePriceController = {
    async createSharedValuePrice(req, res) {
        try {
            const { bill_id, year, month, amount } = req.body;
            const company_id = req.user.company_id;

            // Validation
            if (!bill_id || !month || !year || amount === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newSharedValuePrice = await SharedValuePrice.create({
                year: parseInt(year),
                month,
                amount: parseFloat(amount),
                company_id,
                bill_id
            });

            res.status(201).json({
                success: true,
                message: 'Shared Value price created successfully',
                data: newSharedValuePrice
            });
        } catch (err) {
            console.error('Create price error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while creating price'
            });
        }
    },

    // Get all shared value prices with optional filters
    async getAllBillPrices(req, res) {
        try {
            const company_id = req.user.company_id;
            const { bill_id} = req.query;

            if (!company_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Company Id is required'
                });
            }

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            let sharedValuePrice;
            if (bill_id) {
                // Get by bill_id only
                sharedValuePrice = await SharedValuePrice.findByBillId(bill_id);
            } else {
                // Get all for company
                sharedValuePrice = await SharedValuePrice.findByCompanyId(company_id);
            }

            res.json({
                success: true,
                data: sharedValuePrice
            });
        } catch (err) {
            console.error('Get shared value prices error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching prices'
            });
        }
    },

    async getByBillId(req, res) {
        try {
            const { bill_id } = req.params;
            const sharedValuePrice = await SharedValuePrice.findByBillId(bill_id);
            
            res.json({
                success: true,
                data: sharedValuePrice
            });
        } catch (err) {
            console.error("Error fetching shared value prices by bill ID:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error while fetching prices" 
            });
        }
    },

    // async getByBillRangeId(req, res) {
    //     try {
    //         const { billrange_id } = req.params;
    //         const billPrices = await BillPrice.findByBillRangeId(billrange_id);
            
    //         res.json({
    //             success: true,
    //             data: billPrices
    //         });
    //     } catch (err) {
    //         console.error("Error fetching bill prices by bill range ID:", err);
    //         res.status(500).json({ 
    //             success: false,
    //             message: "Server error while fetching bill prices" 
    //         });
    //     }
    // },

    // Get bill price by ID
    async getSharedValuePriceById(req, res) {
        try {
            const { id } = req.params;
            const sharedValuePrice = await SharedValuePrice.findById(id);

            if (!sharedValuePrice) {
                return res.status(404).json({
                    success: false,
                    message: 'Shared value price not found'
                });
            }

            res.json({
                success: true,
                data: sharedValuePrice
            });
        } catch (err) {
            console.error('Get shared value price error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching price'
            });
        }
    },

    // Update bill price
    async updateSharedValuePrice(req, res) {
        try {
            const { id } = req.params;
            const { year, month, amount } = req.body;

            // Check if bill price exists
            const existingSharedValuePrice = await SharedValuePrice.findById(id);
            if (!existingSharedValuePrice) {
                return res.status(404).json({
                    success: false,
                    message: 'Shared value price not found'
                });
            }

            const updateData = {
                year: year ? parseInt(year) : existingSharedValuePrice.year,
                month: month || existingSharedValuePrice.month,
                amount: amount ? parseFloat(amount) : existingSharedValuePrice.amount
            };

            const updatedSharedValuePrice = await SharedValuePrice.update(id, updateData);

            res.json({
                success: true,
                message: 'Bill price updated successfully',
                data: updatedSharedValuePrice
            });
        } catch (err) {
            console.error('Update shared value price error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating price'
            });
        }
    },

    // Delete bill price
    async deleteSharedValuePrice(req, res) {
        try {
            const { id } = req.params;

            // Check if bill price exists
            const existingSharedValuePrice = await SharedValuePrice.findById(id);
            if (!existingSharedValuePrice) {
                return res.status(404).json({
                    success: false,
                    message: 'Shared value price not found'
                });
            }

            await SharedValuePrice.delete(id);
            res.json({
                success: true,
                message: 'Shared value price deleted successfully'
            });
        } catch (err) {
            console.error('Delete shared value price error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while deleting shared value price'
            });
        }
    }
};

module.exports = sharedValuePriceController;