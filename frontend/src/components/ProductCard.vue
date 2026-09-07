<script setup>
import { useCartStore } from '../stores/cart'

const props = defineProps({
  product: { type: Object, required: true }
})

defineEmits(['add-error'])

const cartStore = useCartStore()

const handleClick = () => {
  const result = cartStore.addToCart(props.product)
  if (!result.ok) {
    // ส่ง error กลับให้ view แสดงผล
    emitError(result.message)
  }
}

// helper เล็กๆ สำหรับ emit
import { getCurrentInstance } from 'vue'
const { emit } = getCurrentInstance()
const emitError = (msg) => emit('add-error', msg)
</script>

<template>
  <button
    type="button"
    @click="handleClick"
    :class="[
      'text-left border-2 rounded-lg p-4 transition relative',
      cartStore.inCart(product._id)
        ? 'border-green-500 bg-green-50'
        : 'border-gray-200 hover:border-green-300',
      cartStore.remainingStock(product._id) === 0 && !cartStore.inCart(product._id)
        ? 'opacity-50 cursor-not-allowed'
        : ''
    ]"
  >
    <!-- ป้ายจำนวนในตะกร้า -->
    <span
      v-if="cartStore.inCart(product._id)"
      class="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
    >
      {{ cartStore.cartQty(product._id) }}
    </span>

    <p class="font-semibold">{{ product.name }}</p>
    <p class="text-xs text-gray-500 font-mono">{{ product.sku }}</p>

    <div class="flex justify-between mt-2">
      <span class="text-green-600 font-bold">
        ฿{{ product.sellingPrice?.toLocaleString() }}
      </span>
      <span
        class="text-xs"
        :class="cartStore.remainingStock(product._id) === 0 ? 'text-red-500' : 'text-gray-500'"
      >
        คงเหลือ: {{ cartStore.remainingStock(product._id) }}
      </span>
    </div>
  </button>
</template>