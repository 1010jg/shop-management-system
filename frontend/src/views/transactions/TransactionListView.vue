<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { transactionService } from '../../services/transactionService'
import BaseButton from '../../components/BaseButton.vue'

const transactions = ref([])
const loading = ref(false)
const errorMessage = ref('')
const refreshMessage = ref('')

// ========== ค้นหา ==========
const searchInput = ref('')
const searchKeyword = ref('')

// ========== ตัวกรอง ==========
const filter = reactive({
  type: '',
  startDate: '',
  endDate: ''
})

// ========== Modal รายละเอียดเต็ม ==========
const showDetailModal = ref(false)
const selectedTx = ref(null)

const openDetail = (tx) => {
  selectedTx.value = tx
  showDetailModal.value = true
}

const typeLabels = {
  import: { text: '📥 นำเข้า', class: 'badge-info' },
  import_request: { text: '📨 ขอนำเข้า', class: 'badge-warning' },
  sale: { text: '💰 ขาย', class: 'badge-success' },
  restock_request: { text: '🔄 ขอ Restock', class: 'badge-warning' },
  restock_approve: { text: '✅ อนุมัติ Restock', class: 'badge-info' },
  adjustment: { text: '⚙️ ปรับสต็อก', class: 'badge-danger' }
}

const statusLabels = {
  pending: { text: 'รอดำเนินการ', class: 'badge-warning' },
  approved: { text: 'อนุมัติแล้ว', class: 'badge-success' },
  rejected: { text: 'ปฏิเสธ', class: 'badge-danger' },
  completed: { text: 'เสร็จสิ้น', class: 'badge-success' }
}

const formatFrom = (tx) => {
  if (tx.fromLocation === 'external') return 'ภายนอก'
  if (tx.fromLocation === 'warehouse') return 'คลัง'
  if (tx.fromLocation === 'shop') return 'ร้าน'
  return '-'
}

const formatTo = (tx) => {
  if (tx.type === 'sale') return 'ลูกค้า'
  if (tx.toLocation === 'warehouse') return 'คลัง'
  if (tx.toLocation === 'shop') return 'ร้าน'
  return '-'
}

// ========== กรองด้วยคำค้น ==========
const filteredTransactions = computed(() => {
  if (!searchKeyword.value) return transactions.value

  const kw = searchKeyword.value.toLowerCase()
  return transactions.value.filter(tx =>
    tx.product?.name?.toLowerCase().includes(kw) ||
    tx.product?.sku?.toLowerCase().includes(kw) ||
    tx.performedBy?.name?.toLowerCase().includes(kw) ||
    tx.performedBy?.username?.toLowerCase().includes(kw) ||
    (typeLabels[tx.type]?.text || tx.type).toLowerCase().includes(kw) ||
    (tx.note || '').toLowerCase().includes(kw)
  )
})

