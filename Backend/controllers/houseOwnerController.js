const HouseOwner=require('../models/HouseOwner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'evidance/houseOwner/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'e_ho-' + uniqueSuffix + path.extname(file.originalname));
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

const houseOwnerController ={
    async createHouseOwner(req, res) {
        try {
            const { name, nic, marital_status, occupation, country, mobile, occupied_way } = req.body;
            const company_id = req.user.company_id;
            const apartment_id = req.apartment.id;


            let picturePath = null;
            if (req.file) {
                picturePath = '/evidance/houseOwner/' + req.file.filename;
            }

            if (!name || !nic || !marital_status || occupation || country || mobile || occupied_way ) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newApartment = await HouseOwner.create({
                    company_id,
                    apartment_id,
                    name,
                    nic,
                    marital_status,
                    occupation,
                    country,
                    mobile,
                    occupied_way,
                    proof: picturePath // Store the path, not the binary
                    
            });
            res.status(201).json({
            success: true,
            message: 'House owner added successfully',
            data: newApartment
            });
        } catch (err) {
            console.error('Add house owner error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while adding house owner'
            });
        }
    },

    // Get all house
    async getAllHouseOwner(req, res) {
        try {

            // Get company_id from authenticated user (from JWT token)
            const company_id = req.user.company_id; // Assuming you store company_id in JWT
            const { apartment_id } = req.query; // take from query params

            if(!company_id){
                return res.status(400).json({
                    success:false,
                    message:'Company Id is required'
                });
            }
            if(!apartment_id){
                return res.status(400).json({
                    success:false,
                    message:'Apartment Id is required'
                });
            }

            if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

            const houseOwner = await HouseOwner.findByApartment(apartment_id);
            res.json({
                success: true,
                data: houseOwner
            });
        } catch (err) {
            console.error('Get house owner error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching house owner'
            });
        }
    },

    //get house owner by ID
    async getHouseOwnerById(req,res){
        try{
            const {id}=req.params;
            const houseOwner=await HouseOwner.findById(id);

            if(!houseOwner){
                return res.status(404).json({
                    success:false,
                    message:'house owner not found'
                });
            }

            res.json({
                success:true,
                data:houseOwner
            });
        }catch(err){
            console.error('Get house owner error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching house owner'
            });
        }
    },

    //update house owner
    async updateHouseOwner(req,res){
        try{
            const {id}=req.params;
            const {name, nic, marital_status, occupation, country, mobile, occupied_way}=req.body;

            let picturePath = null;
                if (req.file) {
                picturePath = '/evidance/houseOwner/' + req.file.filename;
            }

            //check tenant exist
            const existingHouseOwner= await HouseOwner.findById(id);
            if(!existingHouseOwner){
                return res.status(404).json({
                    success:false,
                    message:'House owner not found'
                });
            }

            const updateHouseOwner= await HouseOwner.update(id,{
                name: name || existingHouseOwner.name,
                nic: nic || existingHouseOwner.nic,
                marital_status: marital_status || existingHouseOwner.marital_status,
                occupation: occupation || existingHouseOwner.occupation,
                country: country || existingHouseOwner.country,
                mobile: mobile || existingHouseOwner.mobile,
                occupied_way:occupied_way || existingHouseOwner.occupied_way,
                proof: picturePath || existingHouseOwner.proof,
            });

            res.json({
                success:true,
                message:'House owner updated successfully',
                data: updateHouseOwner
            });
        }catch(err){
            console.error('Update house owner error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating house owner'
            });
        }
    },

}
module.exports=houseOwnerController;