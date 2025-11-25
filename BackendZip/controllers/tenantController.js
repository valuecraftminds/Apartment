const { pool } = require('../db');
const Tenant = require('../models/Tenant');

const tenantController = {
    async createTenant(req,res){
        try{
            const {regNo,name, address}=req.body;
            if(!regNo || !name || !address === undefined){
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }
            
            // check existing tenants
            const existingTenant = await Tenant.findByRegNo(regNo);
            if(existingTenant){
                return res.status(409).json({
                    success:false,
                    message:'Tenant is already exists'
                });
            }

            //Validate employees is a positive number
            // if(isNaN(employees) || employees < 1){
            //     return res.status(400).json({
            //         success:false,
            //         message: 'Employees must be a positive number'
            //     });
            // }

            //create tenant
            const newTenant=await Tenant.create({
                regNo,
                name,
                address
            });

            res.status(201).json({
                success:true,
                message:'Tenant created successfully',
                data:newTenant
            });

        }catch(err){
            console.error('Create tenant error',err);
            res.status(500).json({
                success:false,
                message:'Server error while creating tenant'
            });
        }
    },

    //get all tenants
    async getAllTenants(req,res){
        try{
            const tenants = await Tenant.findAll();
            res.json({
                success:true,
                data:tenants
            });
        }catch(err){
            console.error('Get tenants error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching tenants'
            });
        }
    },

    //get tenant by ID
    async getTenantById(req,res){
        try{
            const {id}=req.params;
            const tenant=await Tenant.findById(id);

            if(!tenant){
                return res.status(404).json({
                    success:false,
                    message:'Tenant not found'
                });
            }

            res.json({
                success:true,
                data:tenant
            });
        }catch(err){
            console.error('Get tenant error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching tenant'
            });
        }
    },

    //update tenant
    async updateTenant(req,res){
        try{
            const {id}=req.params;
            const {regNo,name,address}=req.body;

            //check tenant exist
            const existingTenant= await Tenant.findById(id);
            if(!existingTenant){
                return res.status(404).json({
                    success:false,
                    message:'Tenant not found'
                });
            }
            // Check if new regNo conflicts with other tenants
            if(regNo && regNo !== existingTenant.regNo){
                 const tenantWithRegNo = await Tenant.findByRegNo(regNo);
                 if(tenantWithRegNo && tenantWithRegNo.id !== id){
                    return res.status(409).json({
                        success:false,
                        message:'Another tenant with this registration number already exists'
                    });
                 }
            }

            const updateTenant= await Tenant.update(id,{
                regNo: regNo || existingTenant.regNo, // Keep existing regNo if not provided
                name: name || existingTenant.name,
                address: address || existingTenant.address
            });

            res.json({
                success:true,
                message:'Tenant updated successfully',
                data: updateTenant
            });
        }catch(err){
            console.error('Update tenant error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating tenant'
            });
        }
    },

    //Delete tenant
    async deleteTenant(req,res){
        try{
            const {id} = req.params;

            //check if tenant exists
            const existingTenant= await Tenant.findById(id);
            if(!existingTenant){
                return res.status(404).json({
                    success:false,
                    message:'Tenant not found'
                });
            }

            await Tenant.delete(id);
            res.json({
                success:true,
                message:'Tenant deleted successfully'
            });
        }catch(err){
            console.error('Delete tenant error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while deleting tenant'
            });
        }
    }
};

module.exports=tenantController;