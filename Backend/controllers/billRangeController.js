const e = require('express');
const bills = require('../models/Bill');
const Bills = require('../models/Bill');
const BillRange = require('../models/BillRange');

const billRangeController = {
    async createBillRange(req, res) {
        try {
            const { bill_id, fromRange,toRange } = req.body;
            const company_id = req.user.company_id;
            // const apartment_id=req.apartment.id;

            if (!fromRange || !toRange === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newBillRange = await BillRange.create({
                    fromRange:parseFloat(fromRange),
                    toRange:parseFloat(toRange),
                    company_id,
                    bill_id
            });
            res.status(201).json({
            success: true,
            // message: 'Bill type Added successfully',
            data: newBillRange
            });
        } catch (err) {
            console.error('Create bill range error', err);
            res.status(500).json({
            success: false,
            message: 'Server error while creating bill range'
        });
        }
    },

    // Get all house
    async getAllBillRanges(req, res) {
        try {

            // Get company_id from authenticated user (from JWT token)
            const company_id = req.user.company_id; // Assuming you store company_id in JWT
            // const { apartment_id } = req.query; // take from query params
            // const { floor_id } = req.query; // take from query params

            if(!company_id){
                return res.status(400).json({
                    success:false,
                    message:'Company Id is required'
                });
            }
            // if(!apartment_id){
            //     return res.status(400).json({
            //         success:false,
            //         message:'Apartment Id is required'
            //     });
            // }
            // if(!floor_id){
            //     return res.status(400).json({
            //         success:false,
            //         message:'Floor Id is required'
            //     });
            // }


            if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

            const billRanges = await BillRange.findByCompanyId(company_id);
            res.json({
                success: true,
                data: billRanges
            });
        } catch (err) {
            console.error('Get bill range error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching bill range'
            });
        }
    },

    async getByBillId(req, res) {
        try {
        const { bill_id } = req.params;
        const billranges = await BillRange.findByBillId(bill_id);
        res.json(billranges);
        } catch (err) {
        console.error("Error fetching bill ranges:", err);
        res.status(500).json({ message: "Server error" });
        }
    },

    //get bill by ID
    async getBillRangeById(req,res){
        try{
            const {id}=req.params;
            const billRanges=await BillRange.findById(id);

            if(!billRanges){
                return res.status(404).json({
                    success:false,
                    message:'bill range is not found'
                });
            }

            res.json({
                success:true,
                data:billRanges
            });
        }catch(err){
            console.error('Get bill ranges error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching bill ranges'
            });
        }
    },

    //update bills
    async updateBillRange(req,res){
        try{
            const {id}=req.params;
            const {fromRange,toRange}=req.body;

            //check house exist
            const existingBillRanges= await BillRange.findById(id);
            if(!existingBillRanges){
                return res.status(404).json({
                    success:false,
                    message:'Bill range not found'
                });
            }

            const updateBillRange= await BillRange.update(id,{
                 fromRange: fromRange ? parseFloat(fromRange): existingBillRanges.fromRange,
                 toRange: toRange ? parseFloat(toRange): existingBillRanges.toRange,
                //  unitPrice: unitPrice ? parseFloat(unitPrice): existingBillRanges.unitPrice
            });

            res.json({
                success:true,
                message:'Bill range updated successfully',
                data: updateBillRange
            });
        }catch(err){
            console.error('Update bill range error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating bill range'
            });
        }
    },

    //Delete house
    async deleteBillRange(req,res){
        try{
            const {id} = req.params;

            //check if house exists
            const existingBillRange= await BillRange.findById(id);
            if(!existingBillRange){
                return res.status(404).json({
                    success:false,
                    message:'Bill range not found'
                });
            }

            await BillRange.delete(id);
            res.json({
                success:true,
                message:'Deleted successfully'
            });
        }catch(err){
            console.error('Delete error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while deleting bill range'
            });
        }
    },
    
}
module.exports=billRangeController;