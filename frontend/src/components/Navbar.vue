<script setup>
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { roleLabels, roleIcons } from '../data/roles'

const authStore = useAuthStore()
const router = useRouter()

const logout = () => {
  if (confirm('ต้องการออกจากระบบใช่หรือไม่?')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2 text-xl font-bold text-blue-600">
        <span class="text-2xl">📦</span>
        <span>InvShop</span>
      </RouterLink>

      <!-- Navigation Menu -->
      <div class="hidden md:flex items-center gap-1">
        <RouterLink 
          to="/products" 
          class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          สินค้า
        </RouterLink>

        <RouterLink 
          to="/inventory" 
          class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          คลังสินค้า
        </RouterLink>

        <RouterLink 
          v-if="authStore.isShop || authStore.isAdmin"
          to="/sales" 
          class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 transition"
        >
          💰 ขายสินค้า
        </RouterLink>

        <RouterLink 
          to="/transactions" 
          class="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
        >
          ประวัติ
        </RouterLink>

        <RouterLink 
          v-if="authStore.isAdmin"
          to="/admin/users" 
          class="px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          👥 จัดการผู้ใช้
        </RouterLink>
      </div>

      <!-- User Info & Logout -->
      <div class="flex items-center gap-3">
        <div class="text-right hidden sm:block">
          <p class="text-sm font-semibold text-gray-900">{{ authStore.user?.name }}</p>
          <p class="text-xs text-gray-500">
            {{ roleIcons[authStore.user?.role] }} {{ roleLabels[authStore.user?.role] || authStore.user?.role }}
          </p>
        </div>
        
        <button @click="logout" class="btn-secondary text-sm !px-3 !py-1.5">
          ออก
        </button>
      </div>
    </div>
  </nav>
</template>