import api from './api'

export const productService = {
  /** ดึงสินค้าทั้งหมด (รองรับ Search & Filter) */
  async getAll(params = {}) {
    return await api.get('/products', { params })
  },

  /** ดึงรายละเอียดสินค้าตาม ID */
  async getById(id) {
    return await api.get(`/products/${id}`)
  },

  /** เพิ่มสินค้าใหม่ */
  async create(productData) {
    return await api.post('/products', productData)
  },

  /** แก้ไขสินค้า */
  async update(id, productData) {
    return await api.put(`/products/${id}`, productData)
  },

  /** ลบสินค้า */
  async remove(id) {
    return await api.delete(`/products/${id}`)
  }
}