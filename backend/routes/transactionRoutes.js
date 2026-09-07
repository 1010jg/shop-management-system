const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { shopAccess } = require('../middleware/role');
const { 
  getTransactions, 
  getTransactionById, 
  recordSale 
} = require('../controllers/transactionController');

// ทุก route ต้อง Login
router.use(protect);

// @route   GET /api/transactions
// @desc    ดึงประวัติธุรกรรมทั้งหมด (กรองด้วย query params)
// @access  ทุก role เข้าถึงได้ (ตอบโจทย์ "สองฝั่งเข้าถึงประวัติ")
router.get('/', getTransactions);

// @route   GET /api/transactions/:id
// @desc    ดึงรายละเอียดธุรกรรม
router.get('/:id', getTransactionById);

// @route   POST /api/transactions/sale
// @desc    บันทึกการขาย (Shop เท่านั้น)
router.post('/sale', shopAccess, recordSale);

module.exports = router;