const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Inventory = require('./models/Inventory');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

dotenv.config();

// ==========================================
// ข้อมูลสินค้าตั้งต้น 30 รายการ
// ==========================================
const productsData = [
  { sku: 'P001', name: 'Milk', description: 'Dairy staple', category: 'ผลิตภัณฑ์นม', unit: 'กล่อง', costPrice: 18, sellingPrice: 25, warehouseStock: 100, shopStock: 20, minStock: 10 },
  { sku: 'P002', name: 'Bread', description: 'Bakery essential', category: 'เบเกอรี่', unit: 'ถุง', costPrice: 20, sellingPrice: 30, warehouseStock: 80, shopStock: 15, minStock: 8 },
  { sku: 'P003', name: 'Eggs', description: 'Protein source', category: 'ไข่และโปรตีน', unit: 'แพ็ค', costPrice: 35, sellingPrice: 45, warehouseStock: 60, shopStock: 12, minStock: 6 },
  { sku: 'P004', name: 'Chicken breast', description: 'Lean meat', category: 'เนื้อสัตว์', unit: 'กก.', costPrice: 70, sellingPrice: 85, warehouseStock: 40, shopStock: 8, minStock: 5 },
  { sku: 'P005', name: 'Rice', description: 'Pantry staple', category: 'ของแห้ง', unit: 'ถุง', costPrice: 55, sellingPrice: 70, warehouseStock: 50, shopStock: 10, minStock: 5 },
  { sku: 'P006', name: 'Pasta', description: 'Carbohydrate base', category: 'ของแห้ง', unit: 'ถุง', costPrice: 25, sellingPrice: 35, warehouseStock: 60, shopStock: 12, minStock: 6 },
  { sku: 'P007', name: 'Canned tomatoes', description: 'Cooking ingredient', category: 'วัตถุดิบปรุงอาหาร', unit: 'กระป๋อง', costPrice: 18, sellingPrice: 25, warehouseStock: 70, shopStock: 15, minStock: 8 },
  { sku: 'P008', name: 'Olive oil', description: 'Cooking oil', category: 'น้ำมันปรุงอาหาร', unit: 'ขวด', costPrice: 120, sellingPrice: 150, warehouseStock: 30, shopStock: 6, minStock: 3 },
  { sku: 'P009', name: 'Cheese', description: 'Dairy product', category: 'ผลิตภัณฑ์นม', unit: 'กล่อง', costPrice: 60, sellingPrice: 75, warehouseStock: 40, shopStock: 8, minStock: 4 },
  { sku: 'P010', name: 'Yogurt', description: 'Probiotic snack', category: 'ผลิตภัณฑ์นม', unit: 'ถ้วย', costPrice: 12, sellingPrice: 18, warehouseStock: 90, shopStock: 18, minStock: 10 },
  { sku: 'P011', name: 'Coffee', description: 'Beverage', category: 'เครื่องดื่ม', unit: 'กระป๋อง', costPrice: 10, sellingPrice: 15, warehouseStock: 120, shopStock: 24, minStock: 12 },
  { sku: 'P012', name: 'Bottled water', description: 'Hydration', category: 'เครื่องดื่ม', unit: 'ขวด', costPrice: 4, sellingPrice: 7, warehouseStock: 200, shopStock: 40, minStock: 20 },
  { sku: 'P013', name: 'Bananas', description: 'Fruit', category: 'ผลไม้', unit: 'หวี', costPrice: 15, sellingPrice: 22, warehouseStock: 40, shopStock: 8, minStock: 4 },
  { sku: 'P014', name: 'Apples', description: 'Fruit', category: 'ผลไม้', unit: 'กก.', costPrice: 45, sellingPrice: 60, warehouseStock: 30, shopStock: 6, minStock: 3 },
  { sku: 'P015', name: 'Broccoli', description: 'Vegetable', category: 'ผัก', unit: 'กก.', costPrice: 40, sellingPrice: 55, warehouseStock: 25, shopStock: 5, minStock: 3 },
  { sku: 'P016', name: 'Carrots', description: 'Vegetable', category: 'ผัก', unit: 'กก.', costPrice: 25, sellingPrice: 35, warehouseStock: 30, shopStock: 6, minStock: 3 },
  { sku: 'P017', name: 'Potatoes', description: 'Staple vegetable', category: 'ผัก', unit: 'กก.', costPrice: 20, sellingPrice: 28, warehouseStock: 50, shopStock: 10, minStock: 5 },
  { sku: 'P018', name: 'Onions', description: 'Cooking ingredient', category: 'วัตถุดิบปรุงอาหาร', unit: 'กก.', costPrice: 22, sellingPrice: 30, warehouseStock: 35, shopStock: 7, minStock: 4 },
  { sku: 'P019', name: 'Ground beef', description: 'Meat', category: 'เนื้อสัตว์', unit: 'กก.', costPrice: 110, sellingPrice: 135, warehouseStock: 25, shopStock: 5, minStock: 3 },
  { sku: 'P020', name: 'Salmon', description: 'Seafood', category: 'อาหารทะเล', unit: 'กก.', costPrice: 180, sellingPrice: 220, warehouseStock: 20, shopStock: 4, minStock: 2 },
  { sku: 'P021', name: 'Peanut butter', description: 'Spread', category: 'ของทาขนมปัง', unit: 'กระปุก', costPrice: 45, sellingPrice: 60, warehouseStock: 35, shopStock: 7, minStock: 4 },
  { sku: 'P022', name: 'Cereal', description: 'Breakfast item', category: 'อาหารเช้า', unit: 'กล่อง', costPrice: 40, sellingPrice: 55, warehouseStock: 45, shopStock: 9, minStock: 5 },
  { sku: 'P023', name: 'Chips', description: 'Snack', category: 'ขนมขบเคี้ยว', unit: 'ถุง', costPrice: 10, sellingPrice: 15, warehouseStock: 100, shopStock: 20, minStock: 10 },
  { sku: 'P024', name: 'Cookies', description: 'Dessert/snack', category: 'ขนมขบเคี้ยว', unit: 'กล่อง', costPrice: 18, sellingPrice: 25, warehouseStock: 80, shopStock: 16, minStock: 8 },
  { sku: 'P025', name: 'Laundry detergent', description: 'Cleaning product', category: 'ของใช้ในบ้าน', unit: 'ถุง', costPrice: 35, sellingPrice: 48, warehouseStock: 40, shopStock: 8, minStock: 4 },
  { sku: 'P026', name: 'Dish soap', description: 'Kitchen cleaner', category: 'ของใช้ในบ้าน', unit: 'ขวด', costPrice: 15, sellingPrice: 22, warehouseStock: 60, shopStock: 12, minStock: 6 },
  { sku: 'P027', name: 'Paper towels', description: 'Household item', category: 'ของใช้ในบ้าน', unit: 'ม้วน', costPrice: 12, sellingPrice: 18, warehouseStock: 50, shopStock: 10, minStock: 5 },
  { sku: 'P028', name: 'Toilet paper', description: 'Bathroom essential', category: 'ของใช้ส่วนตัว', unit: 'ม้วน', costPrice: 8, sellingPrice: 12, warehouseStock: 80, shopStock: 16, minStock: 8 },
  { sku: 'P029', name: 'Shampoo', description: 'Personal care', category: 'ของใช้ส่วนตัว', unit: 'ขวด', costPrice: 25, sellingPrice: 35, warehouseStock: 45, shopStock: 9, minStock: 5 },
  { sku: 'P030', name: 'Deodorant', description: 'Personal care', category: 'ของใช้ส่วนตัว', unit: 'แท่ง', costPrice: 30, sellingPrice: 42, warehouseStock: 30, shopStock: 6, minStock: 3 }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to DB for seeding products...');

    // ล้างข้อมูลเก่า (ระวัง! ใช้เฉพาะตอนพัฒนา)
    await Product.deleteMany({});
    await Inventory.deleteMany({});
    await Transaction.deleteMany({});
    console.log('🗑️ Cleared existing products, inventory & transactions');

    // สร้างสินค้า
    const created = [];
    for (const item of productsData) {
      const product = await Product.create({
        sku: item.sku,
        name: item.name,
        description: item.description,
        category: item.category,
        unit: item.unit,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        isActive: true
      });
      created.push(product);
    }
    console.log(`📦 Created ${created.length} products`);

    // สร้างสต็อกทั้งฝั่งคลังและฝั่งร้าน
    const inventoryDocs = [];
    for (let i = 0; i < created.length; i++) {
      const data = productsData[i];
      inventoryDocs.push({
        product: created[i]._id,
        location: 'warehouse',
        quantity: data.warehouseStock,
        minStockLevel: data.minStock,
        lastRestockedAt: new Date()
      });
      inventoryDocs.push({
        product: created[i]._id,
        location: 'shop',
        quantity: data.shopStock,
        minStockLevel: data.minStock,
        lastRestockedAt: new Date()
      });
    }
    await Inventory.insertMany(inventoryDocs);
    console.log(`🏭 Created ${inventoryDocs.length} inventory records (warehouse + shop)`);

    // บันทึกประวัติการนำเข้าตั้งต้น (โดย admin)
    const admin = await User.findOne({ username: 'admin' });
    if (admin) {
      const transactions = created.map((product, i) => ({
        type: 'import',
        product: product._id,
        quantity: productsData[i].warehouseStock,
        fromLocation: 'external',
        toLocation: 'warehouse',
        performedBy: admin._id,
        note: 'นำเข้าสต็อกตั้งต้น (seed data)',
        status: 'completed'
      }));
      await Transaction.insertMany(transactions);
      console.log(`📥 Recorded ${transactions.length} import transactions`);
    } else {
      console.log('⚠️ ไม่พบบัญชี admin ข้ามการสร้างประวัติการนำเข้า (รัน npm run seed ก่อน)');
    }

    console.log('✅ Seed products completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Products Error:', error.message);
    process.exit(1);
  }
};

seedProducts();