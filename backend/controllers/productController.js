const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');

// ✅ Helper: escape ตัวอักษรพิเศษก่อนใช้กับ RegExp
const escapeRegex = (text = '') => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ✅ สร้างรหัสสินค้าอัตโนมัติ (P001, P002, ... ต่อจากหมายเลขสูงสุดเดิม)
const generateSku = async () => {
  const products = await Product.find({ sku: /^P\d+$/ }).select('sku');
  let max = 0;
  products.forEach(p => {
    const num = parseInt(p.sku.replace('P', ''), 10);
    if (!isNaN(num) && num > max) max = num;
  });
  return 'P' + String(max + 1).padStart(3, '0');
};

// @desc    ดึงสินค้าทั้งหมด
// @route   GET /api/products
// @access  All Authenticated
exports.getProducts = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = { isActive: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    ดึงรายละเอียดสินค้า
// @route   GET /api/products/:id
// @access  All Authenticated
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    เพิ่มสินค้าใหม่ (ระบบสร้าง SKU เอง + ตรวจชื่อซ้ำ)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { name } = req.body;

    // ✅ ตรวจซ้ำเฉพาะชื่อสินค้า
    const dupName = await Product.findOne({
      name: new RegExp(`^${escapeRegex(name || '')}$`, 'i')
    });
    if (dupName) {
      return res.status(400).json({
        message: `สินค้าซ้ำ: ชื่อ "${name}" มีอยู่แล้วในระบบ (รหัส: ${dupName.sku})`
      });
    }

    // ✅ ระบบสร้างรหัสสินค้าเอง
    const sku = await generateSku();

    const product = await Product.create({ ...req.body, name, sku });

    await Inventory.create({
      product: product._id,
      location: 'warehouse',
      quantity: 0
    });

    res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ', product });
  } catch (error) {
    next(error);
  }
};

// @desc    แก้ไขสินค้า (ตรวจชื่อซ้ำ + ห้ามแก้ SKU)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const { name } = req.body;

    // ✅ ตรวจชื่อซ้ำ (ข้ามรายการของตัวเอง)
    if (name) {
      const dupName = await Product.findOne({
        _id: { $ne: req.params.id },
        name: new RegExp(`^${escapeRegex(name)}$`, 'i')
      });
      if (dupName) {
        return res.status(400).json({
          message: `สินค้าซ้ำ: ชื่อ "${name}" ถูกใช้โดยสินค้าอื่น (รหัส: ${dupName.sku})`
        });
      }
    }

    // ✅ กันผู้ใช้ส่ง SKU มาแก้เอง (ระบบเป็นผู้จัดการ)
    delete req.body.sku;

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' });
    res.json({ message: 'อัปเดตสินค้าสำเร็จ', product });
  } catch (error) {
    next(error);
  }
};

// @desc    ลบสินค้า (ปิดการใช้งาน + ลบสต็อกคงเหลือ + ยกเลิกคำขอค้าง)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'ไม่พบสินค้า' });

    // 1) ปิดการใช้งานสินค้า (เก็บเอกสารไว้อ้างอิงในประวัติธุรกรรม)
    product.isActive = false;
    await product.save();

    // 2) ✅ ลบสต็อกคงเหลือในคลังและร้านค้าทิ้ง
    const deletedInventory = await Inventory.deleteMany({ product: product._id });

    // 3) ✅ ยกเลิกคำขอนำเข้า / คำขอ Restock ที่ยังรออนุมัติของสินค้านี้
    await Transaction.updateMany(
      {
        product: product._id,
        status: 'pending',
        type: { $in: ['import_request', 'restock_request'] }
      },
      { $set: { status: 'rejected' } }
    );

    res.json({
      message: `ลบสินค้าสำเร็จ (ลบสต็อกคงเหลือ ${deletedInventory.deletedCount || 0} รายการออกจากคลัง/ร้าน)`
    });
  } catch (error) {
    next(error);
  }
};
