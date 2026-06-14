const express = require('express');
const router = express.Router();
const {
  getMoments,
  createMoment,
  updateMoment,
  deleteMoment
} = require('../controllers/momentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getMoments);

router.post('/', protect, upload.single('image'), createMoment);
router.put('/:id', protect, updateMoment);
router.delete('/:id', protect, deleteMoment);

module.exports = router;
