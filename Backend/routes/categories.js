const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const categoryController = require('../controllers/categoryController');

// Apply authentication to all routes
router.use(authenticateToken);

// Public routes (read-only)
router.get('/', categoryController.getAllCategories);
router.get('/search', categoryController.searchCategories);
router.get('/with-stats', categoryController.getCategoriesWithStats);
router.get('/:id', categoryController.getCategoryById);

// Protected routes (admin only - add admin middleware if needed)
const { authorizeAdmin } = require('../middleware/auth'); // If you have admin middleware

// Create new category
router.post('/', categoryController.createCategory); // Add authorizeAdmin middleware if needed

// Update category
router.put('/:id', categoryController.updateCategory); // Add authorizeAdmin middleware if needed

// Delete category (soft delete)
router.delete('/:id', categoryController.deleteCategory); // Add authorizeAdmin middleware if needed

// Batch operations (optional)
router.post('/batch', async (req, res) => {
  // Implement batch operations if needed
});

module.exports = router;