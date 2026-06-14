const express = require('express');
const router = express.Router();
const { getBlogPosts, getBlogPostBySlug, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost } = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getBlogPosts);
router.get('/admin/:id', protect, getBlogPostById);
router.get('/:slug', getBlogPostBySlug);
router.post('/', protect, upload.single('coverImage'), createBlogPost);
router.put('/:id', protect, upload.single('coverImage'), updateBlogPost);
router.delete('/:id', protect, deleteBlogPost);

module.exports = router;
