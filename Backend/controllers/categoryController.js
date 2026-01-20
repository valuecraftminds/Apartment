const Category = require('../models/Category');

const categoryController = {
  // Get all categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll();
      
      res.json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      console.error('Get all categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching categories'
      });
    }
  },

  // Get single category by ID
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.company_id;

      // Validate company access if needed
      // (Add company_id field to categories if needed)

      const category = await Category.findById(id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Get category by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching category'
      });
    }
  },

  // Create new category
  async createCategory(req, res) {
    try {
      const categoryData = req.body;
      const companyId = req.user.company_id;
      const userId = req.user.id;

      // Validate required fields
      if (!categoryData.name || categoryData.name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Category name is required'
        });
      }

      // Check if category with same name already exists
      const existingCategory = await Category.findByName(categoryData.name.trim());
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }

      // Add company_id if your categories are company-specific
      // const categoryWithCompany = { ...categoryData, company_id: companyId };

      const newCategory = await Category.create(categoryData);
      
      // You might want to add an activity log here
      // await ActivityLog.create({
      //   user_id: userId,
      //   action: 'CREATE_CATEGORY',
      //   details: `Created category: ${newCategory.name}`,
      //   company_id: companyId
      // });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: newCategory
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while creating category'
      });
    }
  },

  // Update category
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const companyId = req.user.company_id;
      const userId = req.user.id;

      // Check if category exists
      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existingCategory.name) {
        const duplicateCategory = await Category.findByName(updateData.name.trim());
        if (duplicateCategory && duplicateCategory.id !== id) {
          return res.status(409).json({
            success: false,
            message: 'Category with this name already exists'
          });
        }
      }

      const updatedCategory = await Category.update(id, updateData);
      
      // Activity log
      // await ActivityLog.create({
      //   user_id: userId,
      //   action: 'UPDATE_CATEGORY',
      //   details: `Updated category: ${updatedCategory.name}`,
      //   company_id: companyId
      // });

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while updating category'
      });
    }
  },

  // Delete category (soft delete)
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.company_id;
      const userId = req.user.id;

      // Check if category exists
      const existingCategory = await Category.findById(id);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if category is in use (if you have this constraint)
      // const pool = require('../db');
      // const [inUse] = await pool.execute(
      //   'SELECT 1 FROM technician_categories WHERE category_id = ? LIMIT 1',
      //   [id]
      // );
      // if (inUse.length > 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'Cannot delete category that is assigned to technicians'
      //   });
      // }

      await Category.delete(id);
      
      // Activity log
      // await ActivityLog.create({
      //   user_id: userId,
      //   action: 'DELETE_CATEGORY',
      //   details: `Deleted category: ${existingCategory.name}`,
      //   company_id: companyId
      // });

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while deleting category'
      });
    }
  },

  // Search categories
  async searchCategories(req, res) {
    try {
      const { query } = req.query;
      const pool = require('../db');
      
      let searchQuery = `
        SELECT * FROM complaint_categories 
        WHERE is_active = TRUE 
      `;
      
      const params = [];
      
      if (query && query.trim() !== '') {
        searchQuery += `
          AND (name LIKE ? OR description LIKE ?)
        `;
        const searchTerm = `%${query.trim()}%`;
        params.push(searchTerm, searchTerm);
      }
      
      searchQuery += ' ORDER BY name ASC';
      
      const [categories] = await pool.execute(searchQuery, params);
      
      res.json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      console.error('Search categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while searching categories'
      });
    }
  },

  // Get categories with statistics (count of technicians, etc.)
  async getCategoriesWithStats(req, res) {
    try {
      const pool = require('../db');
      
      const [categories] = await pool.execute(`
        SELECT 
          cc.*,
          COUNT(tc.technician_id) as technician_count
        FROM complaint_categories cc
        LEFT JOIN technician_categories tc ON cc.id = tc.category_id
        WHERE cc.is_active = TRUE
        GROUP BY cc.id
        ORDER BY cc.name ASC
      `);
      
      res.json({
        success: true,
        data: categories,
        count: categories.length
      });
    } catch (error) {
      console.error('Get categories with stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching categories with statistics'
      });
    }
  }
};

module.exports = categoryController;