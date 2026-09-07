const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');

// @desc    ดึงสต็อกตามสถานที่ (แสดงเฉพาะสินค้าที่ยังเปิดใช้งาน)
// @route   GET /api/inventory/:location
exports.getInventoryByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;
    if (!['warehouse', 'shop'].includes(location)) {
      return res.status(400).json({ message: 'ระบุสถานที่เก็บไม่ถูกต้อง' });
    }

    const items = await Inventory.find({ location })
      .populate('product', 'sku name unit sellingPrice costPrice image isActive')
      .sort({ createdAt: -1 });

    // ✅ ข้ามสต็อกของสินค้าที่ถูกลบ/ปิดใช้งาน (กันข้อมูลเก่าค้าง)
    const activeItems = items.filter(i => i.product && i.product.isActive !== false);

    res.json(activeItems);
  } catch (error) {
    next(error);
  }
};

// @desc    นำเข้าสินค้าเข้าคลัง
// @route   POST /api/inventory/import
// @access  Warehouse / SuperAdmin
exports.importStock = async (req, res, next) => {
  try {
    const { productId, quantity, note } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'กรุณาระบุสินค้าและจำนวนที่ถูกต้อง' });
    }

    // อัปเดตสต็อกคลัง
    const inventory = await Inventory.findOneAndUpdate(
      { product: productId, location: 'warehouse' },
      { $inc: { quantity }, lastRestockedAt: new Date() },
      { new: true, upsert: true }
    ).populate('product', 'name sku');

    // บันทึก Transaction
    await Transaction.create({
      type: 'import',
      product: productId,
      quantity,
      fromLocation: 'external',
      toLocation: 'warehouse',
      performedBy: req.user.id,
      note,
      status: 'completed'
    });

    res.json({ message: 'นำเข้าสินค้าสำเร็จ', inventory });
  } catch (error) {
    next(error);
  }
};

// @desc    ขอ Restock จากคลังไปร้าน
// @route   POST /api/inventory/restock-request
// @access  Shop / SuperAdmin
exports.requestRestock = async (req, res, next) => {
  try {
    const { productId, quantity, note } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'กรุณาระบุสินค้าและจำนวนที่ถูกต้อง' });
    }

    // บันทึกเป็น pending transaction
    const transaction = await Transaction.create({
      type: 'restock_request',
      product: productId,
      quantity,
      fromLocation: 'warehouse',
      toLocation: 'shop',
      performedBy: req.user.id,
      note,
      status: 'pending'
    });

    res.status(201).json({ message: 'ส่งคำขอ Restock สำเร็จ', transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    อนุมัติ Restock (ตัดคลัง + เพิ่มร้าน)
// @route   PUT /api/inventory/restock-approve/:transactionId
// @access  Warehouse / SuperAdmin
exports.approveRestock = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction || transaction.type !== 'restock_request') {
      return res.status(404).json({ message: 'ไม่พบคำขอ Restock' });
    }
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'คำขอนี้ถูกดำเนินการไปแล้ว' });
    }

    // ตรวจสอบสต็อกคลังเพียงพอไหม
    const warehouseStock = await Inventory.findOne({
      product: transaction.product,
      location: 'warehouse'
    });

    if (!warehouseStock || warehouseStock.quantity < transaction.quantity) {
      return res.status(400).json({ message: 'สต็อกในคลังไม่เพียงพอ' });
    }

    // ตัดสต็อกคลัง
    warehouseStock.quantity -= transaction.quantity;
    await warehouseStock.save();

    // เพิ่มสต็อกร้าน
    await Inventory.findOneAndUpdate(
      { product: transaction.product, location: 'shop' },
      { $inc: { quantity: transaction.quantity }, lastRestockedAt: new Date() },
      { upsert: true }
    );

    // อัปเดตสถานะ transaction เดิม
    transaction.status = 'approved';
    await transaction.save();

    // สร้าง transaction ใหม่สำหรับ approve
    await Transaction.create({
      type: 'restock_approve',
      product: transaction.product,
      quantity: transaction.quantity,
      fromLocation: 'warehouse',
      toLocation: 'shop',
      performedBy: req.user.id,
      referenceId: transaction._id.toString(),
      status: 'completed'
    });

    res.json({ message: 'อนุมัติ Restock สำเร็จ' });
  } catch (error) {
    next(error);
  }
};
// @desc    สร้างคำขอนำเข้าสินค้า (Warehouse ส่งคำขอ)
// @route   POST /api/inventory/import-request
exports.requestImport = async (req, res, next) => {
  try {
    const { productId, quantity, note } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'กรุณาระบุสินค้าและจำนวนที่ถูกต้อง' });
    }

    const transaction = await Transaction.create({
      type: 'import_request',
      product: productId,
      quantity,
      fromLocation: 'external',
      toLocation: 'warehouse',
      performedBy: req.user.id,
      note,
      status: 'pending'
    });

    res.status(201).json({ message: 'ส่งคำขอนำเข้าสำเร็จ รอการอนุมัติ', transaction });
  } catch (error) {
    next(error);
  }
};

// @desc    อนุมัติคำขอนำเข้า (Admin) → เพิ่มสต็อกเข้าคลัง
// @route   PUT /api/inventory/import-approve/:transactionId
exports.approveImport = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction || transaction.type !== 'import_request') {
      return res.status(404).json({ message: 'ไม่พบคำขอนำเข้า' });
    }
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'คำขอนี้ถูกดำเนินการไปแล้ว' });
    }

    // เพิ่มสต็อกฝั่งคลัง
    await Inventory.findOneAndUpdate(
      { product: transaction.product, location: 'warehouse' },
      { $inc: { quantity: transaction.quantity }, lastRestockedAt: new Date() },
      { upsert: true }
    );

    transaction.status = 'approved';
    await transaction.save();

    // บันทึกประวัติการนำเข้าจริง
    await Transaction.create({
      type: 'import',
      product: transaction.product,
      quantity: transaction.quantity,
      fromLocation: 'external',
      toLocation: 'warehouse',
      performedBy: req.user.id,
      referenceId: transaction._id.toString(),
      note: 'อนุมัติคำขอนำเข้า',
      status: 'completed'
    });

    res.json({ message: 'อนุมัติคำขอนำเข้าสำเร็จ สต็อกถูกเพิ่มเข้าคลังแล้ว' });
  } catch (error) {
    next(error);
  }
};

// @desc    ปฏิเสธคำขอนำเข้า (Admin)
// @route   PUT /api/inventory/import-reject/:transactionId
exports.rejectImport = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction || transaction.type !== 'import_request') {
      return res.status(404).json({ message: 'ไม่พบคำขอนำเข้า' });
    }
    if (transaction.status !== 'pending') {
      return res.status(400).json({ message: 'คำขอนี้ถูกดำเนินการไปแล้ว' });
    }

    transaction.status = 'rejected';
    if (req.body.reason) {
      transaction.note = `${transaction.note || ''} [ปฏิเสธ: ${req.body.reason}]`.trim();
    }
    await transaction.save();

    res.json({ message: 'ปฏิเสธคำขอนำเข้าเรียบร้อย' });
  } catch (error) {
    next(error);
  }
};