import { defineStore } from 'pinia'
import { authService } from '../services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
    
    isAdmin: (state) => state.user?.role === 'super_admin',
    isWarehouse: (state) => state.user?.role === 'warehouse',
    isShop: (state) => state.user?.role === 'shop',
    
    userName: (state) => state.user?.name || 'Guest',
    userRole: (state) => state.user?.role || ''
  },

  actions: {
    async login(credentials) {
      try {
        const response = await authService.login(credentials)
        
        this.token = response.token
        this.user = response.user
        
        // บันทึกลง LocalStorage เพื่อคงสถานะเมื่อ Refresh หน้า
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        return response
      } catch (error) {
        throw error
      }
    },

    async register(userData) {
      try {
        const response = await authService.register(userData)
        return response
      } catch (error) {
        throw error
      }
    },

    logout() {
      this.token = null
      this.user = null
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    // ใช้กรณีต้องการ refresh ข้อมูล user จาก backend
    setUser(user) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    }
  }
})