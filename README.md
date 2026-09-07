# 📦 ระบบคลังสินค้าและร้านค้า (Inventory & Shop Management System)

โครงงานพัฒนา Web Application แบบ Full Stack สำหรับนักเรียน ปวช.
ระบบบริหารสต็อกสินค้า 2 ฝ่าย (คลังสินค้า + ร้านค้า) พร้อมระบบอนุมัติคำขอนำเข้า/Restock
และการขายสินค้าแบบตะกร้า บันทึกประวัติธุรกรรมครบถ้วน

---

## 🎯 ภาพรวมระบบ

ระบบแบ่งผู้ใช้งานเป็น 3 บทบาท ทำงานร่วมกันผ่าน REST API:

| บทบาท | หน้าที่หลัก |
| :--- | :--- |
| 👑 **ผู้ดูแลระบบ (super_admin)** | จัดการบัญชีพนักงาน, เพิ่ม/ลบสินค้า, นำเข้าสต็อกโดยตรง, อนุมัติคำขอนำเข้า, ดูประวัติทั้งหมด |
| 🏭 **เจ้าหน้าที่คลังสินค้า (warehouse)** | ส่งคำขอนำเข้าสินค้า, อนุมัติคำขอ Restock จากร้าน, แก้ไขข้อมูลสินค้า, ดูสต็อกคลัง |
| 🏪 **พนักงานร้านค้า (shop)** | ขายสินค้า (ตะกร้าหลายรายการ), ส่งคำขอ Restock จากคลัง, ดูสต็อกร้าน |

### Flow การทำงานหลัก
```
[นำเข้า]  ผู้ดูแล/คลังสร้างสินค้า → นำเข้าสต็อกเข้า "คลัง"
              (คลังส่งคำขอ → ผู้ดูแลอนุมัติ)
[Restock] ร้านส่งคำขอ → คลังอนุมัติ → สต็อกย้ายจาก "คลัง" → "ร้าน"
[ขาย]     ร้านขายสินค้า → สต็อก "ร้าน" ลด → บันทึกประวัติ
[ประวัติ] ทุกบทบาทดูประวัติการนำเข้า/ขาย/Restock ได้พร้อมตัวกรองและค้นหา
```

---

## 🛠️ เทคโนโลยีที่ใช้

| ส่วน | เทคโนโลยี |
| :--- | :--- |
| Frontend | Vue 3 (Composition API), Vite, Vue Router 4, Pinia, Axios |
| UI | Tailwind CSS 3 |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| อื่น ๆ | CORS, dotenv, nodemon |

---

## 📁 โครงสร้างโปรเจกต์

```text
project-root/
├── backend/
│   ├── config/db.js
│   ├── models/            # User, Product, Inventory, Transaction
│   ├── controllers/       # auth, user, product, inventory, transaction
│   ├── routes/            # auth, user, product, inventory, transaction
│   ├── middleware/        # auth.js (JWT), role.js (สิทธิ์ตามบทบาท)
│   ├── seedAdmin.js       # สร้างบัญชีทดสอบ 3 บทบาท
│   ├── seedProducts.js    # สร้างสินค้าตัวอย่าง 30 รายการ + สต็อก + ประวัติ
│   ├── server.js
│   ├── package.json
│   ├── .env
│   └── .gitignore
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env
    └── src/
        ├── main.js
        ├── App.vue
        ├── assets/main.css          # Tailwind + Custom component classes
        ├── components/              # Navbar, BaseButton, BaseInput,
        │                            # ConfirmModal, DataTable, ProductCard, CartItem
        ├── layouts/DefaultLayout.vue
        ├── router/index.js          # Routes + Navigation Guards
        ├── stores/                  # auth.js, cart.js (Pinia)
        ├── services/                # api, auth, product, user, inventory, transaction
        ├── data/categories.js       # หมวดหมู่สินค้าภาษาไทย
        └── views/
            ├── auth/                # Login, Register
            ├── dashboard/           # Dashboard ตามบทบาท
            ├── products/            # List, Add/Edit, Detail
            ├── inventory/           # Stock, Import, Restock
            ├── sales/               # POS แบบตะกร้า
            ├── transactions/        # ประวัติ + ค้นหา + Modal รายละเอียด
            ├── users/               # จัดการผู้ใช้ (Admin)
            └── NotFoundView.vue
```

