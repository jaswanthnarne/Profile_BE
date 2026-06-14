const express = require('express');
const router = express.Router();
const { login, verify } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many login attempts, please try again after 15 minutes' },
});

router.post('/login', loginLimiter, login);
router.get('/verify', protect, verify);

module.exports = router;
