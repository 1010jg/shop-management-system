<script setup>
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'

const props = defineProps({
  item: { type: Object, required: true }
})

const cartStore = useCartStore()

const itemTotal = computed(() =>
  (props.item.product.sellingPrice || 0) * props.item.quantity
)
</script>

<template>
  <div class="border border-gray-200 rounded-lg p-3">
    <div class="flex justify-between items-start mb-2">
      <div>
        <p class="font-semibold text-sm">{{ item.product.name }}</p>
        <p class="text-xs text-gray-500">
          ฿{{ item.product.sellingPrice?.toLocaleString() }} / {{ item.product.unit }}
        </p>
      </div>
      <button
        type="button"
        class="text-red-500 hover:text-red-700 text-sm"
        title="ลบออกจากตะกร้า"
        @click="cartStore.removeItem(item.product._id)"
      >
        ✕
      </button>
    </div>

    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn-secondary !px-2.5 !py-1 !text-sm"
          @click="cartStore.changeQty(item.product._id, -1)"
        >
          −
        </button>

        <input
          :value="item.quantity"
          type="number"
          min="1"
          :max="cartStore.getStock(item.product._id)"
          class="input !w-16 !px-2 !py-1 text-center"
          @change="cartStore.setQty(item.product._id, $event.target.value)"
        />

        <button
          type="button"
          class="btn-secondary !px-2.5 !py-1 !text-sm"
          @click="cartStore.changeQty(item.product._id, 1)"
        >
          +
        </button>
      </div>

      <span class="font-bold text-green-600 text-sm">
        ฿{{ itemTotal.toLocaleString() }}
      </span>
    </div>
  </div>
</template>