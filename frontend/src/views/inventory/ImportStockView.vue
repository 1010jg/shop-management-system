<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productService } from '../../services/productService'
import { inventoryService } from '../../services/inventoryService'
import { transactionService } from '../../services/transactionService'
import { useAuthStore } from '../../stores/auth'
import BaseButton from '../../components/BaseButton.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

// ========== State ==========
const products = ref([])
const requests = ref([])
const search = ref('')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const quantity = ref(1)
const note = ref('')
const selectedProduct = ref(null)

// Modal อนุมัติ/ปฏิเสธคำขอนำเข้า
const modal = reactive({ show: false, type: '', target: null })

const statusLabels = {
  pending: { text: 'รออนุมัติ', class: 'badge-warning' },
  approved: { text: 'อนุมัติแล้ว', class: 'badge-success' },
  rejected: { text: 'ถูกปฏิเสธ', class: 'badge-danger' }
}

// ========== ค้นหาสินค้า ==========
const suggestions = computed(() => {
  if (!search.value) return []
  const keyword = search.value.toLowerCase()
  return products.value
    .filter(p =>
      p.name?.toLowerCase().includes(keyword) ||
      p.sku?.toLowerCase().includes(keyword)
    )
    .slice(0, 8)
})

const showSuggestions = computed(() =>
  search.value.length > 0 && !selectedProduct.value
)

const selectProduct = (product) => {
  selectedProduct.value = product
  search.value = `${product.sku} - ${product.name}`
}

const clearSelection = () => {
  selectedProduct.value = null
  search.value = ''
}

