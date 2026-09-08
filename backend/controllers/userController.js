const User = require('../models/User');

// @desc    ดึงรายชื่อผู้ใช้ทั้งหมด
// @route   GET /api/users
// @access  Super Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    เพิ่มผู้ใช้ใหม่
// @route   POST /api/users
// @access  Super Admin
exports.createUser = async (req, res, next) => {
  try {
    const { username, password, name, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
    }

    const user = await User.create({ username, password, name, role });
    res.status(201).json({ message: 'สร้างผู้ใช้สำเร็จ', user });
  } catch (error) {
    next(error);
  }
};

// @desc    แก้ไขข้อมูลผู้ใช้ (🚫 ห้ามแก้บทบาทตนเอง + ห้ามเลื่อนผู้อื่นเป็นผู้ดูแล)
// @route   PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive, password } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    // ✅ 1) ห้ามแก้ไขบทบาทของตนเอง (เทียบ id ผู้ขอ กับ id เป้าหมาย)
    if (
      role !== undefined &&
      role !== user.role &&
      String(user._id) === String(req.user._id)
    ) {
      return res.status(400).json({
        message: 'ไม่สามารถแก้ไขบทบาทของตนเองได้'
      });
    }

    // ✅ 2) ห้ามเลื่อนบทบาทผู้อื่นเป็นผู้ดูแลระบบ (ยกเว้นเป็นผู้ดูแลอยู่แล้ว)
    if (role === 'super_admin' && user.role !== 'super_admin') {
      return res.status(400).json({
        message: 'ไม่สามารถเลื่อนบทบาทเป็นผู้ดูแลระบบผ่านการแก้ไขได้ (ให้สร้างบัญชีใหม่แทน)'
      });
    }

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;

    await user.save();

    res.json({ message: 'อัปเดตผู้ใช้สำเร็จ', user });
  } catch (error) {
    next(error);
  }
};

// @desc    ลบผู้ใช้
// @route   DELETE /api/users/:id
// @access  Super Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    next(error);
  }
};