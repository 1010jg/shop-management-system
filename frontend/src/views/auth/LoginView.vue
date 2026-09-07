<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import BaseButton from '../../components/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref('')

const submitLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    await authStore.login(form)

    // ถ้ามี redirect query (มาจาก Guard) ให้กลับไปที่หน้านั้น
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    errorMessage.value = error.message || 'เข้าสู่ระบบไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card w-full max-w-md">
      <div class="text-center mb-6">
        <span class="text-4xl">📦</span>
        <h1 class="text-2xl font-bold mt-2">เข้าสู่ระบบ</h1>
        <p class="text-sm text-gray-500">ระบบคลังสินค้าและร้านค้า</p>
      </div>

      <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
        {{ errorMessage }}
      </p>

      <form @submit.prevent="submitLogin">
        <div class="mb-4">
          <label class="label">ชื่อผู้ใช้</label>
          <input
            v-model="form.username"
            class="input"
            placeholder="กรอกชื่อผู้ใช้"
            required
          />
        </div>

        <div class="mb-6">
          <label class="label">รหัสผ่าน</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="กรอกรหัสผ่าน"
            required
          />
        </div>

        <BaseButton type="submit" class="w-full" :loading="loading">
          {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
        </BaseButton>
      </form>

      <p class="text-center mt-4 text-sm text-gray-600">
        ยังไม่มีบัญชี?
        <RouterLink to="/register" class="text-blue-600 font-semibold hover:underline">
          สมัครสมาชิก
        </RouterLink>
      </p>

      <!-- บัญชีทดสอบสำหรับนำเสนออาจารย์ -->
      <div class="mt-6 bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
        <p class="font-semibold mb-2">🧪 บัญชีทดสอบ:</p>
        <p>👑 admin / admin123 (ผู้ดูแลระบบ)</p>
        <p>🏭 warehouse01 / wh1234 (คลังสินค้า)</p>
        <p>🏪 shop01 / shop123 (ร้านค้า)</p>
      </div>
    </div>
  </div>
</template>