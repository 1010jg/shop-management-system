const router = require('express').Router();
const { register, login } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    สมัครสมาชิก (User ทั่วไปสมัครได้ role default = shop)
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    เข้าสู่ระบบ
router.post('/login', login);

module.exports = router;