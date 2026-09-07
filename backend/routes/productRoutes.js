const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { adminOnly, warehouseAccess } = require('../middleware/role');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);

// ✅ เพิ่มสินค้าใหม่: เฉพาะ Admin
router.post('/', protect, adminOnly, createProduct);

// แก้ไขสินค้า: Admin + Warehouse
router.put('/:id', protect, warehouseAccess, updateProduct);

// ลบสินค้า: เฉพาะ Admin
router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;