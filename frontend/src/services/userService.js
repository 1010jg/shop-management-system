import api from './api'

export const userService = {
  /** ดึงรายชื่อผู้ใช้ทั้งหมด */
  async getAll() {
    return await api.get('/users')
  },

  /** ดึงข้อมูลผู้ใช้ตาม ID */
  async getById(id) {
    return await api.get(`/users/${id}`)
  },

  /** เพิ่มผู้ใช้ใหม่ */
  async create(userData) {
    return await api.post('/users', userData)
  },

  /** แก้ไขข้อมูลผู้ใช้ */
  async update(id, userData) {
    return await api.put(`/users/${id}`, userData)
  },

  /** ลบผู้ใช้ */
  async remove(id) {
    return await api.delete(`/users/${id}`)
  }
}