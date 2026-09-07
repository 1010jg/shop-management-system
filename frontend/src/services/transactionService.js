import api from './api'

export const transactionService = {
  /** 
   * ดึงประวัติธุรกรรมทั้งหมด 
   * @param {Object} params - { type, startDate, endDate, location }
   */
  async getAll(params = {}) {
    return await api.get('/transactions', { params })
  },

  /** ดึงรายละเอียดธุรกรรมตาม ID */
  async getById(id) {
    return await api.get(`/transactions/${id}`)
  },

  /** บันทึกการขาย (Shop) */
  async recordSale(data) {
    // data: { productId, quantity, note }
    return await api.post('/transactions/sale', data)
  }
}