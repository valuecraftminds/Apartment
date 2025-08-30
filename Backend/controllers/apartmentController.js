const Apartment = require('../models/Apartment');

const apartmentController = {
    async createApartment(req, res) {
        try {
            const { name, address, city, floors, houses, main_picture_url, status } = req.body;
            
            // FIXED: Corrected the validation condition
            if (!name || !address || !city || floors === undefined || houses === undefined || !main_picture_url || status === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            // Validate floors is a positive number
            if (isNaN(floors) || floors < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Floors must be a positive number'
                });
            }

            // Validate houses is a positive number
            if (isNaN(houses) || houses < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Houses must be a positive number'
                });
            }

            // Create apartment - FIXED: Use Apartment.create instead of Tenant.create
            const newApartment = await Apartment.create({
                name,
                address,
                city,
                floors: parseInt(floors),
                houses: parseInt(houses),
                main_picture_url,
                status
            });

            res.status(201).json({
                success: true,
                message: 'Apartment created successfully',
                data: newApartment // FIXED: Return newApartment instead of newTenant
            });
        } catch (err) {
            console.error('Create apartment error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while creating apartment'
            });
        }
    },

    // Get all apartments
    async getAllApartments(req, res) {
        try {
            const apartments = await Apartment.findAll();
            res.json({
                success: true,
                data: apartments // This should now be an array
            });
        } catch (err) {
            console.error('Get apartments error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching apartments'
            });
        }
    },

    //get apartment by ID
    async getApartmentById(req,res){
        try{
            const {id}=req.params;
            const apartment=await Apartment.findById(id);

            if(!apartment){
                return res.status(404).json({
                    success:false,
                    message:'Apartment not found'
                });
            }

            res.json({
                success:true,
                data:apartment
            });
        }catch(err){
            console.error('Get apartment error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching apartment'
            });
        }
    },

     //update apartment
    async updateApartment(req,res){
        try{
            const {id}=req.params;
            const {name,address,city,floors,houses,main_picture_url,status}=req.body;

            //check tenant exist
            const existingApartment= await Apartment.findById(id);
            if(!existingApartment){
                return res.status(404).json({
                    success:false,
                    message:'Apartment not found'
                });
            }
            // Check if new regNo conflicts with other tenants
            // if(regNo && regNo !== existingTenant.regNo){
            //      const tenantWithRegNo = await Tenant.findByRegNo(regNo);
            //      if(tenantWithRegNo && tenantWithRegNo.id !== id){
            //         return res.status(409).json({
            //             success:false,
            //             message:'Another tenant with this registration number already exists'
            //         });
            //      }
            // }

            const updateApartment= await Apartment.update(id,{
                name: name || existingApartment.name,
                address: address || existingApartment.address,
                city: city || existingApartment.city,
                floors: floors ? parseInt(floors): existingApartment.floors,
                houses: houses ? parseInt(houses): existingApartment.houses,
                main_picture_url: main_picture_url || existingApartment.main_picture_url,
                status: status || existingApartment.status
            });

            res.json({
                success:true,
                message:'Apartment updated successfully',
                data: updateApartment
            });
        }catch(err){
            console.error('Update apartment error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating apartment'
            });
        }
    },

    //Delete Apartment
    async deleteApartment(req,res){
        try{
            const {id} = req.params;

            //check if apartment exists
            const existingApartment= await Apartment.findById(id);
            if(!existingApartment){
                return res.status(404).json({
                    success:false,
                    message:'Apartment not found'
                });
            }

            await Apartment.delete(id);
            res.json({
                success:true,
                message:'Apartment deleted successfully'
            });
        }catch(err){
            console.error('Delete apartment error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while deleting apartment'
            });
        }
    }
}

module.exports = apartmentController;