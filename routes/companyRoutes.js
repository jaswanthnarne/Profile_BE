const express = require('express');
const router = express.Router();
const { getCompanies, createCompany, updateCompany, deleteCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getCompanies);
router.post('/', protect, upload.single('logo'), createCompany);
router.put('/:id', protect, upload.single('logo'), updateCompany);
router.delete('/:id', protect, deleteCompany);

module.exports = router;
