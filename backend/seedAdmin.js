const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔗 Connected to DB for seeding...');

    // ล้างข้อมูลเก่า (ระวัง! ใช้เฉพาะตอนพัฒนา)
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // สร้างบัญชีทดสอบ
    const users = await User.create([
      {
        username: 'admin',
        password: 'admin123',
        name: 'ผู้ดูแลระบบ',
        role: 'super_admin'
      },
      {
        username: 'warehouse01',
        password: 'wh1234',
        name: 'เจ้าหน้าที่คลังสินค้า',
        role: 'warehouse'
      },
      {
        username: 'shop01',
        password: 'shop123',
        name: 'พนักงานร้านค้า',
        role: 'shop'
      }
    ]);

    console.log(`✅ Seeded ${users.length} users successfully:`);
    users.forEach(u => console.log(`   - ${u.username} (${u.role})`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

seedUsers();