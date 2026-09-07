const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  location: {
    type: String,
    enum: ['warehouse', 'shop'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  minStockLevel: {
    type: Number,
    default: 5,
    min: 0
  },
  lastRestockedAt: Date
}, { timestamps: true });

// ป้องกันข้อมูลซ้ำ (สินค้าเดียวกัน + สถานที่เดียวกัน ต้องมี record เดียว)
inventorySchema.index({ product: 1, location: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);