const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
// Tenant routes
router.post('/', tenantController.createTenant);

// const { authenticateToken } = require('../middleware/auth');

// // Protected routes - require authentication
 router.get('/',  tenantController.getAllTenants);
 router.get('/:id', tenantController.getTenantById);
 router.put('/:id', tenantController.updateTenant);
 router.delete('/:id', tenantController.deleteTenant);

module.exports = router;