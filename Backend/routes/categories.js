const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

// Apply authentication to all routes
router.use(authenticateToken);

// Get all categories for company
router.get('/', categoryController.getAllCategories);

// Search categories within company
router.get('/search', categoryController.searchCategories);

// Get categories with statistics
router.get('/with-stats', categoryController.getCategoriesWithStats);

// Get category options for dropdowns
router.get('/options', categoryController.getCategoryOptions);

// Get categories with pagination
router.get('/paginated', categoryController.getCategoriesPaginated);

// Get single category
router.get('/:id', categoryController.getCategoryById);

// Create new category
router.post('/', categoryController.createCategory);

// Update category
router.put('/:id', categoryController.updateCategory);

// Delete category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;