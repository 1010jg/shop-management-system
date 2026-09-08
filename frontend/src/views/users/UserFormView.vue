<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../stores/auth'
import BaseButton from '../../components/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const userId = route.params.id
const isEdit = computed(() => !!userId)

// ✅ กำลังแก้ไขบัญชีของตนเองอยู่หรือไม่
const isSelf = computed(() =>
  isEdit.value && String(userId) === String(authStore.user?.id)
)

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  username: '',
  password: '',
  name: '',
  role: 'shop',
  isActive: true
})

const roleLabels = {
  super_admin: 'ผู้ดูแลระบบ',
  warehouse: 'เจ้าหน้าที่คลังสินค้า',
  shop: 'พนักงานร้านค้า'
}

const fetchUser = async () => {
  if (!isEdit.value) return
  try {
    loading.value = true
    const users = await userService.getAll()
    const user = users.find(u => u._id === userId)

    if (user) {
      Object.assign(form, {
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        password: ''
      })
    } else {
      errorMessage.value = 'ไม่พบข้อมูลผู้ใช้'
    }
  } catch (error) {
    errorMessage.value = error.message || 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const payload = { ...form }

    // ตอนแก้ไข: ถ้าไม่เปลี่ยนรหัสผ่าน ให้ตัดฟิลด์ออก
    if (isEdit.value && !payload.password) delete payload.password

    // ตอนเพิ่ม: ต้องมีรหัสผ่านเสมอ
    if (!isEdit.value && payload.password.length < 6) {
      errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
      return
    }

    // ✅ ห้ามส่ง role ไปเมื่อแก้ไขบัญชีตนเอง (Backend ก็กันไว้อีกชั้น)
    if (isSelf.value) delete payload.role

    if (isEdit.value) {
      const updated = await userService.update(userId, payload)
      successMessage.value = `✅ แก้ไขผู้ใช้สำเร็จ (บทบาทปัจจุบัน: ${roleLabels[updated.user?.role] || updated.user?.role})`
    } else {
      await userService.create(payload)
      successMessage.value = '✅ เพิ่มผู้ใช้สำเร็จ'
    }

    setTimeout(() => router.push('/admin/users'), 900)
  } catch (error) {
    errorMessage.value = error.message || 'บันทึกข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <div class="card max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">
      {{ isEdit ? '✏️ แก้ไขผู้ใช้' : '➕ เพิ่มผู้ใช้ใหม่' }}
    </h1>

    <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ errorMessage }}
    </p>

    <p v-if="successMessage" class="bg-green-100 text-green-700 p-3 rounded mb-4">
      {{ successMessage }}
    </p>

    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="label">ชื่อผู้ใช้ <span class="text-red-500">*</span></label>
        <input v-model="form.username" class="input" placeholder="เช่น somchai" required />
      </div>

      <div class="mb-4">
        <label class="label">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
        <input v-model="form.name" class="input" placeholder="เช่น สมชาย ใจดี" required />
      </div>

      <div class="mb-4">
        <label class="label">
          รหัสผ่าน
          <span v-if="!isEdit" class="text-red-500">*</span>
          <span v-else class="text-gray-400 text-xs">(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</span>
        </label>
        <input
          v-model="form.password"
          type="password"
          class="input"
          placeholder="อย่างน้อย 6 ตัวอักษร"
          :required="!isEdit"
        />
      </div>

      <!-- ✅ บทบาท: ล็อกเมื่อแก้ตัวเอง + ไม่มีตัวเลือกผู้ดูแลตอนแก้ไขผู้อื่น -->
      <div class="mb-4">
        <label class="label">บทบาท <span class="text-red-500">*</span></label>
        <select v-model="form.role" class="input" :disabled="isSelf">
          <option value="shop">🏪 พนักงานร้านค้า</option>
          <option value="warehouse">🏭 เจ้าหน้าที่คลังสินค้า</option>
          <option
            v-if="!isEdit || form.role === 'super_admin'"
            value="super_admin"
            :disabled="isEdit"
          >
            👑 ผู้ดูแลระบบ{{ isEdit ? ' (บทบาทปัจจุบัน)' : '' }}
          </option>
        </select>

        <p v-if="isSelf" class="mt-1 text-xs text-gray-500">
          🔒 คุณกำลังแก้ไขบัญชีของตนเอง — ไม่สามารถแก้ไขบทบาทตนเองได้
        </p>
        <p v-else-if="isEdit && form.role === 'super_admin'" class="mt-1 text-xs text-gray-500">
          🔒 บัญชีนี้เป็นผู้ดูแลระบบอยู่แล้ว — ลดบทบาทได้ แต่จะเลื่อนกลับเป็นผู้ดูแลไม่ได้
        </p>
        <p v-else-if="isEdit" class="mt-1 text-xs text-gray-500">
          🔒 การแก้ไขไม่สามารถเลื่อนบทบาทเป็นผู้ดูแลระบบได้ (ต้องสร้างบัญชีใหม่เท่านั้น)
        </p>
      </div>

      <div class="mb-6">
        <label class="flex items-center gap-2 cursor-pointer">
          <input v-model="form.isActive" type="checkbox" class="w-4 h-4 accent-blue-600" />
          <span class="text-sm font-medium">เปิดใช้งานบัญชี</span>
        </label>
      </div>

      <div class="flex gap-3">
        <BaseButton type="submit" :loading="loading">
          {{ loading ? 'กำลังบันทึก...' : '💾 บันทึก' }}
        </BaseButton>

        <RouterLink to="/admin/users" class="btn-secondary">
          ยกเลิก
        </RouterLink>
      </div>
    </form>
  </div>
</template>