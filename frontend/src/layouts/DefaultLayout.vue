<script setup>
import Navbar from '../components/Navbar.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <!-- Navbar แสดงเฉพาะเมื่อ Login แล้ว -->
    <Navbar v-if="authStore.isLoggedIn" />

    <!-- Main Content -->
    <main 
      :class="[
        'transition-all duration-300 ease-in-out',
        authStore.isLoggedIn ? 'pt-20 pb-8 px-4' : 'py-8 px-4'
      ]"
    >
      <div class="container mx-auto max-w-7xl">
        <RouterView />
      </div>
    </main>
  </div>
</template>