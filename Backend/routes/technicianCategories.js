const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const technicianCategoryController = require('../controllers/technicianCategoryController');

// Apply authentication to all routes
router.use(authenticateToken);

// Technician category assignments
router.get('/technicians/:technicianId/categories', technicianCategoryController.getTechnicianCategories);
router.post('/technicians/:technicianId/categories', technicianCategoryController.assignCategories);

// Category technician assignments
router.get('/categories/:categoryId/technicians', technicianCategoryController.getCategoryTechnicians);

// Access checks and management
router.get('/technicians/:technicianId/categories/:categoryId/check', technicianCategoryController.checkTechnicianCategory);
router.delete('/technicians/:technicianId/categories/:categoryId', technicianCategoryController.removeAssignment);

// Company-wide assignments
router.get('/assignments', technicianCategoryController.getAllAssignments);

// Filter technicians by categories
router.post('/technicians/by-categories', technicianCategoryController.getTechniciansByCategories);

module.exports = router;
