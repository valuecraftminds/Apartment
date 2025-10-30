const e = require('express');
const BillPrice = require('../models/BillPrice');

const billPriceController = {
    async createBillPrice(req, res) {
        try {
            const { bill_id, billrange_id, year, month, unitprice, fixedamount } = req.body;
            const company_id = req.user.company_id;

            console.log('Creating bill price with data:', {
                bill_id, billrange_id, year, month, unitprice, fixedamount, company_id
            });

            // Validation
            if (!bill_id || !billrange_id || !month || !year || unitprice === undefined || fixedamount === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required including bill_id and billrange_id'
                });
            }

            const newBillPrice = await BillPrice.create({
                year: parseInt(year),
                month,
                unitprice: parseFloat(unitprice),
                fixedamount: parseFloat(fixedamount),
                company_id,
                bill_id,
                billrange_id
            });

            res.status(201).json({
                success: true,
                message: 'Bill price created successfully',
                data: newBillPrice
            });
        } catch (err) {
            console.error('Create bill price error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while creating bill price'
            });
        }
    },

    // Get all bill prices with optional filters
    async getAllBillPrices(req, res) {
        try {
            const company_id = req.user.company_id;
            const { bill_id, billrange_id } = req.query;

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

            let billPrices;
            if (bill_id && billrange_id) {
                // Get by both bill_id and billrange_id
                billPrices = await BillPrice.findByBillAndRange(bill_id, billrange_id);
            } else if (bill_id) {
                // Get by bill_id only
                billPrices = await BillPrice.findByBillId(bill_id);
            } else if (billrange_id) {
                // Get by billrange_id only
                billPrices = await BillPrice.findByBillRangeId(billrange_id);
            } else {
                // Get all for company
                billPrices = await BillPrice.findByCompanyId(company_id);
            }

            res.json({
                success: true,
                data: billPrices
            });
        } catch (err) {
            console.error('Get bill prices error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching bill prices'
            });
        }
    },

    async getByBillId(req, res) {
        try {
            const { bill_id } = req.params;
            const billPrices = await BillPrice.findByBillId(bill_id);
            
            res.json({
                success: true,
                data: billPrices
            });
        } catch (err) {
            console.error("Error fetching bill prices by bill ID:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error while fetching bill prices" 
            });
        }
    },

    async getByBillRangeId(req, res) {
        try {
            const { billrange_id } = req.params;
            const billPrices = await BillPrice.findByBillRangeId(billrange_id);
            
            res.json({
                success: true,
                data: billPrices
            });
        } catch (err) {
            console.error("Error fetching bill prices by bill range ID:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error while fetching bill prices" 
            });
        }
    },

    // Get bill price by ID
    async getBillPriceById(req, res) {
        try {
            const { id } = req.params;
            const billPrice = await BillPrice.findById(id);

            if (!billPrice) {
                return res.status(404).json({
                    success: false,
                    message: 'Bill price not found'
                });
            }

            res.json({
                success: true,
                data: billPrice
            });
        } catch (err) {
            console.error('Get bill price error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching bill price'
            });
        }
    },

    // Update bill price
    async updateBillPrice(req, res) {
        try {
            const { id } = req.params;
            const { year, month, unitprice, fixedamount } = req.body;

            // Check if bill price exists
            const existingBillPrice = await BillPrice.findById(id);
            if (!existingBillPrice) {
                return res.status(404).json({
                    success: false,
                    message: 'Bill price not found'
                });
            }

            const updateData = {
                year: year ? parseInt(year) : existingBillPrice.year,
                month: month || existingBillPrice.month,
                unitprice: unitprice ? parseFloat(unitprice) : existingBillPrice.unitprice,
                fixedamount: fixedamount ? parseFloat(fixedamount) : existingBillPrice.fixedamount
            };

            const updatedBillPrice = await BillPrice.update(id, updateData);

            res.json({
                success: true,
                message: 'Bill price updated successfully',
                data: updatedBillPrice
            });
        } catch (err) {
            console.error('Update bill price error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating bill price'
            });
        }
    },

    // Delete bill price
    async deleteBillPrice(req, res) {
        try {
            const { id } = req.params;

            // Check if bill price exists
            const existingBillPrice = await BillPrice.findById(id);
            if (!existingBillPrice) {
                return res.status(404).json({
                    success: false,
                    message: 'Bill price not found'
                });
            }

            await BillPrice.delete(id);
            res.json({
                success: true,
                message: 'Bill price deleted successfully'
            });
        } catch (err) {
            console.error('Delete bill price error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while deleting bill price'
            });
        }
    }
};

module.exports = billPriceController;