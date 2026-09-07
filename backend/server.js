const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// โหลด Environment Variables
dotenv.config();

// เชื่อมต่อฐานข้อมูล
connectDB();

const app = express();

// Middleware กลาง
app.use(cors()); // สำคัญ! เพื่อให้ Vue.js เรียกข้ามพอร์ตได้
app.use(express.json()); // Parse JSON body

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Inventory & Shop API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});