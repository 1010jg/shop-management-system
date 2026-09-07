const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'กรุณาระบุรหัสสินค้า'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'กรุณาระบุชื่อสินค้า']
  },
  description: String,
  category: {
    type: String,
    required: [true, 'กรุณาระบุหมวดหมู่']
  },
  unit: {
    type: String,
    required: [true, 'กรุณาระบุหน่วยนับ'],
    default: 'ชิ้น'
  },
  costPrice: {
    type: Number,
    required: [true, 'กรุณาระบุราคาทุน'],
    min: 0
  },
  sellingPrice: {
    type: Number,
    required: [true, 'กรุณาระบุราคาขาย'],
    min: 0
  },
  image: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index สำหรับค้นหา
productSchema.index({ name: 'text', sku: 'text' });

module.exports = mongoose.model('Product', productSchema);