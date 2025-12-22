// routes/roleComponents.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const roleComponentController = require('../controllers/roleComponentController');

router.use(authenticateToken);

router.post('/role/:role_id', roleComponentController.assignComponents);
router.get('/role/:role_id', roleComponentController.getRoleComponents);
router.get('/user/components', roleComponentController.getUserComponents);

module.exports = router;