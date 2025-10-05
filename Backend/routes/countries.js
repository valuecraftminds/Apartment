const express = require('express');
const router = express.Router();
const pool = require('../db');
const countryController = require('../controllers/countryController');

router.get('/', countryController.getAllCountries);

module.exports=router;