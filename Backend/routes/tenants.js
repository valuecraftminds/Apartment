const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
// Tenant routes
router.post('/', tenantController.createTenant);

// const { authenticateToken } = require('../middleware/auth');

// // Protected routes - require authentication
// router.get('/', authenticateToken, tenantController.getAllTenants);
// router.get('/:id', authenticateToken, tenantController.getTenantById);
// router.put('/:id', authenticateToken, tenantController.updateTenant);
// router.delete('/:id', authenticateToken, tenantController.deleteTenant);


module.exports = router;