// ========== บันทึก (Admin = นำเข้าทันที / Warehouse = ส่งคำขอ) ==========
const submitForm = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    if (!selectedProduct.value) {
      errorMessage.value = 'กรุณาพิมพ์ชื่อ/SKU แล้วเลือกสินค้าจากรายการ'
      return
    }

    if (quantity.value <= 0) {
      errorMessage.value = 'จำนวนที่นำเข้าต้องมากกว่า 0'
      return
    }

    if (isAdmin.value) {
      // Admin: นำเข้าเข้าคลังทันที
      await inventoryService.importStock({
        productId: selectedProduct.value._id,
        quantity: quantity.value,
        note: note.value
      })
      successMessage.value = `✅ นำเข้าสินค้า ${quantity.value} หน่วยเข้าคลังสำเร็จ`
    } else {
      // Warehouse: ส่งคำขอนำเข้า รออนุมัติ
      await inventoryService.requestImport({
        productId: selectedProduct.value._id,
        quantity: quantity.value,
        note: note.value
      })
      successMessage.value = '📨 ส่งคำขอนำเข้าเรียบร้อย รอผู้ดูแลระบบอนุมัติ'
    }

    // รีเซ็ตฟอร์ม
    quantity.value = 1
    note.value = ''
    clearSelection()

    await fetchData()
  } catch (error) {
    errorMessage.value = error.message || 'ดำเนินการไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

// ========== อนุมัติ / ปฏิเสธคำขอนำเข้า (Admin) ==========
const openModal = (type, target) => {
  modal.show = true
  modal.type = type
  modal.target = target
}

const confirmModal = async () => {
  try {
    loading.value = true
    if (modal.type === 'approve') {
      await inventoryService.approveImport(modal.target._id)
      successMessage.value = '✅ อนุมัติคำขอนำเข้าสำเร็จ สต็อกถูกเพิ่มเข้าคลังแล้ว'
    } else {
      await inventoryService.rejectImport(modal.target._id)
      successMessage.value = '❌ ปฏิเสธคำขอนำเข้าเรียบร้อย'
    }
    modal.show = false
    modal.target = null
    await fetchData()
  } catch (error) {
    alert(error.message || 'ดำเนินการไม่สำเร็จ')
  } finally {
    loading.value = false
  }
}

// ========== โหลดข้อมูล ==========
const fetchRequests = async () => {
  try {
    const data = await transactionService.getAll({ type: 'import_request' })
    requests.value = Array.isArray(data) ? data : []
  } catch (e) {
    requests.value = []
  }
}

const fetchData = async () => {
  try {
    const data = await productService.getAll()
    products.value = Array.isArray(data) ? data : []
  } catch (error) {
    errorMessage.value = 'โหลดรายการสินค้าไม่สำเร็จ'
  }
  await fetchRequests()
}

onMounted(fetchData)
</script>

<template>
  <div class="card max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">📥 นำเข้าสินค้าเข้าคลัง</h1>

    <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ errorMessage }}
    </p>
    <p v-if="successMessage" class="bg-green-100 text-green-700 p-3 rounded mb-4">
      {{ successMessage }}
    </p>

    <!-- แจ้งบทบาท Warehouse -->
    <div v-if="!isAdmin" class="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded mb-4 text-sm">
      💼 ในฐานะเจ้าหน้าที่คลังสินค้า การนำเข้าต้องส่งเป็น <b>คำขอ</b>
      และรอผู้ดูแลระบบอนุมัติจึงจะเข้าสต็อก
    </div>

    <form @submit.prevent="submitForm">
      <!-- เลือกสินค้าที่มีอยู่ -->
      <div class="mb-4 relative">
        <label class="label">ชื่อสินค้า / SKU <span class="text-red-500">*</span></label>
        <input
          v-model="search"
          type="text"
          class="input"
          placeholder="พิมพ์ชื่อสินค้าหรือ SKU เพื่อค้นหา..."
          autocomplete="off"
        />

        <div
          v-if="showSuggestions"
          class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-y-auto"
        >
          <button
            v-for="product in suggestions"
            :key="product._id"
            type="button"
            class="w-full text-left px-4 py-2 hover:bg-blue-50 transition"
            @click="selectProduct(product)"
          >
            <span class="font-mono text-xs text-gray-400">{{ product.sku }}</span>
            <span class="ml-2 font-medium">{{ product.name }}</span>
          </button>
          <p v-if="suggestions.length === 0" class="px-4 py-2 text-sm text-gray-500">
            ไม่พบสินค้าที่ค้นหา
          </p>
        </div>

        <div
          v-if="selectedProduct"
          class="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            <p class="font-semibold">{{ selectedProduct.name }}</p>
            <p class="text-xs text-gray-500">
              SKU: {{ selectedProduct.sku }} | ราคาทุน: ฿{{ selectedProduct.costPrice?.toLocaleString() }}
            </p>
          </div>
          <button type="button" class="text-red-500 text-sm hover:underline" @click="clearSelection">
            ✕ เปลี่ยน
          </button>
        </div>
      </div>

      <!-- จำนวน + หมายเหตุ -->
      <div class="mb-4">
        <label class="label">จำนวนที่นำเข้า <span class="text-red-500">*</span></label>
        <input v-model.number="quantity" type="number" min="1" class="input" required />
      </div>

      <div class="mb-6">
        <label class="label">หมายเหตุ</label>
        <textarea v-model="note" class="input" rows="3" placeholder="เช่น รับจากซัพพลายเออร์เจ้าประจำ..."></textarea>
      </div>

      <div class="flex gap-3">
        <BaseButton type="submit" :loading="loading">
          {{ isAdmin ? '💾 บันทึกการนำเข้า' : '📨 ส่งคำขอนำเข้า' }}
        </BaseButton>
        <BaseButton variant="secondary" @click="router.push('/inventory')">
          ยกเลิก
        </BaseButton>
      </div>
    </form>

    <!-- ===== รายการคำขอนำเข้า ===== -->
    <div class="mt-10 pt-6 border-t">
      <h2 class="text-lg font-bold mb-4">
        📋 รายการคำขอนำเข้า
        <span class="badge-warning ml-1">
          รออนุมัติ {{ requests.filter(r => r.status === 'pending').length }}
        </span>
      </h2>

      <div v-if="requests.length === 0" class="text-center text-gray-400 py-6">
        ยังไม่มีคำขอนำเข้า
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="req in requests"
          :key="req._id"
          class="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            <p class="font-semibold">{{ req.product?.name || 'สินค้า' }}</p>
            <p class="text-sm text-gray-500">
              จำนวน: <span class="font-bold text-blue-600">{{ req.quantity }}</span>
            </p>
            <p class="text-xs text-gray-400">
              ผู้ขอ: {{ req.performedBy?.name }}
              ({{ new Date(req.createdAt).toLocaleString('th-TH') }})
            </p>
          </div>

          <div class="flex items-center gap-2">
            <span :class="statusLabels[req.status]?.class || 'badge-info'">
              {{ statusLabels[req.status]?.text || req.status }}
            </span>

            <template v-if="isAdmin && req.status === 'pending'">
              <button class="btn-success !px-3 !py-1.5 !text-xs" @click="openModal('approve', req)">
                อนุมัติ
              </button>
              <button class="btn-danger !px-3 !py-1.5 !text-xs" @click="openModal('reject', req)">
                ปฏิเสธ
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยัน -->
    <ConfirmModal
      :show="modal.show"
      :danger="modal.type === 'reject'"
      :title="modal.type === 'approve' ? 'ยืนยันการอนุมัติคำขอนำเข้า' : 'ยืนยันการปฏิเสธคำขอนำเข้า'"
      :message="`${modal.target?.product?.name || ''} จำนวน ${modal.target?.quantity || 0} หน่วย`"
      :confirm-text="modal.type === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ'"
      @confirm="confirmModal"
      @cancel="modal.show = false"
    />
  </div>
</template>