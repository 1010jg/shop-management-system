<script setup>
import { ref, onMounted } from 'vue'
import { userService } from '../../services/userService'
import { useAuthStore } from '../../stores/auth'
import BaseButton from '../../components/BaseButton.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

const authStore = useAuthStore()

const users = ref([])
const loading = ref(false)
const errorMessage = ref('')

const showDeleteModal = ref(false)
const selectedUser = ref(null)

const roleLabels = {
  super_admin: { text: '👑 ผู้ดูแลระบบ', class: 'badge-danger' },
  warehouse: { text: '🏭 คลังสินค้า', class: 'badge-info' },
  shop: { text: '🏪 ร้านค้า', class: 'badge-success' }
}

const fetchUsers = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    users.value = await userService.getAll()
  } catch (error) {
    errorMessage.value = error.message || 'โหลดข้อมูลผู้ใช้ไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const openDeleteModal = (user) => {
  if (user._id === authStore.user?.id) {
    alert('⚠️ ไม่สามารถลบบัญชีของตัวเองได้')
    return
  }
  selectedUser.value = user
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  selectedUser.value = null
  showDeleteModal.value = false
}

const confirmDelete = async () => {
  try {
    await userService.remove(selectedUser.value._id)
    closeDeleteModal()
    await fetchUsers()
    alert('✅ ลบผู้ใช้สำเร็จ')
  } catch (error) {
    alert(error.message || 'ลบผู้ใช้ไม่สำเร็จ')
  }
}

onMounted(fetchUsers)
</script>

<template>
  <div class="card">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold">👥 จัดการผู้ใช้ (เฉพาะผู้ดูแลระบบ)</h1>

      <RouterLink to="/admin/users/add">
        <BaseButton>➕ เพิ่มผู้ใช้</BaseButton>
      </RouterLink>
    </div>

    <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ errorMessage }}
    </p>

    <div v-if="loading" class="text-center text-gray-500 py-12">
      กำลังโหลดข้อมูล...
    </div>

    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ชื่อผู้ใช้</th>
            <th>ชื่อ-นามสกุล</th>
            <th>บทบาท</th>
            <th>สถานะ</th>
            <th class="text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="users.length === 0">
            <td colspan="5" class="text-center text-gray-500 py-8">
              ไม่พบข้อมูลผู้ใช้
            </td>
          </tr>

          <tr v-for="user in users" :key="user._id">
            <td class="font-mono">
              {{ user.username }}
              <span v-if="user._id === authStore.user?.id" class="badge-info ml-1">
                คุณ
              </span>
            </td>
            <td>{{ user.name }}</td>
            <td>
              <span :class="roleLabels[user.role]?.class || 'badge-info'">
                {{ roleLabels[user.role]?.text || user.role }}
              </span>
            </td>
            <td>
              <span :class="user.isActive ? 'badge-success' : 'badge-danger'">
                {{ user.isActive ? 'ใช้งาน' : 'ปิดใช้งาน' }}
              </span>
            </td>
            <td>
              <div class="flex justify-center gap-2">
                <RouterLink
                  :to="`/admin/users/${user._id}/edit`"
                  class="btn-primary !px-3 !py-1.5 !text-xs"
                >
                  แก้ไข
                </RouterLink>

                <button
                  class="btn-danger !px-3 !py-1.5 !text-xs"
                  :disabled="user._id === authStore.user?.id"
                  @click="openDeleteModal(user)"
                >
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ConfirmModal
      :show="showDeleteModal"
      title="ยืนยันการลบผู้ใช้"
      :message="`คุณต้องการลบผู้ใช้ '${selectedUser?.username || ''}' ใช่หรือไม่?`"
      confirmText="ลบ"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>