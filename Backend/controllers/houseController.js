//controllers/houseController.js
const e = require('express');
const House = require('../models/House');
const pool = require('../db')

const houseController = {
    async createHouse(req, res) {
        try {
            const { house_id,status } = req.body;
            const company_id = req.user.company_id;
            const apartment_id=req.apartment.id;
            const floor_id=req.floor.id;
            const house_owner_id = req.house_owner.id;
            const housetype_id=req.housetype_id;
            const family_id=req.family_id;

            if (!house_id || !status === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newHouse = await House.create({
                    house_id,
                    status,
                    company_id,
                    apartment_id,
                    floor_id,
                    house_owner_id,
                    housetype_id,
                    family_id,
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

  //create floors via array
    async createHousesBatch(req, res) {
  const conn = await pool.getConnection();
  try {
    const company_id = req.user.company_id;
    const { floor_id, apartment_id,houses } = req.body;

    if (!Array.isArray(houses) || houses.length === 0) {
      return res.status(400).json({ success: false, message: "No houses provided" });
    }
    if (!apartment_id) {
        return res.status(400).json({ success: false, message: "apartment_id is required" });
    }
    if (!floor_id) {
        return res.status(400).json({ success: false, message: "floor_id is required" });
    }
    if (!houses || !Array.isArray(houses) || houses.length === 0) {
        return res.status(400).json({ success: false, message: "houses array is required" });
    }

    await conn.beginTransaction();
    const created = [];

    for (const house of houses) {
      const newHouse = await House.create({
        house_id: house.house_id,
        // house_count: parseInt(floor.house_count) || 1,
        housetype_id:house.housetype_id,
        floor_id,
        company_id,
        apartment_id
      });
      created.push(newHouse);
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      message: `${created.length} Houses added successfully`,
      data: created
    });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error("Batch create houses error", err);
    res.status(500).json({ 
        success: false, 
        message: "Server error while creating houses" 
    });
  } finally {
    if (conn) conn.release();
  }
},

    // Get all house
    async getAllHouses(req, res) {
        try {

            // Get company_id from authenticated user (from JWT token)
            const company_id = req.user.company_id; // Assuming you store company_id in JWT
            const { apartment_id } = req.query; // take from query params
            const { floor_id } = req.query; // take from query params
            // const {housetype_id} = req.query;
            // const {house_owner_id} = req.query;
            // const {family_id} = req.query;

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

     
    async updateHouse(req, res) {
        try {
            const { id } = req.params;
            const { house_id, status, housetype_id, house_owner_id, family_id } = req.body;

            const existingHouse = await House.findById(id);
            if (!existingHouse) {
                return res.status(404).json({
                    success: false,
                    message: 'House not found'
                });
            }

            const updatedHouse = await House.update(id, {
                house_id: house_id || existingHouse.house_id,
                status: status || existingHouse.status,
                housetype_id: housetype_id || existingHouse.housetype_id,
                houseowner_id: house_owner_id || existingHouse.houseowner_id, // Fixed field name
                family_id: family_id || existingHouse.family_id
            });

            res.json({
                success: true,
                message: 'House updated successfully',
                data: updatedHouse
            });
        } catch (err) {
            console.error('Update house error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating house'
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
    },

    // Deactivate / Activate House
    async toggleHouseStatus(req, res) {
        try {
            const { id } = req.params;

            const house = await House.findById(id);
            if (!house) {
                return res.status(404).json({
                    success: false,
                    message: 'House not found'
                });
            }

            let updatedHouse;
            if (house.is_active) {
                await House.deactivate(id);
                updatedHouse = { ...house, is_active: 0 };
            } else {
                await House.activate(id);
                updatedHouse = { ...house, is_active: 1 };
            }

            res.json({
                success: true,
                message: house.is_active ? 'House deactivated' : 'House activated',
                data: updatedHouse
            });
        } catch (err) {
            console.error('Toggle house status error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while toggling house status'
            });
        }
    },

    //Delete House
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