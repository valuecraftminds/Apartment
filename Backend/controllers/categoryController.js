const Category = require('../models/Category');
const pool = require('../db');

const categoryController = {
  // Get all categories for the user's company
  async getAllCategories(req, res) {
    try {
      const companyId = req.user.company_id;
      const categories = await Category.findAll(companyId);
      
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

  // Get single category by ID with company check
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.company_id;

      const category = await Category.findById(id, companyId);
      
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

  // Create new category for the user's company
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

      // Add company_id to category data
      categoryData.company_id = companyId;

      // Check if category with same name already exists in this company
      const existingCategory = await Category.findByName(categoryData.name.trim(), companyId);
      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists in your company'
        });
      }

      const newCategory = await Category.create(categoryData);
      
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

  // Update category with company check
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const companyId = req.user.company_id;
      const userId = req.user.id;

      // Check if category exists in this company
      const existingCategory = await Category.findById(id, companyId);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // If name is being updated, check for duplicates in the same company
      if (updateData.name && updateData.name !== existingCategory.name) {
        const duplicateCategory = await Category.findByName(updateData.name.trim(), companyId);
        if (duplicateCategory && duplicateCategory.id !== id) {
          return res.status(409).json({
            success: false,
            message: 'Category with this name already exists in your company'
          });
        }
      }

      const updatedCategory = await Category.update(id, companyId, updateData);

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

  // Delete category (soft delete) with company check
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;
      const companyId = req.user.company_id;
      const userId = req.user.id;

      // Check if category exists in this company
      const existingCategory = await Category.findById(id, companyId);
      if (!existingCategory) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if category is in use (technician assignments)
      const [inUse] = await pool.execute(
        'SELECT 1 FROM technician_categories WHERE category_id = ? AND company_id = ? LIMIT 1',
        [id, companyId]
      );
      if (inUse.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category that is assigned to technicians'
        });
      }

      await Category.delete(id, companyId);

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

  // Search categories within company
  async searchCategories(req, res) {
    try {
      const { query } = req.query;
      const companyId = req.user.company_id;
      
      let searchQuery = `
        SELECT * FROM complaint_categories 
        WHERE is_active = TRUE AND company_id = ?
      `;
      
      const params = [companyId];
      
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

  // Get categories with statistics within company
  async getCategoriesWithStats(req, res) {
    try {
      const companyId = req.user.company_id;
      
      const [categories] = await pool.execute(`
        SELECT 
          cc.*,
          COUNT(tc.technician_id) as technician_count
        FROM complaint_categories cc
        LEFT JOIN technician_categories tc ON cc.id = tc.category_id AND tc.company_id = ?
        WHERE cc.is_active = TRUE AND cc.company_id = ?
        GROUP BY cc.id
        ORDER BY cc.name ASC
      `, [companyId, companyId]);
      
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
  },

  // Get categories for dropdown/select options
  async getCategoryOptions(req, res) {
    try {
      const companyId = req.user.company_id;
      
      const [categories] = await pool.execute(`
        SELECT id, name, icon, color
        FROM complaint_categories 
        WHERE is_active = TRUE AND company_id = ?
        ORDER BY name ASC
      `, [companyId]);
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Get category options error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching category options'
      });
    }
  },

  // Get categories with pagination
  async getCategoriesPaginated(req, res) {
    try {
      const companyId = req.user.company_id;
      const { page = 1, limit = 10, search = '' } = req.query;
      
      const offset = (page - 1) * limit;
      
      let baseQuery = `
        FROM complaint_categories 
        WHERE company_id = ?
      `;
      
      let countQuery = `SELECT COUNT(*) as total ${baseQuery}`;
      let dataQuery = `SELECT * ${baseQuery}`;
      
      const params = [companyId];
      const countParams = [companyId];
      
      if (search && search.trim() !== '') {
        baseQuery += ` AND (name LIKE ? OR description LIKE ?)`;
        const searchTerm = `%${search.trim()}%`;
        params.push(searchTerm, searchTerm);
        countParams.push(searchTerm, searchTerm);
      }
      
      dataQuery += ` ORDER BY name ASC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), parseInt(offset));
      
      const [countResult] = await pool.execute(countQuery, countParams);
      const [categories] = await pool.execute(dataQuery, params);
      
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        success: true,
        data: categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Get paginated categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error while fetching categories'
      });
    }
  }
};

module.exports = categoryController;