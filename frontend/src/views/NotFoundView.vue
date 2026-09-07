<script setup>
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <span class="text-7xl mb-4">🔍</span>
    <h1 class="text-6xl font-bold text-blue-600 mb-2">404</h1>
    <h2 class="text-xl font-semibold mb-2">ไม่พบหน้าที่คุณต้องการ</h2>
    <p class="text-gray-500 mb-6">
      URL นี้อาจถูกลบ เปลี่ยนแปลง หรือไม่เคยมีอยู่ในระบบ
    </p>

    <BaseButton @click="router.push('/')">
      ← กลับหน้าหลัก
    </BaseButton>
  </div>
</template>