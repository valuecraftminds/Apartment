//controllers/userApartmentController.js
const UserApartment = require('../models/UserApartment');

const userApartmentController = {
  // Get user's assigned apartments
  async getUserApartments(req, res) {
    try {
      const { userId } = req.params;
      const companyId = req.user.company_id;

      // Validate user belongs to the same company
      const pool = require('../db');
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ?',
        [userId, companyId]
      );

      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found or access denied'
        });
      }

      const apartments = await UserApartment.findByUserId(userId);

      res.json({
        success: true,
        data: apartments
      });
    } catch (error) {
      console.error('Get user apartments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching user apartments'
      });
    }
  },

  // Assign apartments to user
  async assignApartments(req, res) {
    try {
      const { userId } = req.params;
      const { apartment_ids } = req.body;
      const assignedBy = req.user.id;
      const companyId = req.user.company_id;

      // Validate user exists and belongs to same company
      const pool = require('../db');
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ?',
        [userId, companyId]
      );

      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found or access denied'
        });
      }

      // Validate apartments exist and belong to same company
      if (apartment_ids && apartment_ids.length > 0) {
        const placeholders = apartment_ids.map(() => '?').join(', ');
        const [apartmentRows] = await pool.execute(
          `SELECT id FROM apartments WHERE id IN (${placeholders}) AND company_id = ?`,
          [...apartment_ids, companyId]
        );

        if (apartmentRows.length !== apartment_ids.length) {
          return res.status(400).json({
            success: false,
            message: 'Some apartments not found or access denied'
          });
        }
      }

      await UserApartment.assignApartments(userId, apartment_ids, assignedBy);

      // Get updated assignments
      const updatedApartments = await UserApartment.findByUserId(userId);

      res.json({
        success: true,
        message: 'Apartments assigned successfully',
        data: updatedApartments
      });
    } catch (error) {
      console.error('Assign apartments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while assigning apartments'
      });
    }
  },

  // Get apartment's assigned users
  async getApartmentUsers(req, res) {
    try {
      const { apartmentId } = req.params;
      const companyId = req.user.company_id;

      // Validate apartment belongs to the same company
      const pool = require('../db');
      const [apartmentRows] = await pool.execute(
        'SELECT id FROM apartments WHERE id = ? AND company_id = ?',
        [apartmentId, companyId]
      );

      if (apartmentRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Apartment not found or access denied'
        });
      }

      const users = await UserApartment.findByApartmentId(apartmentId);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get apartment users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching apartment users'
      });
    }
  },

  // Check if user has access to apartment
  async checkUserAccess(req, res) {
    try {
      const { userId, apartmentId } = req.params;
      const companyId = req.user.company_id;

      // Validate both user and apartment belong to same company
      const pool = require('../db');
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ?',
        [userId, companyId]
      );

      const [apartmentRows] = await pool.execute(
        'SELECT id FROM apartments WHERE id = ? AND company_id = ?',
        [apartmentId, companyId]
      );

      if (userRows.length === 0 || apartmentRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User or apartment not found'
        });
      }

      const hasAccess = await UserApartment.hasAccess(userId, apartmentId);

      res.json({
        success: true,
        data: { hasAccess }
      });
    } catch (error) {
      console.error('Check user access error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while checking user access'
      });
    }
  },

  // Remove apartment assignment from user
  async removeAssignment(req, res) {
    try {
      const { userId, apartmentId } = req.params;
      const companyId = req.user.company_id;

      // Validate both user and apartment belong to same company
      const pool = require('../db');
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ?',
        [userId, companyId]
      );

      const [apartmentRows] = await pool.execute(
        'SELECT id FROM apartments WHERE id = ? AND company_id = ?',
        [apartmentId, companyId]
      );

      if (userRows.length === 0 || apartmentRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User or apartment not found'
        });
      }

      const removed = await UserApartment.removeAssignment(userId, apartmentId);

      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Assignment not found'
        });
      }

      res.json({
        success: true,
        message: 'Assignment removed successfully'
      });
    } catch (error) {
      console.error('Remove assignment error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while removing assignment'
      });
    }
  },

  // Get all assignments for company
  async getAllAssignments(req, res) {
    try {
      const companyId = req.user.company_id;
      
      const assignments = await UserApartment.getAllAssignments(companyId);

      res.json({
        success: true,
        data: assignments
      });
    } catch (error) {
      console.error('Get all assignments error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching assignments'
      });
    }
  }
};

module.exports = userApartmentController;