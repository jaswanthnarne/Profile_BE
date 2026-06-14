const express = require('express');
const router = express.Router();
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getTestimonials);
router.post('/', protect, upload.single('file'), createTestimonial);
router.put('/:id', protect, upload.single('file'), updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

module.exports = router;
