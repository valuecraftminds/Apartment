// //controller/generateBillController.js
// const e = require('express');
// const GenerateBills = require('../models/GenerateBills');

// const generateBillController = {
//     async generateBill(req,res){
//         try{
//             const { bill_id, year,month} = req.body;
//             const company_id = req.user.company_id;

//             // Validation
//             if (!bill_id || !month || !year  === undefined) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'All fields are required'
//                 });
//             }

//             const newGenerateBills = await GenerateBills.create({
//                 year: parseInt(year),
//                 month,
//                 company_id,
//                 bill_id
//             });

//             res.status(201).json({
//                 success: true,
//                 message: 'Bill Generated successfully',
//                 data: newSharedValuePrice
//             });
//         }catch(err){
//             console.error('Generate Bill error:', err);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while Generating bill'
//             });
//         }
//     },

//     async getAllGeneratedBills(req,res) {
//         try{
//             const company_id = req.user.company_id;

//             if (!company_id) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Company Id is required'
//                 });
//             }

//             if (!req.user) {
//                 return res.status(401).json({
//                     success: false,
//                     message: 'Authentication required'
//                 });
//             }

//             const generatedBills = await GenerateBills.findByCompanyId(company_id);
//             res.json({
//                 success: true,
//                 data: generatedBills
//             });

//         }catch(err){
//             console.error('Get generated bills error', err);
//             res.status(500).json({
//                 success: false,
//                 message: 'Server error while fetching generated bills'
//             });
//         }
//     },

//     async getByBillId(req, res) {
//         try {
//         const { bill_id } = req.params;
//         const generatedBills = await GenerateBills.findByBillId(bill_id);
//         res.json(generatedBills);

//         } catch (err) {
//         console.error("Error fetching generated bills:", err);
//         res.status(500).json({ message: "Server error" });
//         }
//     },
// }
// module.exports=generateBillController;

const GenerateBills = require('../models/GenerateBills');

const generateBillController = {
    async generateBill(req, res){
        try{
            const { bill_id, year, month } = req.body;
            const company_id = req.user.company_id;

            // Validation
            if (!bill_id || !month || year === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
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

            const newGeneratedBill = await GenerateBills.create({
                year: parseInt(year),
                month,
                company_id,
                bill_id
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
}

module.exports = generateBillController;