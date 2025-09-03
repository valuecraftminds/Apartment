const Apartment = require('../models/Apartment');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/images/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'apartment-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

const apartmentController = {
    async createApartment(req, res) {
        try {
            const { name, address, city, floors, houses, status } = req.body;
            const company_id = req.user.company_id;

            let picturePath = null;
            if (req.file) {
                picturePath = '/uploads/images/' + req.file.filename;
            }

            if (!name || !address || !city || floors === undefined || houses === undefined || status === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newApartment = await Apartment.create({
                    name,
                    address,
                    city,
                    floors: parseInt(floors),
                    houses: parseInt(houses),
                    picture: picturePath, // Store the path, not the binary
                    status,
                    company_id
            });
            res.status(201).json({
            success: true,
            message: 'Apartment created successfully',
            data: newApartment
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

            // Get company_id from authenticated user (from JWT token)
            const company_id = req.user.company_id; // Assuming you store company_id in JWT

            if(!company_id){
                return res.status(400).json({
                    success:false,
                    message:'Company Id is required'
                });
            }

            if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

            const apartments = await Apartment.findByCompanyId(company_id)
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
            const {name,address,city,floors,houses,picture,status}=req.body;

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
                picture: picture || existingApartment.picture,
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