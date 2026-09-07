const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    สมัครสมาชิก
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, password, name } = req.body;

    // ตรวจสอบว่ามี user อยู่แล้วหรือไม่
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
    }

    // สร้าง user ใหม่ (role default เป็น 'shop')
    const user = await User.create({ username, password, name, role: 'shop' });

    res.status(201).json({
      message: 'สมัครสมาชิกสำเร็จ',
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    เข้าสู่ระบบ
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'กรุณาระบุชื่อผู้ใช้และรหัสผ่าน' });
    }

    const user = await User.findOne({ username, isActive: true });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};