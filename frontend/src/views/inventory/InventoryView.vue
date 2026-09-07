<script setup>
import { ref, computed, onMounted } from 'vue'
import { inventoryService } from '../../services/inventoryService'
import { useAuthStore } from '../../stores/auth'
import BaseButton from '../../components/BaseButton.vue'

const authStore = useAuthStore()

const items = ref([])
const loading = ref(false)
const errorMessage = ref('')
const search = ref('')

// สถานที่ที่แต่ละ Role ดูได้
const locations = computed(() => {
  if (authStore.isAdmin) return ['warehouse', 'shop']
  if (authStore.isWarehouse) return ['warehouse']
  if (authStore.isShop) return ['shop']
  return []
})

const activeLocation = ref(locations.value[0] || 'warehouse')

const filteredItems = computed(() => {
  if (!search.value) return items.value
  const keyword = search.value.toLowerCase()
  return items.value.filter(item =>
    item.product?.name?.toLowerCase().includes(keyword) ||
    item.product?.sku?.toLowerCase().includes(keyword)
  )
})

const fetchInventory = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    items.value = await inventoryService.getByLocation(activeLocation.value)
  } catch (error) {
    errorMessage.value = error.message || 'โหลดข้อมูลสต็อกไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const changeLocation = (location) => {
  activeLocation.value = location
  fetchInventory()
}

const stockStatus = (item) => {
  if (item.quantity === 0) return { text: 'หมดสต็อก', class: 'badge-danger' }
  if (item.quantity <= item.minStockLevel) return { text: 'สต็อกต่ำ', class: 'badge-warning' }
  return { text: 'ปกติ', class: 'badge-success' }
}

onMounted(fetchInventory)
</script>

<template>
  <div class="card">
    <!-- ✅ Header ใหม่: หัวข้อซ้าย | กลุ่มปุ่มขวา -->
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold">🏭 คลังสินค้า</h1>

      <!-- ✅ ครอบปุ่มทั้งหมดไว้ในกลุ่มเดียว -->
      <div class="flex flex-wrap items-center gap-2">
        <RouterLink v-if="authStore.isAdmin || authStore.isWarehouse" to="/inventory/import">
          <BaseButton>📥 นำเข้าสินค้า</BaseButton>
        </RouterLink>

        <RouterLink
          v-if="authStore.isAdmin || authStore.isWarehouse || authStore.isShop"
          to="/inventory/restock-request"
        >
          <BaseButton variant="success">
            {{ authStore.isShop ? '🔄 ขอ Restock' : '🔄 จัดการ Restock (อนุมัติคำขอ)' }}
          </BaseButton>
        </RouterLink>
      </div>
    </div>

    <!-- ✅ Toolbar: แท็บสถานที่ซ้าย + ช่องค้นหาขวา แถวเดียวกัน -->
    <div class="flex flex-wrap justify-between items-center gap-3 mb-4">
      <div class="flex gap-2">
        <button
          v-for="location in locations"
          :key="location"
          type="button"
          @click="changeLocation(location)"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition',
            activeLocation === location
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ location === 'warehouse' ? '🏭 คลังสินค้า' : '🏪 ร้านค้า' }}
        </button>
      </div>

      <input
        v-model="search"
        type="text"
        class="input !w-auto min-w-[220px]"
        placeholder="🔍 ค้นหาชื่อสินค้า หรือ SKU..."
      />
    </div>

    <!-- Error -->
    <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ errorMessage }}
    </p>

    <!-- Loading -->
    <div v-if="loading" class="p-12 text-center text-gray-500">
      กำลังโหลดข้อมูล...
    </div>

    <!-- ตารางสต็อก -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>ชื่อสินค้า</th>
            <th>คงเหลือ</th>
            <th>หน่วย</th>
            <th>ขั้นต่ำ</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredItems.length === 0">
            <td colspan="6" class="text-center text-gray-500 py-8">
              ไม่พบข้อมูลสต็อก
            </td>
          </tr>

          <tr v-for="item in filteredItems" :key="item._id">
            <td class="font-mono">{{ item.product?.sku }}</td>
            <td class="font-medium">{{ item.product?.name }}</td>
            <td class="font-bold">{{ item.quantity }}</td>
            <td>{{ item.product?.unit }}</td>
            <td>{{ item.minStockLevel }}</td>
            <td>
              <span :class="stockStatus(item).class">
                {{ stockStatus(item).text }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- สรุปจำนวน -->
    <p class="text-sm text-gray-500 mt-4 text-right">
      แสดง {{ filteredItems.length }} จาก {{ items.length }} รายการ
    </p>
  </div>
</template>