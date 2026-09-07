import api from './api'

export const authService = {
  /**
   * เข้าสู่ระบบ
   * @param {Object} credentials - { username, password }
   */
  async login(credentials) {
    return await api.post('/auth/login', credentials)
  },

  /**
   * สมัครสมาชิก
   * @param {Object} userData - { username, password, name }
   */
  async register(userData) {
    return await api.post('/auth/register', userData)
  }
}