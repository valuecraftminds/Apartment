//controllers/familyControllers.js
const Family = require('../models/Family');

const familyController = {
  // Create new family member
  createFamilyMember: async (req, res) => {
    try {
      const { houseowner_id, name, nic, email, phone } = req.body;
      
      // Validate required fields
      if (!houseowner_id || !name || !nic) {
        return res.status(400).json({
          success: false,
          message: 'houseowner_id, name, and NIC are required'
        });
      }

      const familyData = {
        houseowner_id,
        name,
        nic,
        email: email || null,
        phone: phone || null
      };

      const newFamilyMember = await Family.create(familyData);
      
      res.status(201).json({
        success: true,
        message: 'Family member created successfully',
        data: newFamilyMember
      });
    } catch (error) {
      console.error('Error creating family member:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating family member',
        error: error.message
      });
    }
  },

  // Get all family members
  getAllFamilyMembers: async (req, res) => {
    try {
      const familyMembers = await Family.findAll();
      
      res.status(200).json({
        success: true,
        message: 'Family members retrieved successfully',
        data: familyMembers
      });
    } catch (error) {
      console.error('Error fetching family members:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching family members',
        error: error.message
      });
    }
  },

  // Get family member by ID
  getFamilyMemberById: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Family member ID is required'
        });
      }

      const familyMember = await Family.findById(id);
      
      if (!familyMember) {
        return res.status(404).json({
          success: false,
          message: 'Family member not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Family member retrieved successfully',
        data: familyMember
      });
    } catch (error) {
      console.error('Error fetching family member:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching family member',
        error: error.message
      });
    }
  },

  // Get family members by houseowner_id
  getFamilyByHouseOwnerId: async (req, res) => {
    try {
      const { houseowner_id } = req.params;
      
      if (!houseowner_id) {
        return res.status(400).json({
          success: false,
          message: 'Houseowner ID is required'
        });
      }

      const familyMembers = await Family.findByHouseOwnerId(houseowner_id);
      
      res.status(200).json({
        success: true,
        message: 'Family members retrieved successfully',
        data: familyMembers
      });
    } catch (error) {
      console.error('Error fetching family by houseowner:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching family members',
        error: error.message
      });
    }
  },

  // Get family by house ID
  getFamilyByHouseId: async (req, res) => {
    try {
      const { house_id } = req.params;
      
      if (!house_id) {
        return res.status(400).json({
          success: false,
          message: 'House ID is required'
        });
      }

      const familyMember = await Family.findByHouseId(house_id);
      
      if (!familyMember) {
        return res.status(404).json({
          success: false,
          message: 'No family member found for this house'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Family member retrieved successfully',
        data: familyMember
      });
    } catch (error) {
      console.error('Error fetching family by house ID:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching family member',
        error: error.message
      });
    }
  },

  // Update family member
  updateFamilyMember: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Family member ID is required'
        });
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required for update'
        });
      }

      // Check if family member exists
      const existingMember = await Family.findById(id);
      if (!existingMember) {
        return res.status(404).json({
          success: false,
          message: 'Family member not found'
        });
      }

      const updateData = {
        name,
        email: email || existingMember.email,
        phone: phone || existingMember.phone
      };

      const updatedMember = await Family.updateFamily(id, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Family member updated successfully',
        data: updatedMember
      });
    } catch (error) {
      console.error('Error updating family member:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating family member',
        error: error.message
      });
    }
  },

  // Delete family member
  deleteFamilyMember: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Family member ID is required'
        });
      }

      // Check if family member exists
      const existingMember = await Family.findById(id);
      if (!existingMember) {
        return res.status(404).json({
          success: false,
          message: 'Family member not found'
        });
      }

      await Family.delete(id);
      
      res.status(200).json({
        success: true,
        message: 'Family member deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting family member:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting family member',
        error: error.message
      });
    }
  }
};

module.exports = familyController;