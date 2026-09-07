const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'กรุณาระบุชื่อผู้ใช้'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'กรุณาระบุรหัสผ่าน'],
    minlength: 6
  },
  name: {
    type: String,
    required: [true, 'กรุณาระบุชื่อ-นามสกุล']
  },
  role: {
    type: String,
    enum: ['super_admin', 'warehouse', 'shop'],
    default: 'shop'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Hash password อัตโนมัติก่อนบันทึก
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method เปรียบเทียบรหัสผ่านตอน Login
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ซ่อน password เมื่อแปลงเป็น JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);