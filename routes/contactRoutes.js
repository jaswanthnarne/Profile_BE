const express = require('express');
const router = express.Router();
const { submitContact, getSubmissions, markAsRead, deleteSubmission, getStats } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { message: 'Too many contact submissions, please try again later' },
});

router.post('/', contactLimiter, submitContact);
router.get('/stats', protect, getStats);
router.get('/submissions', protect, getSubmissions);
router.put('/submissions/:id/read', protect, markAsRead);
router.delete('/submissions/:id', protect, deleteSubmission);

module.exports = router;
