const e = require('express');
const HouseType = require('../models/HouseType');

const houseTypeController = {
    async createHouseType(req, res) {
        try {
            const { name, members, rooms, sqrfeet, bathrooms,apartment_id } = req.body;
            const company_id = req.user.company_id;
            // const apartment_id=req.apartment.id;

            if (!name || members === undefined || sqrfeet === undefined || rooms === undefined || bathrooms === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newHouseType = await HouseType.create({
                    name,
                    members,
                    sqrfeet:parseFloat(sqrfeet),
                    rooms:parseInt(rooms),
                    bathrooms:parseInt(bathrooms),
                    company_id,
                    apartment_id
            });
            res.status(201).json({
            success: true,
            message: 'House Type Added successfully',
            data: newHouseType
            });
        } catch (err) {
            console.error('Create House Type error', err);
            res.status(500).json({
            success: false,
            message: 'Server error while creating house type'
        });
    }
},
    // Get all house
    async getAllHouseTypes(req, res) {
        try {

            // Get company_id from authenticated user (from JWT token)
            const company_id = req.user.company_id; // Assuming you store company_id in JWT
            const { apartment_id } = req.query; // take from query params
            // const { floor_id } = req.query; // take from query params

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

            const houseTypes = await HouseType.findByApartment(apartment_id);
            res.json({
                success: true,
                data: houseTypes
            });
        } catch (err) {
            console.error('Get house type error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching house types'
            });
        }
    },

    async getByApartment(req, res) {
    try {
      const { apartment_id } = req.params;
      const houseTypes = await HouseType.findByApartment(apartment_id);
      res.json(houseTypes);
    } catch (err) {
      console.error("Error fetching house types:", err);
      res.status(500).json({ message: "Server error" });
    }
  },

    //get house by ID
    async getHouseTypeById(req,res){
        try{
            const {id}=req.params;
            const houseType=await HouseType.findById(id);

            if(!houseType){
                return res.status(404).json({
                    success:false,
                    message:'house type not found'
                });
            }

            res.json({
                success:true,
                data:houseType
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
    async updateHouseType(req,res){
        try{
            const {id}=req.params;
            const {members,sqrfeet, rooms, bathrooms}=req.body;

            //check house exist
            const existingHouseType= await HouseType.findById(id);
            if(!existingHouseType){
                return res.status(404).json({
                    success:false,
                    message:'House type not found'
                });
            }

            const updateHouseType= await HouseType.update(id,{
                members: members ? parseInt(members):existingHouseType.members,
                sqrfeet:sqrfeet ?parseFloat(sqrfeet): existingHouseType.sqrfeet,
                rooms:rooms ? parseInt(rooms):existingHouseType.rooms,
                bathrooms:bathrooms ?parseInt(bathrooms): existingHouseType.bathrooms,
            });

            res.json({
                success:true,
                message:'House type updated successfully',
                data: updateHouseType
            });
        }catch(err){
            console.error('Update house type error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating house type'
            });
        }
    },

    //Delete house
    async deleteHouseType(req,res){
        try{
            const {id} = req.params;

            //check if house exists
            const existingHouseType= await HouseType.findById(id);
            if(!existingHouseType){
                return res.status(404).json({
                    success:false,
                    message:'House type not found'
                });
            }

            await HouseType.delete(id);
            res.json({
                success:true,
                message:'House type deleted successfully'
            });
        }catch(err){
            console.error('Delete house type error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while deleting house type'
            });
        }
    },

    // Deactivate / Activate House type
    async toggleHouseTypeStatus(req, res) {
        try {
            const { id } = req.params;

            const housetype = await HouseType.findById(id);
            if (!housetype) {
                return res.status(404).json({
                    success: false,
                    message: 'House type not found'
                });
            }

            let updateHouseType;
            if (housetype.is_active) {
                await HouseType.deactivate(id);
                updateHouseType = { ...housetype, is_active: 0 };
            } else {
                await HouseType.activate(id);
                updateHouseType = { ...housetype, is_active: 1 };
            }

            res.json({
                success: true,
                message: housetype.is_active ? 'House Type deactivated' : 'House Type activated',
                data: updateHouseType
            });
        } catch (err) {
            console.error('Toggle house type status error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while toggling house type status'
            });
        }
    }
}

module.exports = houseTypeController;