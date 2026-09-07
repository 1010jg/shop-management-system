const Transaction = require('../models/Transaction');
const Inventory = require('../models/Inventory');

// @desc    ดึงประวัติธุรกรรมทั้งหมด (กรองได้)
// @route   GET /api/transactions
// @access  All Authenticated
exports.getTransactions = async (req, res, next) => {
  try {
    const { type, startDate, endDate, location } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (location) {
      filter.$or = [
        { fromLocation: location },
        { toLocation: location }
      ];
    }

    const transactions = await Transaction.find(filter)
      .populate('product', 'name sku')
      .populate('performedBy', 'name username role')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

// @desc    ดึงรายละเอียดธุรกรรม
// @route   GET /api/transactions/:id
// @access  All Authenticated
exports.getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('product', 'name sku unit')
      .populate('performedBy', 'name username role');

    if (!transaction) {
      return res.status(404).json({ message: 'ไม่พบรายการธุรกรรม' });
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

// @desc    ขายสินค้า (ลดสต็อกร้าน + บันทึก Transaction)
// @route   POST /api/transactions/sale
// @access  Shop / SuperAdmin
exports.recordSale = async (req, res, next) => {
  try {
    const { productId, quantity, note } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'กรุณาระบุสินค้าและจำนวนที่ถูกต้อง' });
    }

    // ตรวจสอบสต็อกร้าน
    const shopStock = await Inventory.findOne({
      product: productId,
      location: 'shop'
    });

    if (!shopStock || shopStock.quantity < quantity) {
      return res.status(400).json({ message: 'สต็อกในร้านไม่เพียงพอ' });
    }

    // ลดสต็อกร้าน
    shopStock.quantity -= quantity;
    await shopStock.save();

    // บันทึก Transaction
    const transaction = await Transaction.create({
      type: 'sale',
      product: productId,
      quantity,
      fromLocation: 'shop',
      toLocation: null,
      performedBy: req.user.id,
      note,
      status: 'completed'
    });

    res.status(201).json({ message: 'บันทึกการขายสำเร็จ', transaction });
  } catch (error) {
    next(error);
  }
};