const e = require('express');
const Roles = require('../models/Role');

const roleController = {
    async createRole(req, res) {
        try {
            const { role_name } = req.body;
            const company_id = req.user.company_id;
            // const apartment_id=req.apartment.id;

            // check existing bills
            // const existingBill = await Bills.findByBillName(bill_name);
            // if(existingBill){
            //     return res.status(409).json({
            //         success:false,
            //         message:'Bill is already exists'
            //     });
            // }

            // Check for similar bill names (more robust validation)
            const hasSimilarRole = await Roles.findSimilarRoleName(company_id, role_name);
            if (hasSimilarRole) {
                return res.status(409).json({
                    success: false,
                    message: 'Role is already exists'
                });
            }

            if (!role_name === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newRole = await Roles.create({
                    role_name,
                    company_id
            });
            res.status(201).json({
            success: true,
            message: 'Role Added successfully',
            data: newRole
            });
        } catch (err) {
            console.error('Create role error', err);
            res.status(500).json({
            success: false,
            message: 'Server error while creating role'
        });
        }
    },

    // Get all house
    async getAllRoles(req, res) {
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

            const roles = await Roles.findByCompanyId(company_id);
            res.json({
                success: true,
                data: roles
            });
        } catch (err) {
            console.error('Get role error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching roles'
            });
        }
    },

    async getByApartment(req, res) {
        try {
        const { apartment_id } = req.params;
        const roles = await Roles.findByApartment(apartment_id);
        res.json(roles);
        } catch (err) {
        console.error("Error fetching roles:", err);
        res.status(500).json({ message: "Server error" });
        }
    },

    //get bill by ID
    async getRoleById(req,res){
        try{
            const {id}=req.params;
            const role=await Roles.findById(id);

            if(!role){
                return res.status(404).json({
                    success:false,
                    message:'Role does not found'
                });
            }

            res.json({
                success:true,
                data:role
            });
        }catch(err){
            console.error('Get roles error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching roles'
            });
        }
    },

    //update roles
    async updateRoles(req,res){
        try{
            const {id}=req.params;
            const {role_name}=req.body;

            //check house exist
            const existingRoles= await Roles.findById(id);
            if(!existingRoles){
                return res.status(404).json({
                    success:false,
                    message:'Role does not found'
                });
            }

            const updateRole= await Roles.update(id,{
                 role_name: role_name || existingRoles.role_name
            });

            res.json({
                success:true,
                message:'Role updated successfully',
                data: updateRole
            });
        }catch(err){
            console.error('Update role error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating role'
            });
        }
    },

    //Delete role
    async deleteRole(req,res){
        try{
            const {id} = req.params;

            //check if house exists
            const existingRole= await Roles.findById(id);
            if(!existingRole){
                return res.status(404).json({
                    success:false,
                    message:'Role does not found'
                });
            }

            await Roles.delete(id);
            res.json({
                success:true,
                message:'Role deleted successfully'
            });
        }catch(err){
            console.error('Delete role error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while deleting role'
            });
        }
    },
    
}
module.exports=roleController;