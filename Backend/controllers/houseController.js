const e = require('express');
const House = require('../models/House');

const houseController = {
    async createHouse(req, res) {
        try {
            const { house_id,type, rooms,sqrfeet,bathrooms,status,occupied_way } = req.body;
            const company_id = req.user.company_id;
            const apartment_id=req.apartment.id;
            const floor_id=req.floor.id;
            const house_owner_id = req.house_owner.id;

            if (!house_id || !type || sqrfeet === undefined || rooms === undefined || bathrooms === undefined || !status || !occupied_way === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newHouse = await House.create({
                    house_id,
                    type,
                    sqrfeet:parseFloat(sqrfeet),
                    rooms:parseInt(rooms),
                    bathrooms:parseInt(bathrooms),
                    status,
                    occupied_way,
                    company_id,
                    apartment_id,
                    floor_id,
                    house_owner_id
            });
            res.status(201).json({
            success: true,
            message: 'House Added successfully',
            data: newHouse
            });
        } catch (err) {
            console.error('Create House error', err);
            res.status(500).json({
            success: false,
            message: 'Server error while creating house'
        });
    }
},
    // Get all house
    async getAllHouses(req, res) {
        try {

            // Get company_id from authenticated user (from JWT token)
            const company_id = req.user.company_id; // Assuming you store company_id in JWT
            const { apartment_id } = req.query; // take from query params
            const { floor_id } = req.query; // take from query params

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
            if(!floor_id){
                return res.status(400).json({
                    success:false,
                    message:'Floor Id is required'
                });
            }


            if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

            const houses = await House.findByApartmentAndFloor(apartment_id, floor_id);
            res.json({
                success: true,
                data: houses
            });
        } catch (err) {
            console.error('Get house error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching houses'
            });
        }
    },

    //get house by ID
    async getHouseById(req,res){
        try{
            const {id}=req.params;
            const house=await House.findById(id);

            if(!house){
                return res.status(404).json({
                    success:false,
                    message:'house not found'
                });
            }

            res.json({
                success:true,
                data:house
            });
        }catch(err){
            console.error('Get house error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching houses'
            });
        }
    },

     //update houses
    async updateHouse(req,res){
        try{
            const {id}=req.params;
            const {house_id, type,sqrfeet, rooms, bathrooms, status, occupied_way}=req.body;

            //check house exist
            const existingHouse= await House.findById(id);
            if(!existingHouse){
                return res.status(404).json({
                    success:false,
                    message:'House not found'
                });
            }

            const updateHouse= await House.update(id,{
                house_id: house_id || existingHouse.house_id,
                type: type || existingHouse.type,
                sqrfeet:sqrfeet ?parseFloat(sqrfeet): existingHouse.sqrfeet,
                rooms:rooms ? parseInt(rooms):existingHouse.rooms,
                bathrooms:bathrooms ?parseInt(bathrooms): existingHouse.bathrooms,
                status: status || existingHouse.status,
                occupied_way: occupied_way || existingHouse.occupied_way
            });

            res.json({
                success:true,
                message:'House updated successfully',
                data: updateHouse
            });
        }catch(err){
            console.error('Update house error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating house'
            });
        }
    },

    //Delete house
    async deleteHouse(req,res){
        try{
            const {id} = req.params;

            //check if house exists
            const existingHouse= await House.findById(id);
            if(!existingHouse){
                return res.status(404).json({
                    success:false,
                    message:'House not found'
                });
            }

            await House.delete(id);
            res.json({
                success:true,
                message:'House deleted successfully'
            });
        }catch(err){
            console.error('Delete house error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while deleting house'
            });
        }
    }
}

module.exports = houseController;