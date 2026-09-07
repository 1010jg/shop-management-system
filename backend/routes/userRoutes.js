const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');
const { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');

// ✅ ทุก route ต้อง Login + เป็น Super Admin เท่านั้น
router.use(protect, adminOnly);

// @route   GET /api/users
// @desc    ดึงรายชื่อผู้ใช้ทั้งหมด
router.get('/', getUsers);

// @route   POST /api/users
// @desc    เพิ่มผู้ใช้ใหม่ (Admin สร้างได้ทุก role)
router.post('/', createUser);

// @route   PUT /api/users/:id
// @desc    แก้ไขข้อมูลผู้ใช้ / เปลี่ยน role / เปิด-ปิดบัญชี
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
// @desc    ลบผู้ใช้
router.delete('/:id', deleteUser);

module.exports = router;