<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import BaseButton from '../../components/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: ''
})

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const submitRegister = async () => {
  try {
    errorMessage.value = ''
    successMessage.value = ''

    // Validation ฝั่ง Frontend
    if (form.password.length < 6) {
      errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
      return
    }

    if (form.password !== form.confirmPassword) {
      errorMessage.value = 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน'
      return
    }

    loading.value = true

    await authStore.register({
      username: form.username,
      password: form.password,
      name: form.name
    })

    successMessage.value = '✅ สมัครสมาชิกสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...'

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  } catch (error) {
    errorMessage.value = error.message || 'สมัครสมาชิกไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card w-full max-w-md">
      <div class="text-center mb-6">
        <span class="text-4xl">📝</span>
        <h1 class="text-2xl font-bold mt-2">สมัครสมาชิก</h1>
        <p class="text-sm text-gray-500">สมัครเพื่อใช้งานระบบร้านค้า</p>
      </div>

      <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
        {{ errorMessage }}
      </p>

      <p v-if="successMessage" class="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
        {{ successMessage }}
      </p>

      <form @submit.prevent="submitRegister">
        <div class="mb-4">
          <label class="label">ชื่อผู้ใช้</label>
          <input
            v-model="form.username"
            class="input"
            placeholder="กรอกชื่อผู้ใช้"
            required
          />
        </div>

        <div class="mb-4">
          <label class="label">ชื่อ-นามสกุล</label>
          <input
            v-model="form.name"
            class="input"
            placeholder="กรอกชื่อ-นามสกุล"
            required
          />
        </div>

        <div class="mb-4">
          <label class="label">รหัสผ่าน</label>
          <input
            v-model="form.password"
            type="password"
            class="input"
            placeholder="อย่างน้อย 6 ตัวอักษร"
            required
          />
        </div>

        <div class="mb-6">
          <label class="label">ยืนยันรหัสผ่าน</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="input"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            required
          />
        </div>

        <BaseButton type="submit" class="w-full" :loading="loading">
          {{ loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก' }}
        </BaseButton>
      </form>

      <p class="text-center mt-4 text-sm text-gray-600">
        มีบัญชีอยู่แล้ว?
        <RouterLink to="/login" class="text-blue-600 font-semibold hover:underline">
          เข้าสู่ระบบ
        </RouterLink>
      </p>
    </div>
  </div>
</template>