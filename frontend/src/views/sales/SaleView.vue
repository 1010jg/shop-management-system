<script setup>
import { ref, computed, onMounted } from 'vue'
import { productService } from '../../services/productService'
import { inventoryService } from '../../services/inventoryService'
import { transactionService } from '../../services/transactionService'
import { useCartStore } from '../../stores/cart'
import ProductCard from '../../components/ProductCard.vue'
import CartItem from '../../components/CartItem.vue'
import BaseButton from '../../components/BaseButton.vue'

const cartStore = useCartStore()

const products = ref([])
const search = ref('')
const loading = ref(false)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const note = ref('')

const filteredProducts = computed(() => {
  if (!search.value) return products.value
  const kw = search.value.toLowerCase()
  return products.value.filter(p =>
    p.name?.toLowerCase().includes(kw) ||
    p.sku?.toLowerCase().includes(kw)
  )
})

const fetchData = async () => {
  try {
    loading.value = true
    products.value = await productService.getAll()
    const stocks = await inventoryService.getByLocation('shop')
    cartStore.setStocks(stocks)
  } catch (error) {
    errorMessage.value = 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

const onAddError = (msg) => {
  errorMessage.value = msg
}

const submitSale = async () => {
  if (cartStore.lineCount === 0) {
    errorMessage.value = 'ยังไม่มีสินค้าในตะกร้า'
    return
  }

  try {
    submitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    const lines = [...cartStore.items] // ก๊อปปี้ก่อน clear
    const totalSold = cartStore.cartTotal
    const failed = []

    for (const item of lines) {
      try {
        await transactionService.recordSale({
          productId: item.product._id,
          quantity: item.quantity,
          note: note.value || undefined
        })
      } catch (err) {
        failed.push(`${item.product.name} (${err.message || 'ผิดพลาด'})`)
      }
    }

    if (failed.length > 0) {
      errorMessage.value = 'ขายไม่สำเร็จบางรายการ: ' + failed.join(', ')
    } else {
      successMessage.value = `✅ บันทึกการขาย ${lines.length} รายการ (${cartStore.cartCount} ชิ้น) รวม ฿${totalSold.toLocaleString()} สำเร็จ`
      cartStore.clearCart()
      note.value = ''
    }

    await fetchData()
  } catch (error) {
    errorMessage.value = error.message || 'บันทึกการขายไม่สำเร็จ'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchData)
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- รายการสินค้า -->
    <div class="card lg:col-span-2">
      <h1 class="text-xl font-bold mb-4">💰 เลือกสินค้า (คลิกเพื่อเพิ่มลงตะกร้า)</h1>

      <input
        v-model="search"
        class="input mb-4"
        placeholder="🔍 ค้นหาชื่อสินค้า หรือ SKU..."
      />

      <div v-if="loading" class="text-center text-gray-500 py-12">
        กำลังโหลดข้อมูล...
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product._id"
          :product="product"
          @add-error="onAddError"
        />
      </div>
    </div>

    <!-- ตะกร้าการขาย -->
    <div class="card h-fit">
      <h2 class="text-lg font-bold mb-4">
        🛒 ตะกร้าการขาย
        <span v-if="cartStore.lineCount > 0" class="badge-success ml-1">
          {{ cartStore.lineCount }} รายการ
        </span>
      </h2>

      <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
        {{ errorMessage }}
      </p>

      <p v-if="successMessage" class="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
        {{ successMessage }}
      </p>

      <div v-if="cartStore.lineCount === 0" class="text-center text-gray-400 py-8">
        🛒 ยังไม่มีสินค้าในตะกร้า<br />
        <span class="text-xs">คลิกสินค้าทางซ้ายเพื่อเพิ่ม</span>
      </div>

      <div v-else class="space-y-3 mb-4 max-h-[320px] overflow-y-auto">
        <CartItem
          v-for="item in cartStore.items"
          :key="item.product._id"
          :item="item"
        />
      </div>

      <div v-if="cartStore.lineCount > 0" class="mb-4">
        <label class="label">หมายเหตุ</label>
        <input v-model="note" class="input" placeholder="เช่น ลูกค้าประจำ" />
      </div>

      <div class="bg-gray-50 rounded-lg p-4 text-center mb-4">
        <p class="text-sm text-gray-500">รวม {{ cartStore.cartCount }} ชิ้น</p>
        <p class="text-3xl font-bold text-green-600 break-all">
          ฿{{ cartStore.cartTotal.toLocaleString() }}
        </p>
      </div>

      <div class="flex gap-2">
        <BaseButton
          variant="secondary"
          class="flex-1"
          :disabled="cartStore.lineCount === 0 || submitting"
          @click="cartStore.clearCart(); note = ''"
        >
          ล้างตะกร้า
        </BaseButton>
        <BaseButton
          variant="success"
          class="flex-1"
          :loading="submitting"
          :disabled="cartStore.lineCount === 0"
          @click="submitSale"
        >
          💵 ยืนยันการขาย
        </BaseButton>
      </div>
    </div>
  </div>
</template>