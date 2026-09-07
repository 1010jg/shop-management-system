<script setup>
import { ref, computed, onMounted } from 'vue'
import { productService } from '../../services/productService'
import { useAuthStore } from '../../stores/auth'
import BaseButton from '../../components/BaseButton.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

const authStore = useAuthStore()

const products = ref([])
const loading = ref(false)
const errorMessage = ref('')
const search = ref('')

const showDeleteModal = ref(false)
const selectedProduct = ref(null)

const canManage = computed(() => authStore.isAdmin || authStore.isWarehouse)

const filteredProducts = computed(() => {
  if (!search.value) return products.value
  const keyword = search.value.toLowerCase()
  return products.value.filter(p =>
    p.name?.toLowerCase().includes(keyword) ||
    p.sku?.toLowerCase().includes(keyword) ||
    p.category?.toLowerCase().includes(keyword)
  )
})

const fetchProducts = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    products.value = await productService.getAll()
  } catch (error) {
    errorMessage.value = error.message || 'โหลดข้อมูลสินค้าไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const openDeleteModal = (product) => {
  selectedProduct.value = product
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  selectedProduct.value = null
  showDeleteModal.value = false
}

const confirmDelete = async () => {
  try {
    await productService.remove(selectedProduct.value._id)
    closeDeleteModal()
    await fetchProducts()
    alert('✅ ลบสินค้าสำเร็จ')
  } catch (error) {
    alert(error.message || 'ลบสินค้าไม่สำเร็จ')
  }
}

onMounted(fetchProducts)
</script>

<template>
  <div class="card">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold">📦 รายการสินค้า</h1>

      <RouterLink v-if="authStore.isAdmin" to="/products/add">
        <BaseButton>➕ เพิ่มสินค้า</BaseButton>
      </RouterLink>
    </div>

    <!-- Search -->
    <input
      v-model="search"
      class="input mb-4 max-w-md"
      placeholder="🔍 ค้นหาชื่อสินค้า, SKU หรือหมวดหมู่..."
    />

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
            <th>SKU</th>
            <th>ชื่อสินค้า</th>
            <th>หมวดหมู่</th>
            <th>ราคาขาย</th>
            <th>สถานะ</th>
            <th class="text-center">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredProducts.length === 0">
            <td colspan="6" class="text-center text-gray-500 py-8">
              ไม่พบข้อมูลสินค้า
            </td>
          </tr>

          <tr v-for="product in filteredProducts" :key="product._id">
            <td class="font-mono">{{ product.sku }}</td>
            <td class="font-medium">{{ product.name }}</td>
            <td>{{ product.category }}</td>
            <td>฿{{ product.sellingPrice?.toLocaleString() }}</td>
            <td>
              <span :class="product.isActive ? 'badge-success' : 'badge-danger'">
                {{ product.isActive ? 'ใช้งาน' : 'ปิดใช้งาน' }}
              </span>
            </td>
            <td>
              <div class="flex justify-center gap-2">
                <RouterLink
                  :to="`/products/${product._id}`"
                  class="btn-secondary !px-3 !py-1.5 !text-xs"
>
                  ดู
                </RouterLink>

                <RouterLink
                  v-if="canManage"
                  :to="`/products/${product._id}/edit`"
                  class="btn-primary !px-3 !py-1.5 !text-xs"
                >
                  แก้ไข
                </RouterLink>

                <button
                  v-if="authStore.isAdmin"
                  class="btn-danger !px-3 !py-1.5 !text-xs"
                  @click="openDeleteModal(product)"
                >
                  ลบ
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal ยืนยันก่อนลบ (บังคับตามโจทย์) -->
    <ConfirmModal
      :show="showDeleteModal"
      title="ยืนยันการลบสินค้า"
      :message="`คุณต้องการลบสินค้า '${selectedProduct?.name || ''}' ใช่หรือไม่?`"
      confirmText="ลบ"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>