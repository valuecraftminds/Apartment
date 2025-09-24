const Floor = require('../models/Floor');

const floorController = {
    async createFloors(req, res) {
        try {
            const { floor_id, house_count } = req.body;
            const company_id = req.user.company_id;
            const apartment_id=req.apartment.id;

            if (!floor_id || house_count === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const newFloor = await Floor.create({
                    floor_id,
                    house_count: parseInt(house_count),
                    company_id,
                    apartment_id
            });
            res.status(201).json({
            success: true,
            message: 'Floors Added successfully',
            data: newFloor
            });
        } catch (err) {
            console.error('Create Floor error', err);
            res.status(500).json({
            success: false,
            message: 'Server error while creating floor'
        });
    }
},
    // Get all floors
    async getAllFloors(req, res) {
    try {
        const company_id = req.user.company_id;
        const { apartment_id } = req.query; // take from query params

        if (!company_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Company Id is required' 
            });
        }
        if (!apartment_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Apartment Id is required' 
            });
        }

        const floors = await Floor.findByApartmentId(apartment_id);
        res.json({ success: true, data: floors });
    } catch (err) {
        console.error('Get floors error', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching floors'
        });
    }
},


    //get floors by ID
    async getFloorById(req,res){
        try{
            const {id}=req.params;
            const floor=await Floor.findById(id);

            if(!floor){
                return res.status(404).json({
                    success:false,
                    message:'Floor not found'
                });
            }

            res.json({
                success:true,
                data:floor
            });
        }catch(err){
            console.error('Get floor error',err);
            res.status(500).json({
                success:false,
                message:'Server error while fetching floors'
            });
        }
    },

     //update floors
    async updateFloors(req,res){
        try{
            const {id}=req.params;
            const {house_count}=req.body;

            //check tenant exist
            const existingFloors= await Floor.findById(id);
            if(!existingFloors){
                return res.status(404).json({
                    success:false,
                    message:'Floor not found'
                });
            }

            const updateFloors= await Floor.update(id,{
                house_count: house_count ? parseInt(house_count): existingFloors.house_count,
            });

            res.json({
                success:true,
                message:'Floor updated successfully',
                data: updateFloors
            });
        }catch(err){
            console.error('Update floor error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while updating floor'
            });
        }
    },

    //Delete Floor
    async deleteFloors(req,res){
        try{
            const {id} = req.params;

            //check if floor exists
            const existingFloor= await Floor.findById(id);
            if(!existingFloor){
                return res.status(404).json({
                    success:false,
                    message:'Floor not found'
                });
            }

            await Floor.delete(id);
            res.json({
                success:true,
                message:'Floor deleted successfully'
            });
        }catch(err){
            console.error('Delete floor error:',err);
            res.status(500).json({
                success:false,
                message:'Server error while deleting floor'
            });
        }
    }
}

module.exports = floorController;