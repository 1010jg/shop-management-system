import api from './api'

export const inventoryService = {
  async getByLocation(location) {
    return await api.get(`/inventory/${location}`)
  },

  // Admin: นำเข้าโดยตรง
  async importStock(data) {
    return await api.post('/inventory/import', data)
  },

  // Warehouse: ส่งคำขอนำเข้า
  async requestImport(data) {
    return await api.post('/inventory/import-request', data)
  },

  // Admin: อนุมัติ / ปฏิเสธคำขอนำเข้า
  async approveImport(id) {
    return await api.put(`/inventory/import-approve/${id}`)
  },
  async rejectImport(id, reason) {
    return await api.put(`/inventory/import-reject/${id}`, { reason })
  },

  // Restock
  async requestRestock(data) {
    return await api.post('/inventory/restock-request', data)
  },
  async approveRestock(id) {
    return await api.put(`/inventory/restock-approve/${id}`)
  }
}