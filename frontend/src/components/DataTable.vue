<script setup>
defineProps({
  headers: Array, // [{ key: 'name', label: 'ชื่อสินค้า' }]
  items: Array,
  loading: Boolean,
  emptyMessage: { type: String, default: 'ไม่มีข้อมูล' }
})
</script>

<template>
  <div class="table-container">
    <div v-if="loading" class="p-12 text-center text-gray-500">
      <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-3"></div>
      <p>กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="!items || items.length === 0" class="p-12 text-center text-gray-500">
      <span class="text-4xl block mb-3">📭</span>
      <p>{{ emptyMessage }}</p>
    </div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th v-for="header in headers" :key="header.key">
            {{ header.label }}
          </th>
          <th v-if="$slots.actions" class="text-right">จัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="item._id || index">
          <td v-for="header in headers" :key="header.key">
            <slot :name="`cell-${header.key}`" :item="item" :value="item[header.key]">
              {{ item[header.key] ?? '-' }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="text-right">
            <slot name="actions" :item="item" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>