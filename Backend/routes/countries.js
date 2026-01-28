const express = require('express');
const router = express.Router();
const pool = require('../db');
const countryController = require('../controllers/countryController');

router.get('/', countryController.getAllCountries);
router.get('/external', countryController.getCountries);

module.exports=router;