const e = require('express');
const Billprice = require('../models/BillPrice');

const billPriceController = {
    async createBillPrice(req, res) {
        try {
            const { bill_id,billrange_id, year,month,unitprice,fixedamount } = req.body;
            const company_id = req.user.company_id;
            // const apartment_id=req.apartment.id;

            if (year || !month || unitprice || fixedamount === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newBillPrice = await Billprice.create({
                    year:parseInt(year),
                    month,
                    unitprice:parseFloat(unitprice),
                    fixedamount:parseFloat(fixedamount),
                    company_id,
                    bill_id,
                    billrange_id
            });
            res.status(201).json({
            success: true,
            // message: 'Bill type Added successfully',
            data: newBillPrice
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
    async getAllBillPrices(req, res) {
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

            const billPrice = await Billprice.findByCompanyId(company_id);
            res.json({
                success: true,
                data: billPrice
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
        const billprice = await Billprice.findByBillId(bill_id);
        res.json(billprice);
        } catch (err) {
        console.error("Error fetching bill range price:", err);
        res.status(500).json({ message: "Server error" });
        }
    },

    async getByBillRangeId(req, res) {
        try {
        const { billrange_id } = req.params;
        const billPrice = await Billprice.findByBillRangeId(billrange_id);
        res.json(billPrice);
        } catch (err) {
        console.error("Error fetching bill range price by bill range :", err);
        res.status(500).json({ message: "Server error" });
        }
    },

    //get bill by ID
    async getBillPriceById(req,res){
        try{
            const {id}=req.params;
            const billPrice=await Billprice.findById(id);

            if(!billPrice){
                return res.status(404).json({
                    success:false,
                    message:'bill range price is not found'
                });
            }

            res.json({
                success:true,
                data:billPrice
            });
        }catch(err){
            console.error('Get bill range price error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching bill range price'
            });
        }
    },

    //update bill range price
    async updateBillRangePrice(req,res){
        try{
            const {id}=req.params;
            const {year,month,unitprice,fixedamount}=req.body;

            //check house exist
            const existingBillRangePrice= await Billprice.findById(id);
            if(!existingBillRangePrice){
                return res.status(404).json({
                    success:false,
                    message:'Bill range price not found'
                });
            }

            const updateBillRangePrice= await Billprice.update(id,{
                 year: year ? parseInt(year): existingBillRangePrice.year,
                 month:existingBillRangePrice.month,
                 unitprice: unitprice ? parseFloat(unitprice): existingBillRangePrice.unitprice,
                 fixedamount: fixedamount ? parseFloat(fixedamount): existingBillRangePrice.fixedamount
                //  unitPrice: unitPrice ? parseFloat(unitPrice): existingBillRanges.unitPrice
            });

            res.json({
                success:true,
                message:'Bill range price updated successfully',
                data: updateBillRangePrice
            });
        }catch(err){
            console.error('Update bill range price error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating bill range price'
            });
        }
    },

    //Delete house
    async deleteBillRangePrice(req,res){
        try{
            const {id} = req.params;

            //check if house exists
            const existingBillRangePrice= await Billprice.findById(id);
            if(!existingBillRangePrice){
                return res.status(404).json({
                    success:false,
                    message:'Bill range price not found'
                });
            }

            await Billprice.delete(id);
            res.json({
                success:true,
                message:'Deleted successfully'
            });
        }catch(err){
            console.error('Delete error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while deleting bill range price'
            });
        }
    },
    
}
module.exports=billPriceController;