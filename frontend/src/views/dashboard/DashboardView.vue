<script setup>
import { useAuthStore } from '../../stores/auth'
import { roleLabels } from '../../data/roles'

const authStore = useAuthStore()

const menus = [
  {
    title: 'รายการสินค้า',
    desc: 'ดูและค้นหาสินค้าทั้งหมดในระบบ',
    icon: '📦',
    to: '/products',
    color: 'hover:border-blue-400'
  },
  {
    title: 'คลังสินค้า',
    desc: 'ตรวจสอบสต็อกคงเหลือแต่ละสถานที่',
    icon: '🏭',
    to: '/inventory',
    color: 'hover:border-indigo-400'
  },
  {
    title: 'ขายสินค้า',
    desc: 'บันทึกการขายและตัดสต็อกร้าน',
    icon: '💰',
    to: '/sales',
    color: 'hover:border-green-400',
    roles: ['super_admin', 'shop']
  },
  {
    title: 'นำเข้าสินค้า',
    desc: 'นำเข้าสินค้าใหม่เข้าคลัง',
    icon: '📥',
    to: '/inventory/import',
    color: 'hover:border-orange-400',
    roles: ['super_admin', 'warehouse']
  },
  {
    title: 'ประวัติธุรกรรม',
    desc: 'ดูประวัติการนำเข้า ขาย และ Restock',
    icon: '📋',
    to: '/transactions',
    color: 'hover:border-purple-400'
  },
  {
    title: 'จัดการผู้ใช้',
    desc: 'เพิ่ม ลบ แก้ไขบัญชีพนักงาน',
    icon: '👥',
    to: '/admin/users',
    color: 'hover:border-red-400',
    roles: ['super_admin']
  }
]

const filteredMenus = menus.filter(
  m => !m.roles || m.roles.includes(authStore.user?.role)
)
</script>

<template>
  <div>
    <!-- Header -->
    <div class="card mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 !text-white">
      <h1 class="text-2xl font-bold text-white mb-1">
        สวัสดี, {{ authStore.userName }} 👋
      </h1>
      <p class="text-blue-100">
        บทบาท:
        <span class="font-semibold">
          {{ roleLabels[authStore.user?.role] || authStore.user?.role }}
        </span>
      </p>
    </div>

    <!-- Menu Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="menu in filteredMenus"
        :key="menu.title"
        :to="menu.to"
        class="card border-2 border-transparent transition-all hover:shadow-md"
        :class="menu.color"
      >
        <span class="text-3xl block mb-3">{{ menu.icon }}</span>
        <h2 class="text-lg font-bold mb-1">{{ menu.title }}</h2>
        <p class="text-sm text-gray-500">{{ menu.desc }}</p>
      </RouterLink>
    </div>
  </div>
</template>