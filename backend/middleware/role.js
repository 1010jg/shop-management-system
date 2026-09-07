/**
 * @desc    ตรวจสอบสิทธิ์ Super Admin เท่านั้น
 * @usage   router.post('/users', protect, adminOnly, createUser)
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ 
    message: 'ไม่มีสิทธิ์เข้าถึง: ต้องเป็นผู้ดูแลระบบ (Admin) เท่านั้น' 
  });
};

/**
 * @desc    ตรวจสอบสิทธิ์ Warehouse หรือ Super Admin
 * @usage   router.post('/inventory/import', protect, warehouseAccess, importStock)
 */
const warehouseAccess = (req, res, next) => {
  if (req.user && ['super_admin', 'warehouse'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ 
    message: 'ไม่มีสิทธิ์เข้าถึง: ต้องเป็นเจ้าหน้าที่คลังสินค้าหรือผู้ดูแลระบบ' 
  });
};

/**
 * @desc    ตรวจสอบสิทธิ์ Shop หรือ Super Admin
 * @usage   router.post('/transactions/sale', protect, shopAccess, recordSale)
 */
const shopAccess = (req, res, next) => {
  if (req.user && ['super_admin', 'shop'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ 
    message: 'ไม่มีสิทธิ์เข้าถึง: ต้องเป็นพนักงานร้านค้าหรือผู้ดูแลระบบ' 
  });
};

/**
 * @desc    ตรวจสอบสิทธิ์แบบยืดหยุ่น (ระบุ roles ที่อนุญาต)
 * @usage   router.get('/report', protect, allowRoles('super_admin', 'warehouse'), getReport)
 */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ 
      message: `ไม่มีสิทธิ์เข้าถึง: ต้องมีบทบาท ${roles.join(', ')} เท่านั้น` 
    });
  };
};

module.exports = { 
  adminOnly, 
  warehouseAccess, 
  shopAccess, 
  allowRoles 
};