<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Navbar from './components/Navbar.vue'

const authStore = useAuthStore()
const route = useRoute()

// ซ่อน Navbar ในหน้า Login/Register เพื่อให้ดูสะอาดตา
const isAuthPage = computed(() => {
  return ['Login', 'Register'].includes(route.name)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-800">
    <!-- แสดง Navbar เฉพาะเมื่อ Login แล้วและไม่ใช่หน้า Auth -->
    <Navbar v-if="authStore.isLoggedIn && !isAuthPage" />

    <main 
      :class="[
        'transition-all duration-300',
        authStore.isLoggedIn && !isAuthPage ? 'pt-20 px-4 pb-8' : ''
      ]"
    >
      <div class="container mx-auto max-w-7xl">
        <RouterView />
      </div>
    </main>
  </div>
</template>