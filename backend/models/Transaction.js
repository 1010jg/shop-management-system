const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['import', 'import_request', 'sale', 'restock_request', 'restock_approve', 'adjustment'],
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  fromLocation: {
    type: String,
    enum: ['external', 'warehouse', 'shop', null],
    default: null
  },
  toLocation: {
    type: String,
    enum: ['warehouse', 'shop', null],
    default: null
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referenceId: String, // เลขที่เอกสารอ้างอิง
  note: String,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'completed'
  }
}, { timestamps: true });

// Index สำหรับดึงประวัติตามประเภทและวันที่
transactionSchema.index({ type: 1, createdAt: -1 });
transactionSchema.index({ performedBy: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);