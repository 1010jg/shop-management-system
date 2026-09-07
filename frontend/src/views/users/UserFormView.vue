<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { userService } from '../../services/userService'
import BaseButton from '../../components/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const userId = route.params.id
const isEdit = computed(() => !!userId)

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

const fetchUser = async () => {
  if (!isEdit.value) return

  try {
    loading.value = true

    // Backend ไม่มี GET /users/:id จึงดึงทั้งหมดแล้วหาตาม id
    const users = await userService.getAll()
    const user = users.find(u => u._id === userId)

    if (user) {
      Object.assign(form, {
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        password: '' // เว้นว่างไว้ถ้าไม่เปลี่ยน
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

    const payload = { ...form }

    // ตอนแก้ไข: ถ้าไม่เปลี่ยนรหัสผ่าน ให้ตัดฟิลด์ออก
    if (isEdit.value && !payload.password) {
      delete payload.password
    }

    // ตอนเพิ่ม: ต้องมีรหัสผ่านเสมอ
    if (!isEdit.value && payload.password.length < 6) {
      errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
      return
    }

    if (isEdit.value) {
      await userService.update(userId, payload)
      successMessage.value = '✅ แก้ไขผู้ใช้สำเร็จ'
    } else {
      await userService.create(payload)
      successMessage.value = '✅ เพิ่มผู้ใช้สำเร็จ'
    }

    setTimeout(() => router.push('/admin/users'), 800)
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
        <input
          v-model="form.username"
          class="input"
          placeholder="เช่น somchai"
          required
        />
      </div>

      <div class="mb-4">
        <label class="label">ชื่อ-นามสกุล <span class="text-red-500">*</span></label>
        <input
          v-model="form.name"
          class="input"
          placeholder="เช่น สมชาย ใจดี"
          required
        />
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

      <div class="mb-4">
        <label class="label">บทบาท <span class="text-red-500">*</span></label>
        <select v-model="form.role" class="input">
          <option value="shop">🏪 พนักงานร้านค้า</option>
          <option value="warehouse">🏭 เจ้าหน้าที่คลังสินค้า</option>
          <option value="super_admin">👑 ผู้ดูแลระบบ</option>
        </select>
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