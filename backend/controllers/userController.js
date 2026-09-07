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

// @desc    แก้ไขข้อมูลผู้ใช้
// @route   PUT /api/users/:id
// @access  Super Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive, password } = req.body;
    const updateData = { name, role, isActive };

    // ถ้ามีการเปลี่ยนรหัสผ่าน ให้ hash ใหม่
    if (password) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
      user.password = password; // trigger pre-save hook
      Object.assign(user, updateData);
      await user.save();
      return res.json({ message: 'อัปเดตผู้ใช้สำเร็จ', user });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
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