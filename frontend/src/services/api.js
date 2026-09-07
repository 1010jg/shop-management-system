import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor: แนบ JWT Token อัตโนมัติทุก Request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: จัดการ Error ส่วนกลาง
api.interceptors.response.use(
  (response) => response.data, // คืนค่าเฉพาะ data โดยตรง
  (error) => {
    const message = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'
    
    // ถ้า Token หมดอายุหรือไม่ถูกต้อง → Logout อัตโนมัติ
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // ป้องกัน Loop Redirect
      if (window.location.pathname !== '/login') {
        alert('⚠️ เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
        window.location.href = '/login'
      }
    }
    
    return Promise.reject({ message, status: error.response?.status })
  }
)

export default api