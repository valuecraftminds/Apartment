const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
// const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware to all tenant routes
// router.use(authenticateToken);

// Tenant routes
router.post('/', tenantController.createTenant);
// router.get('/', tenantController.getAllTenants);
// router.get('/:id', tenantController.getTenantById);
// router.put('/:id', tenantController.updateTenant);
// router.delete('/:id', tenantController.deleteTenant);

module.exports = router;