---

## ⚙️ การติดตั้งและรันระบบ

### ความต้องการเบื้องต้น
- Node.js เวอร์ชัน 18 ขึ้นไป
- MongoDB (ติดตั้งในเครื่อง หรือใช้ MongoDB Atlas)

### 1) Backend

```bash
cd backend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env (ดูตัวอย่างด้านล่าง)

# สร้างบัญชีทดสอบ 3 บทบาท
npm run seed

# (ทางเลือก) สร้างสินค้าตัวอย่าง 30 รายการ + สต็อก + ประวัติการนำเข้า
npm run seed:products

# รันเซิร์ฟเวอร์ (พอร์ต 5000)
npm run dev
```

**ตัวอย่าง `backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/inventory_shop_db
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

### 2) Frontend

```bash
cd frontend

# ติดตั้ง dependencies
npm install

# รันแอป (พอร์ต 5173)
npm run dev
```

**ตัวอย่าง `frontend/.env`**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3) เปิดใช้งาน
เปิดเบราว์เซอร์ที่ `http://localhost:5173`

---

## 🔑 บัญชีทดสอบ

| บทบาท | ชื่อผู้ใช้ | รหัสผ่าน |
| :--- | :--- | :--- |
| 👑 ผู้ดูแลระบบ | `admin` | `admin123` |
| 🏭 เจ้าหน้าที่คลัง | `warehouse01` | `wh123` |
| 🏪 พนักงานร้านค้า | `shop01` | `shop123` |

> สมัครสมาชิกใหม่ผ่านหน้า Register จะได้บทบาท `shop` โดยอัตโนมัติ

---

## 🔌 สรุป REST API