// ========== ดึงข้อมูล ==========
const fetchTransactions = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const params = {}
    if (filter.type) params.type = filter.type
    if (filter.startDate) params.startDate = filter.startDate
    if (filter.endDate) params.endDate = filter.endDate

    transactions.value = await transactionService.getAll(params)
  } catch (error) {
    errorMessage.value = error.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

// ========== ปุ่มต่างๆ ==========
const applySearch = () => {
  searchKeyword.value = searchInput.value.trim()
}

const refresh = async () => {
  await fetchTransactions()
  refreshMessage.value = '🔄 รีเฟรชข้อมูลล่าสุดแล้ว'
  setTimeout(() => (refreshMessage.value = ''), 2000)
}

const resetFilter = () => {
  filter.type = ''
  filter.startDate = ''
  filter.endDate = ''
  searchInput.value = ''
  searchKeyword.value = ''
  fetchTransactions()
}

onMounted(fetchTransactions)
</script>

<template>
  <div class="card">
    <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
      <h1 class="text-2xl font-bold">📋 ประวัติธุรกรรม</h1>

      <BaseButton variant="secondary" :loading="loading" @click="refresh">
        🔄 รีเฟรชข้อมูล
      </BaseButton>
    </div>

    <p v-if="refreshMessage" class="bg-blue-100 text-blue-700 p-3 rounded mb-4 text-sm">
      {{ refreshMessage }}
    </p>

    <!-- แถวค้นหา -->
    <div class="flex flex-wrap gap-3 mb-4">
      <input
        v-model="searchInput"
        type="text"
        class="input flex-1 min-w-[220px]"
        placeholder="🔍 ค้นหาชื่อสินค้า, SKU, ผู้ทำรายการ, ชื่อผู้ซื้อ..."
        @keyup.enter="applySearch"
      />
      <BaseButton @click="applySearch">🔍 ค้นหา</BaseButton>
      <BaseButton
        v-if="searchKeyword"
        variant="secondary"
        @click="searchInput = ''; searchKeyword = ''"
      >
        ✕ ล้างคำค้น
      </BaseButton>
    </div>

    <p v-if="searchKeyword" class="text-sm text-gray-500 mb-4">
      ผลการค้นหาสำหรับ: <span class="font-semibold text-blue-600">"{{ searchKeyword }}"</span>
      พบ {{ filteredTransactions.length }} รายการ
    </p>

    <!-- ตัวกรอง -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
      <div>
        <label class="label">ประเภท</label>
        <select v-model="filter.type" class="input" @change="fetchTransactions">
          <option value="">ทั้งหมด</option>
          <option value="import">นำเข้า</option>
          <option value="import_request">ขอนำเข้า</option>
          <option value="sale">ขาย</option>
          <option value="restock_request">ขอ Restock</option>
          <option value="restock_approve">อนุมัติ Restock</option>
        </select>
      </div>
      <div>
        <label class="label">วันที่เริ่ม</label>
        <input v-model="filter.startDate" type="date" class="input" />
      </div>
      <div>
        <label class="label">วันที่สิ้นสุด</label>
        <input v-model="filter.endDate" type="date" class="input" />
      </div>
      <div class="flex items-end gap-2">
        <button class="btn-secondary w-full" @click="fetchTransactions">ใช้ตัวกรอง</button>
        <button class="btn-secondary w-full" @click="resetFilter">ล้างทั้งหมด</button>
      </div>
    </div>

    <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ errorMessage }}
    </p>

    <div v-if="loading" class="text-center text-gray-500 py-12">กำลังโหลด...</div>

    <!-- ========== ตาราง ========== -->
    <div v-else class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>วันที่/เวลา</th>
            <th>ประเภท</th>
            <th>สินค้า</th>
            <th>จำนวน</th>
            <th>จาก → ไป</th>
            <th>ผู้ซื้อ / หมายเหตุ</th>
            <th>ผู้ทำรายการ</th>
            <th>สถานะ</th>
            <th class="text-center">ดู</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="9" class="text-center text-gray-500 py-8">
              ไม่พบรายการธุรกรรม
            </td>
          </tr>

          <tr v-for="tx in filteredTransactions" :key="tx._id">
            <td class="text-xs">
              {{ new Date(tx.createdAt).toLocaleString('th-TH') }}
            </td>
            <td>
              <span :class="typeLabels[tx.type]?.class || 'badge-info'">
                {{ typeLabels[tx.type]?.text || tx.type }}
              </span>
            </td>
            <td class="font-medium">{{ tx.product?.name || '-' }}</td>
            <td class="font-bold">{{ tx.quantity }}</td>
            <td class="text-xs">{{ formatFrom(tx) }} → {{ formatTo(tx) }}</td>

            <!-- ✅ ย่อข้อความ + tooltip แทนการแสดงเต็ม -->
            <td>
              <div class="max-w-[180px] truncate text-xs" :title="tx.note || ''">
                {{ tx.note || '-' }}
              </div>
            </td>

            <td>{{ tx.performedBy?.name || '-' }}</td>
            <td>
              <span :class="statusLabels[tx.status]?.class || 'badge-info'">
                {{ statusLabels[tx.status]?.text || tx.status }}
              </span>
            </td>

            <!-- ✅ ปุ่มเปิดดูประวัติเต็ม -->
            <td class="text-center">
              <button
                class="btn-secondary !px-3 !py-1.5 !text-xs"
                @click="openDetail(tx)"
              >
                👁 ดู
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-sm text-gray-500 mt-4 text-right">
      แสดง {{ filteredTransactions.length }} จาก {{ transactions.length }} รายการ
    </p>

    <!-- ========== Modal รายละเอียดธุรกรรมฉบับเต็ม ========== -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            @click="showDetailModal = false"
          ></div>

          <div class="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold">📄 รายละเอียดธุรกรรม</h3>
              <button
                class="text-gray-400 hover:text-gray-600 text-xl"
                @click="showDetailModal = false"
              >
                ✕
              </button>
            </div>

            <div v-if="selectedTx" class="space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">วันที่/เวลา:</span>
                <span class="text-right">
                  {{ new Date(selectedTx.createdAt).toLocaleString('th-TH') }}
                </span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">ประเภท:</span>
                <span :class="typeLabels[selectedTx.type]?.class || 'badge-info'">
                  {{ typeLabels[selectedTx.type]?.text || selectedTx.type }}
                </span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">สินค้า:</span>
                <span class="text-right font-medium break-words">
                  {{ selectedTx.product?.name || '-' }}
                  <span class="font-mono text-xs text-gray-400">
                    ({{ selectedTx.product?.sku || '-' }})
                  </span>
                </span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">จำนวน:</span>
                <span class="font-bold">{{ selectedTx.quantity }}</span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">จาก → ไป:</span>
                <span>{{ formatFrom(selectedTx) }} → {{ formatTo(selectedTx) }}</span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">ผู้ทำรายการ:</span>
                <span class="text-right">
                  {{ selectedTx.performedBy?.name || '-' }}
                  <span class="text-xs text-gray-400">
                    ({{ selectedTx.performedBy?.role || '-' }})
                  </span>
                </span>
              </div>

              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">สถานะ:</span>
                <span :class="statusLabels[selectedTx.status]?.class || 'badge-info'">
                  {{ statusLabels[selectedTx.status]?.text || selectedTx.status }}
                </span>
              </div>

              <!-- หมายเหตุฉบับเต็ม -->
              <div class="pt-3 border-t">
                <p class="text-gray-500 mb-1">ผู้ซื้อ / หมายเหตุ (ฉบับเต็ม):</p>
                <p
                  class="bg-gray-50 border border-gray-100 rounded-lg p-3 break-all whitespace-pre-wrap max-h-40 overflow-y-auto"
                >
                  {{ selectedTx.note || '-' }}
                </p>
              </div>
            </div>

            <div class="flex justify-end mt-6">
              <BaseButton variant="secondary" @click="showDetailModal = false">
                ปิด
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>