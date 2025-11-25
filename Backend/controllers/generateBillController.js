// //controller/generateBillController.js
const GenerateBills = require('../models/GenerateBills');

const generateBillController = {
    async generateBill(req, res){
    try{
        const { bill_id, year, month, totalAmount, assignedHouses, unitPrice } = req.body;
        const company_id = req.user.company_id;

        // Validation
        if (!bill_id || !month || year === undefined || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Bill ID, year, month, and total amount are required'
            });
        }

        // Check for duplicate
        const isDuplicate = await GenerateBills.checkDuplicate(company_id, bill_id, parseInt(year), month);
        if (isDuplicate) {
            return res.status(400).json({
                success: false,
                message: 'Bill already generated for this period'
            });
        }

        const unitPriceValue = unitPrice && unitPrice.unitPrice ? unitPrice.unitPrice : 0;

        const newGeneratedBill = await GenerateBills.create({
            year: parseInt(year),
            month,
            company_id,
            bill_id,
            totalAmount: parseFloat(totalAmount),
            assignedHouses: assignedHouses || 0,
            unitPrice: unitPriceValue 
        });

        res.status(201).json({
            success: true,
            message: 'Bill generated successfully',
            data: newGeneratedBill
        });
    } catch(err) {
        console.error('Generate Bill error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while generating bill'
        });
    }
},

    async generateBulkBills(req, res) {
        try {
            const { bills } = req.body; // Array of {bill_id, year, month}
            const company_id = req.user.company_id;

            if (!Array.isArray(bills) || bills.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bills array is required'
                });
            }

            const generatedBills = [];
            const errors = [];

            for (const bill of bills) {
                try {
                    const { bill_id, year, month } = bill;
                    
                    // Check for duplicate
                    const isDuplicate = await GenerateBills.checkDuplicate(company_id, bill_id, parseInt(year), month);
                    if (!isDuplicate) {
                        const newBill = await GenerateBills.create({
                            year: parseInt(year),
                            month,
                            company_id,
                            bill_id
                        });
                        generatedBills.push(newBill);
                    } else {
                        errors.push(`Bill ${bill_id} already generated for ${month} ${year}`);
                    }
                } catch (error) {
                    errors.push(`Failed to generate bill ${bill.bill_id}: ${error.message}`);
                }
            }

            res.status(201).json({
                success: true,
                message: `Successfully generated ${generatedBills.length} bills`,
                data: generatedBills,
                errors: errors.length > 0 ? errors : undefined
            });

        } catch (err) {
            console.error('Generate bulk bills error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while generating bills'
            });
        }
    },

    async getAllGeneratedBills(req, res) {
        try{
            const company_id = req.user.company_id;

            if (!company_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Company Id is required'
                });
            }

            const generatedBills = await GenerateBills.findByCompanyId(company_id);
            
            res.json({
                success: true,
                data: generatedBills
            });

        } catch(err) {
            console.error('Get generated bills error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching generated bills'
            });
        }
    },

    async getByBillId(req, res) {
        try {
            const { bill_id } = req.params;
            const generatedBills = await GenerateBills.findByBillId(bill_id);
            
            res.json({
                success: true,
                data: generatedBills
            });

        } catch (err) {
            console.error("Error fetching generated bills:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error" 
            });
        }
    },

    // Get generate bill by ID
    async getGenerateBillById(req, res) {
        try {
            const { id } = req.params;
            const generatedBill = await GenerateBills.findById(id);

            if (!generatedBill) {
                return res.status(404).json({
                    success: false,
                    message: 'Generated bill not found'
                });
            }

            res.json({
                success: true,
                data: generatedBill
            });
        } catch (err) {
            console.error('Get generated bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching generated bill'
            });
        }
    },

    async UpdateGenerateBills(req,res){
        try{
            const { id } = req.params;
            const { year, month, totalAmount, unitPrice } = req.body;

            // Check if bill price exists
            const existingGeneratedBill = await GenerateBills.findById(id);
            if (!existingGeneratedBill) {
                return res.status(404).json({
                    success: false,
                    message: 'Generated Bill not found'
                });
            }

            const updateData = {
                year: year ? parseInt(year) : existingGeneratedBill.year,
                month: month || existingGeneratedBill.month,
                totalAmount: totalAmount ? parseFloat(totalAmount) : existingGeneratedBill.totalAmount,
                unitPrice: unitPrice ? parseFloat(unitPrice) : existingGeneratedBill.unitPrice // Store as number
            };

            const updatedGeneratedBill = await GenerateBills.update(id, updateData);

            res.json({
                success: true,
                message: 'Generated Bill updated successfully',
                data: updatedGeneratedBill
            });
        }catch(err){
            console.error('Update generated bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating generated bill'
            });
        }
    },

    async deleteGeneratedBill(req,res){
        try{
            const { id } = req.params;

            // Check if bill price exists
            const existingGeneratedBill = await GenerateBills.findById(id);
            if (!existingGeneratedBill) {
                return res.status(404).json({
                    success: false,
                    message: 'Generated bill not found'
                });
            }

            await GenerateBills.delete(id);
            res.json({
                success: true,
                message: 'Generated bill deleted successfully'
            });
        }catch(err){
            console.error('Delete generated bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while deleting generated bill'
            });
        }
    }
}

module.exports = generateBillController;