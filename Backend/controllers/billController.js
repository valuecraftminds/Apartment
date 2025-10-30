const e = require('express');
const bills = require('../models/Bill');
const Bills = require('../models/Bill');

const billController = {
    async createBill(req, res) {
        try {
            const { bill_name, billtype } = req.body;
            const company_id = req.user.company_id;
            // const apartment_id=req.apartment.id;

            // check existing tenants
            const existingBill = await Bills.findByBillName(bill_name);
            if(existingBill){
                return res.status(409).json({
                    success:false,
                    message:'Bill is already exists'
                });
            }

            // Check for similar bill names (more robust validation)
            const hasSimilarBill = await Bills.findSimilarBillName(company_id, bill_name);
            if (hasSimilarBill) {
                return res.status(409).json({
                    success: false,
                    message: 'A similar bill name already exists. Please use a different name.'
                });
            }

            if (!bill_name || !billtype === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newBill = await Bills.create({
                    bill_name,
                    billtype,
                    company_id
            });
            res.status(201).json({
            success: true,
            message: 'Bill type Added successfully',
            data: newBill
            });
        } catch (err) {
            console.error('Create bill Type error', err);
            res.status(500).json({
            success: false,
            message: 'Server error while creating bill type'
        });
        }
    },

    // Get all house
    async getAllBills(req, res) {
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

            const bills = await Bills.findByCompanyId(company_id);
            res.json({
                success: true,
                data: bills
            });
        } catch (err) {
            console.error('Get bill type error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching bills'
            });
        }
    },

    async getByApartment(req, res) {
        try {
        const { apartment_id } = req.params;
        const bills = await Bills.findByApartment(apartment_id);
        res.json(bills);
        } catch (err) {
        console.error("Error fetching bill types:", err);
        res.status(500).json({ message: "Server error" });
        }
    },

    //get bill by ID
    async getBillById(req,res){
        try{
            const {id}=req.params;
            const bills=await Bills.findById(id);

            if(!bills){
                return res.status(404).json({
                    success:false,
                    message:'bill type not found'
                });
            }

            res.json({
                success:true,
                data:bills
            });
        }catch(err){
            console.error('Get bills error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching bills'
            });
        }
    },

    //update bills
    async updateBill(req,res){
        try{
            const {id}=req.params;
            const {bill_name,billtype}=req.body;

            //check house exist
            const existingBills= await Bills.findById(id);
            if(!existingBills){
                return res.status(404).json({
                    success:false,
                    message:'Bill type not found'
                });
            }

            const updateBill= await Bills.update(id,{
                 bill_name: bill_name || existingBills.bill_name,
                 billtype: billtype || existingBills.billtype
            });

            res.json({
                success:true,
                message:'Bill type updated successfully',
                data: updateBill
            });
        }catch(err){
            console.error('Update bill type error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating bill type'
            });
        }
    },

    //Delete house
    async deleteBill(req,res){
        try{
            const {id} = req.params;

            //check if house exists
            const existingBill= await Bills.findById(id);
            if(!existingBill){
                return res.status(404).json({
                    success:false,
                    message:'Bill type not found'
                });
            }

            await Bills.delete(id);
            res.json({
                success:true,
                message:'Bill type deleted successfully'
            });
        }catch(err){
            console.error('Delete bill type error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while deleting bill type'
            });
        }
    },
    
}
module.exports=billController;