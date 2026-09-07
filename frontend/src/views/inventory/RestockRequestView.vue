<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { productService } from '../../services/productService'
import { inventoryService } from '../../services/inventoryService'
import { transactionService } from '../../services/transactionService'
import { useAuthStore } from '../../stores/auth'
import BaseButton from '../../components/BaseButton.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'

const authStore = useAuthStore()

const products = ref([])
const pendingRequests = ref([])
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  productId: '',
  quantity: 1,
  note: ''
})

const showApproveModal = ref(false)
const selectedRequest = ref(null)

const canApprove = computed(() => authStore.isAdmin || authStore.isWarehouse)

const fetchData = async () => {
  try {
    loading.value = true
    products.value = await productService.getAll()

    // ดึงคำขอ Restock ที่รอการอนุมัติ
    const transactions = await transactionService.getAll({ type: 'restock_request' })
    pendingRequests.value = transactions.filter(t => t.status === 'pending')
  } catch (error) {
    errorMessage.value = error.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const submitRequest = async () => {
  try {
    if (!form.productId) {
      errorMessage.value = 'กรุณาเลือกสินค้า'
      return
    }

    loading.value = true
    errorMessage.value = ''

    await inventoryService.requestRestock(form)
    successMessage.value = '✅ ส่งคำขอ Restock สำเร็จ รอการอนุมัติจากคลัง'

    form.productId = ''
    form.quantity = 1
    form.note = ''

    await fetchData()
  } catch (error) {
    errorMessage.value = error.message || 'ส่งคำขอไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const openApproveModal = (request) => {
  selectedRequest.value = request
  showApproveModal.value = true
}

const approveRequest = async () => {
  try {
    await inventoryService.approveRestock(selectedRequest.value._id)
    successMessage.value = '✅ อนุมัติ Restock สำเร็จ'
    showApproveModal.value = false
    selectedRequest.value = null
    await fetchData()
  } catch (error) {
    alert(error.message || 'อนุมัติไม่สำเร็จ')
    showApproveModal.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- ส่วนส่งคำขอ (สำหรับ Shop) -->
    <div v-if="authStore.isShop || authStore.isAdmin" class="card">
      <h1 class="text-xl font-bold mb-6">🔄 ขอ Restock สินค้า</h1>

      <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4">
        {{ errorMessage }}
      </p>

      <p v-if="successMessage" class="bg-green-100 text-green-700 p-3 rounded mb-4">
        {{ successMessage }}
      </p>

      <form @submit.prevent="submitRequest">
        <div class="mb-4">
          <label class="label">เลือกสินค้า <span class="text-red-500">*</span></label>
          <select v-model="form.productId" class="input" required>
            <option value="" disabled>-- เลือกสินค้า --</option>
            <option v-for="product in products" :key="product._id" :value="product._id">
              {{ product.sku }} - {{ product.name }}
            </option>
          </select>
        </div>

        <div class="mb-4">
          <label class="label">จำนวน <span class="text-red-500">*</span></label>
          <input v-model.number="form.quantity" type="number" min="1" class="input" required />
        </div>

        <div class="mb-6">
          <label class="label">หมายเหตุ</label>
          <textarea v-model="form.note" class="input" rows="3" placeholder="เหตุผลที่ขอ..."></textarea>
        </div>

        <BaseButton type="submit" :loading="loading" class="w-full">
          ส่งคำขอ
        </BaseButton>
      </form>
    </div>

    <!-- ส่วนอนุมัติ (สำหรับ Warehouse) -->
    <div class="card">
      <h1 class="text-xl font-bold mb-6">
        📋 คำขอที่รอการอนุมัติ 
        <span class="badge-warning ml-2">{{ pendingRequests.length }}</span>
      </h1>

      <div v-if="loading" class="text-center text-gray-500 py-8">กำลังโหลด...</div>

      <div v-else-if="pendingRequests.length === 0" class="text-center text-gray-500 py-8">
        🎉 ไม่มีคำขอที่รอการอนุมัติ
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="request in pendingRequests"
          :key="request._id"
          class="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
        >
          <div>
            <p class="font-semibold">{{ request.product?.name || 'สินค้า' }}</p>
            <p class="text-sm text-gray-500">
              จำนวน: <span class="font-bold text-blue-600">{{ request.quantity }}</span>
            </p>
            <p class="text-xs text-gray-400">
              โดย: {{ request.performedBy?.name }} 
              ({{ new Date(request.createdAt).toLocaleString('th-TH') }})
            </p>
          </div>

          <BaseButton
            v-if="canApprove"
            variant="success"
            size="sm"
            @click="openApproveModal(request)"
          >
            อนุมัติ
          </BaseButton>
          <span v-else class="badge-warning">รอการอนุมัติ</span>
        </div>
      </div>
    </div>

    <!-- Modal ยืนยันอนุมัติ -->
    <ConfirmModal
      :show="showApproveModal"
      :danger="false"
      title="ยืนยันการอนุมัติ"
      :message="`อนุมัติการ Restock ${selectedRequest?.product?.name || ''} จำนวน ${selectedRequest?.quantity || 0} หน่วย?`"
      confirmText="อนุมัติ"
      @confirm="approveRequest"
      @cancel="showApproveModal = false"
    />
  </div>
</template>