### Authentication
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/register` | Public | สมัครสมาชิก |
| POST | `/api/auth/login` | Public | เข้าสู่ระบบ (คืน JWT) |

### Users (จัดการผู้ใช้)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| GET | `/api/users` | super_admin | รายชื่อผู้ใช้ทั้งหมด |
| POST | `/api/users` | super_admin | เพิ่มผู้ใช้ |
| PUT | `/api/users/:id` | super_admin | แก้ไขผู้ใช้ / เปลี่ยนบทบาท |
| DELETE | `/api/users/:id` | super_admin | ลบผู้ใช้ |

### Products (สินค้า)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| GET | `/api/products` | ทุกบทบาท | รายการสินค้า |
| GET | `/api/products/:id` | ทุกบทบาท | รายละเอียดสินค้า |
| POST | `/api/products` | super_admin | เพิ่มสินค้า (SKU อัตโนมัติ + ตรวจชื่อซ้ำ) |
| PUT | `/api/products/:id` | super_admin, warehouse | แก้ไขสินค้า |
| DELETE | `/api/products/:id` | super_admin | ลบสินค้า (ลบสต็อกคงเหลือด้วย) |

### Inventory (คลังสินค้า)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| GET | `/api/inventory/:location` | ทุกบทบาท | สต็อกตามสถานที่ (warehouse/shop) |
| POST | `/api/inventory/import` | super_admin | นำเข้าสต็อกเข้าคลังทันที |
| POST | `/api/inventory/import-request` | warehouse | ส่งคำขอนำเข้า (รออนุมัติ) |
| PUT | `/api/inventory/import-approve/:id` | super_admin | อนุมัติคำขอนำเข้า |
| PUT | `/api/inventory/import-reject/:id` | super_admin | ปฏิเสธคำขอนำเข้า |
| POST | `/api/inventory/restock-request` | shop | ส่งคำขอ Restock คลัง→ร้าน |
| PUT | `/api/inventory/restock-approve/:id` | super_admin, warehouse | อนุมัติ Restock |

### Transactions (ประวัติธุรกรรม)
| Method | Endpoint | สิทธิ์ | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| GET | `/api/transactions` | ทุกบทบาท | ประวัติ (กรอง type/วันที่ ได้) |
| GET | `/api/transactions/:id` | ทุกบทบาท | รายละเอียดธุรกรรม |
| POST | `/api/transactions/sale` | super_admin, shop | บันทึกการขาย (ตัดสต็อกร้าน) |

---

## 🛡️ ตารางสิทธิ์การเข้าถึง

| หน้า / การทำงาน | super_admin | warehouse | shop |
| :--- | :---: | :---: | :---: |
| Dashboard / รายการสินค้า / ประวัติ | ✅ | ✅ | ✅ |
| เพิ่มสินค้าใหม่ | ✅ | ❌ | ❌ |
| แก้ไขสินค้า | ✅ | ✅ | ❌ |
| ลบสินค้า | ✅ | ❌ | ❌ |
| นำเข้าสต็อกโดยตรง | ✅ | ❌ | ❌ |
| ส่งคำขอนำเข้า | ✅ | ✅ | ❌ |
| อนุมัติ/ปฏิเสธคำขอนำเข้า | ✅ | ❌ | ❌ |
| ขอ Restock (ร้าน) | ✅ | ❌ | ✅ |
| อนุมัติ Restock | ✅ | ✅ | ❌ |
| ขายสินค้า | ✅ | ❌ | ✅ |
| จัดการผู้ใช้ (หน้า Admin) | ✅ | ❌ | ❌ |

> การป้องกันสิทธิ์ทำ 2 ชั้น: **Backend Middleware** (`protect` + `adminOnly` /
> `warehouseAccess` / `shopAccess`) และ **Frontend Navigation Guard**
> (ตรวจสอบ `meta.roles` ก่อนเข้าหน้า) — ผู้ใช้ทั่วไปเข้าหน้า Admin ไม่ได้

---

## 🧪 ขั้นตอนทดสอบระบบ (Demo Script)

1. Login `shop01` → ขายสินค้าหลายชิ้นในตะกร้าเดียว → ตรวจสอบสต็อกร้านลดลง
2. Login `shop01` → ส่งคำขอ Restock สินค้าที่ใกล้หมด
3. Login `warehouse01` → หน้านำเข้า → ส่งคำขอนำเข้าสินค้า
4. Login `warehouse01` → จัดการ Restock → อนุมัติคำขอของร้าน (สต็อกย้ายคลัง→ร้าน)
5. Login `admin` → หน้านำเข้า → อนุมัติคำขอนำเข้าของคลัง (สต็อกคลังเพิ่ม)
6. Login `admin` → จัดการผู้ใช้ → เพิ่ม/แก้ไข/ลบ พนักงาน
7. ทุกบทบาท → หน้าประวัติ → ค้นหา/กรอง/กดปุ่ม 👁 ดูรายละเอียดเต็ม
8. ทดสอบความปลอดภัย: login `shop01` แล้วพิมพ์ URL `/admin/users` → ถูกเด้งกลับหน้า Dashboard

---

## ⚠️ ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
| :--- | :--- |
| `MongoDB Connection Error` | ตรวจสอบว่า MongoDB ทำงานอยู่ หรือแก้ `MONGO_URI` ใน `.env` |
| `Port 5000 already in use` | เปลี่ยน `PORT` ใน `.env` และแก้ `VITE_API_URL` ให้ตรงกัน |
| Frontend เรียก API ไม่ได้ | ตรวจสอบว่า Backend รันอยู่ และเปิด CORS ใน `server.js` |
| ถูกเด้งไปหน้า Login เอง | Token หมดอายุ (8 ชม.) ให้เข้าสู่ระบบใหม่ |
| ลืมรหัสผ่านทดสอบ | รัน `npm run seed` ใหม่ในโฟลเดอร์ backend |

---

## 📝 ผู้จัดทำ

โครงงานพัฒนา Web Application แบบ Full Stack
ระดับประกาศนียบัตรวิชาชีพ (ปวช.)

> จัดทำโดยได้รับความช่วยเหลือจากเครื่องมือ Generative AI ในการพัฒนาบางส่วน