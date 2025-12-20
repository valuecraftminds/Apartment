//routes/family.js
const express = require('express');
const router = express.Router();
const familyController = require('../controllers/familyController');

// Create a new family member
router.post('/', familyController.createFamilyMember);

// Get all family members
router.get('/', familyController.getAllFamilyMembers);

// Get family member by ID
router.get('/:id', familyController.getFamilyMemberById);

// Get family members by houseowner_id
router.get('/houseowner/:houseowner_id', familyController.getFamilyByHouseOwnerId);

// Get family by house ID
router.get('/house/:house_id', familyController.getFamilyByHouseId);

// Update family member
router.put('/:id', familyController.updateFamilyMember);

// Delete family member
router.delete('/:id', familyController.deleteFamilyMember);

module.exports = router;