// controllers/userBillController.js - Corrected version
const UserBill = require('../models/UserBills');
const pool = require('../db');

const userBillController = {
  // Get user's assigned bills
  async getUserBills(req, res) {
    try {
      const { userId } = req.params;
      const companyId = req.user.company_id;

      // Validate user belongs to the same company
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

      const bills = await UserBill.findByUserId(userId);

      res.json({
        success: true,
        data: bills
      });
    } catch (error) {
      console.error('Get user bills error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching user bills'
      });
    }
  },

  // Assign bills to user
  async assignBills(req, res) {
    try {
      const { userId } = req.params;
      const { bill_ids } = req.body;
      const assignedBy = req.user.id;
      const companyId = req.user.company_id;

      // Validate user exists and belongs to same company
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

      // Validate bills exist and belong to same company
      if (bill_ids && bill_ids.length > 0) {
        const placeholders = bill_ids.map(() => '?').join(', ');
        const [billRows] = await pool.execute(
          `SELECT id FROM bills WHERE id IN (${placeholders}) AND company_id = ?`,
          [...bill_ids, companyId]
        );

        if (billRows.length !== bill_ids.length) {
          return res.status(400).json({
            success: false,
            message: 'Some bills not found or access denied'
          });
        }
      }

      await UserBill.assignBills(companyId, userId, bill_ids, assignedBy);

      // Get updated assignments
      const updatedBills = await UserBill.findByUserId(userId);

      res.json({
        success: true,
        message: 'Bills assigned successfully',
        data: updatedBills
      });
    } catch (error) {
      console.error('Assign bills error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while assigning bills'
      });
    }
  },

  // Get bill's assigned users
  async getBillUsers(req, res) {
    try {
      const { billId } = req.params;
      const companyId = req.user.company_id;

      // Validate bill belongs to the same company
      const [billRows] = await pool.execute(
        'SELECT id FROM bills WHERE id = ? AND company_id = ?',
        [billId, companyId]
      );

      if (billRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found or access denied'
        });
      }

      const users = await UserBill.findByBillId(billId);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Get bill users error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching bill users'
      });
    }
  },

  // Check if user has access to bill
  async checkUserAccess(req, res) {
    try {
      const { userId, billId } = req.params;
      const companyId = req.user.company_id;

      // Validate both user and bill belong to same company
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ?',
        [userId, companyId]
      );

      const [billRows] = await pool.execute(
        'SELECT id FROM bills WHERE id = ? AND company_id = ?',
        [billId, companyId]
      );

      if (userRows.length === 0 || billRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User or bill not found'
        });
      }

      const hasAccess = await UserBill.hasAccess(userId, billId);

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

  // Remove bill assignment from user
  async removeAssignment(req, res) {
    try {
      const { userId, billId } = req.params;
      const companyId = req.user.company_id;

      // Validate both user and bill belong to same company
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ?',
        [userId, companyId]
      );

      const [billRows] = await pool.execute(
        'SELECT id FROM bills WHERE id = ? AND company_id = ?',
        [billId, companyId]
      );

      if (userRows.length === 0 || billRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User or bill not found'
        });
      }

      const removed = await UserBill.removeAssignment(userId, billId);

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
      
      const assignments = await UserBill.getAllAssignments(companyId);

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

module.exports = userBillController;