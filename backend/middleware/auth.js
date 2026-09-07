const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @desc    ตรวจสอบว่าผู้ใช้ Login แล้วหรือยัง (Verify JWT)
 * @usage   router.get('/profile', protect, getProfile)
 */
const protect = async (req, res, next) => {
  let token;

  // ตรวจสอบ Authorization Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // ดึง token จาก header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // แนบข้อมูล user (ไม่รวม password) ไว้ใน req
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'ไม่พบบัญชีผู้ใช้นี้' });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ message: 'บัญชีนี้ถูกปิดการใช้งาน' });
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบก่อนใช้งาน' });
  }
};

module.exports = { protect };