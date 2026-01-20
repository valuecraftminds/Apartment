const TechnicianCategory = require('../models/TechnicianCategory');

const technicianCategoryController = {
  // Get technician's assigned categories
  async getTechnicianCategories(req, res) {
    try {
      const { technicianId } = req.params;
      const companyId = req.user.company_id;

      // Validate technician belongs to the same company
      const pool = require('../db');
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ? AND role IN ("technician", "admin")',
        [technicianId, companyId]
      );

      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Technician not found or access denied'
        });
      }

      const categories = await TechnicianCategory.findByTechnicianId(technicianId);

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get technician categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching technician categories'
      });
    }
  },

  // Assign categories to technician
  async assignCategories(req, res) {
    try {
      const { technicianId } = req.params;
      const { category_ids } = req.body;
      const assignedBy = req.user.id;
      const companyId = req.user.company_id;

      // Validate technician exists and belongs to same company
      const pool = require('../db');
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ? AND role IN ("technician", "admin")',
        [technicianId, companyId]
      );

      if (userRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Technician not found or access denied'
        });
      }

      // Validate categories exist and belong to same company
      if (category_ids && category_ids.length > 0) {
        const placeholders = category_ids.map(() => '?').join(', ');
        const [categoryRows] = await pool.execute(
          `SELECT id FROM categories WHERE id IN (${placeholders}) AND company_id = ?`,
          [...category_ids, companyId]
        );

        if (categoryRows.length !== category_ids.length) {
          return res.status(400).json({
            success: false,
            message: 'Some categories not found or access denied'
          });
        }
      }

      await TechnicianCategory.assignCategories(technicianId, category_ids, assignedBy, companyId);

      // Get updated assignments
      const updatedCategories = await TechnicianCategory.findByTechnicianId(technicianId);

      res.json({
        success: true,
        message: 'Categories assigned successfully',
        data: updatedCategories
      });
    } catch (error) {
      console.error('Assign categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while assigning categories'
      });
    }
  },

  // Get category's assigned technicians
  async getCategoryTechnicians(req, res) {
    try {
      const { categoryId } = req.params;
      const companyId = req.user.company_id;

      // Validate category belongs to the same company
      const pool = require('../db');
      const [categoryRows] = await pool.execute(
        'SELECT id FROM categories WHERE id = ? AND company_id = ?',
        [categoryId, companyId]
      );

      if (categoryRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Category not found or access denied'
        });
      }

      const technicians = await TechnicianCategory.findByCategoryId(categoryId);

      res.json({
        success: true,
        data: technicians
      });
    } catch (error) {
      console.error('Get category technicians error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching category technicians'
      });
    }
  },

  // Check if technician has category
  async checkTechnicianCategory(req, res) {
    try {
      const { technicianId, categoryId } = req.params;
      const companyId = req.user.company_id;

      // Validate both technician and category belong to same company
      const pool = require('../db');
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ?',
        [technicianId, companyId]
      );

      const [categoryRows] = await pool.execute(
        'SELECT id FROM categories WHERE id = ? AND company_id = ?',
        [categoryId, companyId]
      );

      if (userRows.length === 0 || categoryRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Technician or category not found'
        });
      }

      const hasCategory = await TechnicianCategory.hasCategory(technicianId, categoryId);

      res.json({
        success: true,
        data: { hasCategory }
      });
    } catch (error) {
      console.error('Check technician category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while checking technician category'
      });
    }
  },

  // Remove category assignment from technician
  async removeAssignment(req, res) {
    try {
      const { technicianId, categoryId } = req.params;
      const companyId = req.user.company_id;

      // Validate both technician and category belong to same company
      const pool = require('../db');
      const [userRows] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND company_id = ?',
        [technicianId, companyId]
      );

      const [categoryRows] = await pool.execute(
        'SELECT id FROM categories WHERE id = ? AND company_id = ?',
        [categoryId, companyId]
      );

      if (userRows.length === 0 || categoryRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Technician or category not found'
        });
      }

      const removed = await TechnicianCategory.removeAssignment(technicianId, categoryId);

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
      
      const assignments = await TechnicianCategory.getAllAssignments(companyId);

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
  },

  // Get technicians by categories (for filtering/searching)
  async getTechniciansByCategories(req, res) {
    try {
      const { category_ids } = req.body;
      const companyId = req.user.company_id;

      if (!category_ids || !Array.isArray(category_ids)) {
        return res.status(400).json({
          success: false,
          message: 'category_ids array is required'
        });
      }

      // Validate categories belong to same company
      if (category_ids.length > 0) {
        const placeholders = category_ids.map(() => '?').join(', ');
        const [categoryRows] = await pool.execute(
          `SELECT id FROM categories WHERE id IN (${placeholders}) AND company_id = ?`,
          [...category_ids, companyId]
        );

        if (categoryRows.length !== category_ids.length) {
          return res.status(400).json({
            success: false,
            message: 'Some categories not found or access denied'
          });
        }
      }

      const technicians = await TechnicianCategory.findTechniciansByCategories(category_ids, companyId);

      res.json({
        success: true,
        data: technicians
      });
    } catch (error) {
      console.error('Get technicians by categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching technicians'
      });
    }
  }
};

module.exports = technicianCategoryController;