const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMedia,
  deleteProjectMedia,
  reorderProjects
} = require('../controllers/galleryController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProjects);
router.get('/:id', getProjectById);

router.post('/', protect, createProject);
router.put('/reorder', protect, reorderProjects);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

router.post('/:id/media', protect, upload.single('image'), addProjectMedia);
router.delete('/:id/media/:mediaId', protect, deleteProjectMedia);

module.exports = router;
