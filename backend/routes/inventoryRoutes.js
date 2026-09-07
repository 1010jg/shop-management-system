const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { adminOnly, warehouseAccess, shopAccess } = require('../middleware/role');
const {
  getInventoryByLocation,
  importStock,
  requestImport,
  approveImport,
  rejectImport,
  requestRestock,
  approveRestock
} = require('../controllers/inventoryController');

router.use(protect);

// ดูสต็อกตามสถานที่ (ทุก role ที่ login)
router.get('/:location', getInventoryByLocation);

// ✅ นำเข้าโดยตรง: เฉพาะ Admin
router.post('/import', adminOnly, importStock);

// ✅ ส่งคำขอนำเข้า: Warehouse (+ Admin)
router.post('/import-request', warehouseAccess, requestImport);

// ✅ อนุมัติ / ปฏิเสธคำขอนำเข้า: เฉพาะ Admin
router.put('/import-approve/:transactionId', adminOnly, approveImport);
router.put('/import-reject/:transactionId', adminOnly, rejectImport);

// Restock: Shop ขอ / Warehouse (+ Admin) อนุมัติ
router.post('/restock-request', shopAccess, requestRestock);
router.put('/restock-approve/:transactionId', warehouseAccess, approveRestock);

module.exports = router;