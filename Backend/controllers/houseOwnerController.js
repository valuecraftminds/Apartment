//controllers/houseOwnerController.js
const HouseOwner=require('../models/HouseOwner');
const pool = require('../db');

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'evidance/proof/';
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
    // controllers/houseOwnerController.js
async createHouseOwner(req, res) {
    try {
        const { name, nic, occupation, country, mobile, email, occupied_way, apartment_id, role_id } = req.body;
        const company_id = req.user.company_id;

        // Validate email format
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Valid email address is required'
            });
        }
        
        // Check if email already exists for this apartment
        const [existing] = await pool.execute(
            'SELECT id FROM houseowner WHERE email = ? AND apartment_id = ?',
            [email, apartment_id]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered for a house owner in this apartment'
            });
        }

        let picturePath = null;
        if (req.file) {
            picturePath = '/evidance/proof/' + req.file.filename;
        }

        if (!name || !nic || !occupation || !country || !mobile || !email || !occupied_way ) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const newHouseOwner = await HouseOwner.create({
            company_id,
            apartment_id,
            name,
            nic,
            occupation,
            country,
            mobile,
            email,
            occupied_way,
            proof: picturePath
        });

        res.status(201).json({
            success: true,
            message: 'House owner added successfully',
            data: newHouseOwner
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

    // Get house owner by house ID
    async getHouseOwnerByHouseId(req, res) {
        try {
            const { house_id, apartment_id } = req.query;

            if (!house_id) {
                return res.status(400).json({
                    success: false,
                    message: 'House ID is required'
                });
            }

            // Use the fixed method that joins with houses table
            const houseOwner = await HouseOwner.findByHouseAndApartment(house_id, apartment_id);
            
            res.json({
                success: true,
                data: houseOwner
            });

        } catch (err) {
            console.error('Get house owner by house error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching house owner'
            });
        }
    },

    //update house owner
    async updateHouseOwner(req,res){
        try{
            const {id}=req.params;
            const {name, nic, occupation, country, mobile, email, occupied_way}=req.body;

            let picturePath = null;
                if (req.file) {
                picturePath = '/evidance/proof/' + req.file.filename;
            }

            //check tenant exist
            const existingHouseOwner= await HouseOwner.findById(id);
            if(!existingHouseOwner){
                return res.status(404).json({
                    success:false,
                    message:'House owner not found'
                });
            }

            const updateHouseOwner= await HouseOwner.updateHouseOwner(id,{
                name: name || existingHouseOwner.name,
                nic: nic || existingHouseOwner.nic,
                occupation: occupation || existingHouseOwner.occupation,
                country: country || existingHouseOwner.country,
                mobile: mobile || existingHouseOwner.mobile,
                email: email || existingHouseOwner.email,
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

    async downloadProof(req, res) {
        try {
            const { id } = req.params;
            
            // Find the house owner
            const houseOwner = await HouseOwner.findById(id);
            
            if (!houseOwner) {
                return res.status(404).json({
                    success: false,
                    message: 'House owner not found'
                });
            }
            
            if (!houseOwner.proof) {
                return res.status(404).json({
                    success: false,
                    message: 'No proof document found for this house owner'
                });
            }
            
            // Clean up the file path
            let filePath = houseOwner.proof;
            
            // Remove leading slash if present
            if (filePath.startsWith('/')) {
                filePath = filePath.substring(1);
            }
            
            // Construct absolute path
            const fullPath = path.resolve(__dirname, '..', filePath);
            
            console.log('Looking for file at:', fullPath);
            console.log('Original proof path:', houseOwner.proof);
            
            // Check if file exists
            if (!fs.existsSync(fullPath)) {
                console.error('File not found at:', fullPath);
                // Try alternative path (without leading slash removal)
                const altPath = path.resolve(__dirname, '..', houseOwner.proof);
                console.log('Trying alternative path:', altPath);
                
                if (!fs.existsSync(altPath)) {
                    return res.status(404).json({
                        success: false,
                        message: 'Proof document file not found on server'
                    });
                }
            }
            
            // Get the file extension for proper content type
            const ext = path.extname(fullPath).toLowerCase();
            
            // Helper function to determine content type
            const getContentType = (extension) => {
                const contentTypes = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.gif': 'image/gif',
                    '.pdf': 'application/pdf',
                    '.doc': 'application/msword',
                    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                };
                
                return contentTypes[extension] || 'application/octet-stream';
            };
            
            const contentType = getContentType(ext);
            
            // Set headers
            const filename = path.basename(fullPath);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', contentType);
            
            // Stream the file
            const fileStream = fs.createReadStream(fullPath);
            fileStream.pipe(res);
            
            fileStream.on('error', (error) => {
                console.error('Error streaming file:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error streaming file'
                });
            });
            
        } catch (error) {
            console.error('Download proof error:', error);
            res.status(500).json({
                success: false,
                message: 'Error downloading proof document'
            });
        }
    },

    // In controllers/houseOwnerController.js, add:
    async viewProof(req, res) {
        try {
            const { id } = req.params;
            
            // Find the house owner
            const houseOwner = await HouseOwner.findById(id);
            
            if (!houseOwner) {
                return res.status(404).json({
                    success: false,
                    message: 'House owner not found'
                });
            }
            
            if (!houseOwner.proof) {
                return res.status(404).json({
                    success: false,
                    message: 'No proof document found'
                });
            }
            
            // Clean up the file path
            let filePath = houseOwner.proof;
            
            // Remove leading slash if present
            if (filePath.startsWith('/')) {
                filePath = filePath.substring(1);
            }
            
            // Construct absolute path
            const fullPath = path.resolve(__dirname, '..', filePath);
            
            // Check if file exists
            if (!fs.existsSync(fullPath)) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found on server'
                });
            }
            
            // Get the file extension
            const ext = path.extname(fullPath).toLowerCase();
            
            // Determine content type
            const contentTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.pdf': 'application/pdf',
            };
            
            const contentType = contentTypes[ext] || 'application/octet-stream';
            
            // Send the file for viewing (not download)
            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Disposition', 'inline');
            res.sendFile(fullPath);
            
        } catch (error) {
            console.error('View proof error:', error);
            res.status(500).json({
                success: false,
                message: 'Error viewing proof document'
            });
        }
    },

   

    // Get house owner's own profile
    async getMyProfile(req, res) {
        try {
            // The authenticated house owner ID comes from the middleware
            const houseowner_id = req.houseowner.id;
            
            const houseOwner = await HouseOwner.findById(houseowner_id);

            if (!houseOwner) {
                return res.status(404).json({
                    success: false,
                    message: 'House owner not found'
                });
            }

            // Return the data (exclude sensitive info if needed)
            res.json({
                success: true,
                data: houseOwner
            });
        } catch (err) {
            console.error('Get my profile error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching profile'
            });
        }
    },

    // Update house owner's own profile
    async updateMyProfile(req, res) {
        try {
            const houseowner_id = req.houseowner.id;
            const { name, nic, occupation, country, mobile, email, occupied_way } = req.body;

            // Check if house owner exists
            const existingHouseOwner = await HouseOwner.findById(houseowner_id);
            if (!existingHouseOwner) {
                return res.status(404).json({
                    success: false,
                    message: 'House owner not found'
                });
            }

            let picturePath = null;
            if (req.file) {
                picturePath = '/evidance/proof/' + req.file.filename;
            }

            // Update profile
            const updatedHouseOwner = await HouseOwner.updateHouseOwner(houseowner_id, {
                name: name || existingHouseOwner.name,
                nic: nic || existingHouseOwner.nic,
                occupation: occupation || existingHouseOwner.occupation,
                country: country || existingHouseOwner.country,
                mobile: mobile || existingHouseOwner.mobile,
                email: email || existingHouseOwner.email,
                occupied_way: occupied_way || existingHouseOwner.occupied_way,
                proof: picturePath || existingHouseOwner.proof,
            });

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedHouseOwner
            });
        } catch (err) {
            console.error('Update my profile error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating profile'
            });
        }
    },

    // In houseOwnerController.js, update the importHouseOwnerFromExcel method
    async importHouseOwnerFromExcel(req, res) {
        let connection;
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const company_id = req.user.company_id;
            const { apartment_id, house_id } = req.body;

            // Validate required fields
            if (!apartment_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Apartment ID is required'
                });
            }

            // Start a transaction
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // Parse Excel file
            const xlsx = require('xlsx');
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);
            
            if (!jsonData || jsonData.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'No data found in Excel file'
                });
            }

            // Take the first row only (single house owner)
            const rowData = jsonData[0];
            
            // Extract and validate data
            const extractedData = {
                name: rowData.name || rowData.Name || rowData.NAME || '',
                nic: rowData.nic || rowData.NIC || rowData.id || rowData.ID || '',
                occupation: rowData.occupation || rowData.Occupation || rowData.OCCUPATION || '',
                country: rowData.country || rowData.Country || rowData.COUNTRY || '',
                mobile: rowData.mobile || rowData.Mobile || rowData.MOBILE || rowData.phone || rowData.Phone || '',
                email: rowData.email || rowData.Email || rowData.EMAIL || '',
                occupied_way: rowData.occupied_way || rowData['occupied way'] || rowData.occupiedWay || 'own'
            };

            // Validate required fields
            if (!extractedData.name || !extractedData.nic || !extractedData.email) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Name, NIC and Email are required fields'
                });
            }

            // Validate email format
            if (!extractedData.email.includes('@')) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Valid email address is required'
                });
            }

            // Check if email already exists for this apartment
            const [existing] = await connection.execute(
                'SELECT id FROM houseowner WHERE email = ? AND apartment_id = ?',
                [extractedData.email, apartment_id]
            );
            
            if (existing.length > 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered for a house owner in this apartment'
                });
            }

            // Get the House Owner role_id for this company
            let role_id = null;
            const [roleRows] = await connection.execute(
                'SELECT id FROM roles WHERE company_id = ? AND role_name = ? AND is_active = 1 LIMIT 1',
                [company_id, 'House Owner']
            );
            
            if (roleRows.length > 0) {
                role_id = roleRows[0].id;
            }

            // Create the house owner
            const houseOwnerId = uuidv4().replace(/-/g, '').substring(0, 10);
            
            await connection.execute(
                `INSERT INTO houseowner 
                (id, company_id, apartment_id, name, nic, occupation, country, mobile, email, occupied_way, proof, 
                is_active, is_verified, created_at, updated_at, role_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW(), ?)`,
                [
                    houseOwnerId, 
                    company_id, 
                    apartment_id, 
                    extractedData.name,
                    extractedData.nic,
                    extractedData.occupation,
                    extractedData.country,
                    extractedData.mobile,
                    extractedData.email,
                    extractedData.occupied_way,
                    null, // No proof from Excel import
                    role_id
                ]
            );

            const newHouseOwner = {
                id: houseOwnerId,
                company_id,
                apartment_id,
                ...extractedData,
                role_id
            };

            let houseData = null;
            
            // If house_id is provided, link the house owner to the house
            if (house_id) {
                // First, check if the house exists and belongs to the same apartment
                const [houseRows] = await connection.execute(
                    'SELECT id, house_id, floor_id, status FROM houses WHERE id = ? AND apartment_id = ?',
                    [house_id, apartment_id]
                );
                
                if (houseRows.length > 0) {
                    houseData = houseRows[0];
                    
                    // Update the house to link with the new owner
                    await connection.execute(
                        'UPDATE houses SET houseowner_id = ?, status = ? WHERE id = ?',
                        [houseOwnerId, 'occupied', house_id]
                    );
                    
                    // Also update the house data status
                    houseData.status = 'occupied';
                } else {
                    console.warn(`House ${house_id} not found in apartment ${apartment_id}`);
                }
            }

            // Commit the transaction
            await connection.commit();

            // Send verification email if email is provided
            try {
                // Use axios for internal API call
                const axios = require('axios');
                await axios.post('http://localhost:2500/api/houseowner-auth/admin/send-verification', {
                    houseowner_id: houseOwnerId,
                    email: extractedData.email
                }, {
                    headers: {
                        'Authorization': req.headers['authorization']
                    }
                });
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
                // Continue even if email fails - don't rollback
            }

            res.json({
                success: true,
                message: 'House owner imported successfully' + (house_id ? ' and linked to house' : ''),
                data: {
                    houseOwner: newHouseOwner,
                    house: houseData,
                    importedFrom: {
                        fileName: req.file.originalname,
                        importedAt: new Date().toISOString()
                    }
                }
            });

        } catch (error) {
            console.error('Excel import error:', error);
            
            // Rollback transaction if connection exists
            if (connection) {
                await connection.rollback();
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to import house owner from Excel',
                error: error.message
            });
        } finally {
            // Release connection
            if (connection) {
                connection.release();
            }
        }
    }
}
module.exports=houseOwnerController;