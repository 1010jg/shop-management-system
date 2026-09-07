<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '../../services/productService'
import { useAuthStore } from '../../stores/auth'
import BaseButton from '../../components/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const product = ref(null)
const loading = ref(true)
const errorMessage = ref('')

const canManage = computed(() => authStore.isAdmin || authStore.isWarehouse)

const fetchProduct = async () => {
  try {
    loading.value = true
    product.value = await productService.getById(route.params.id)
  } catch (error) {
    errorMessage.value = error.message || 'โหลดข้อมูลสินค้าไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)
</script>

<template>
  <div class="card max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">🔍 รายละเอียดสินค้า</h1>

    <p v-if="loading" class="text-center text-gray-500 py-8">กำลังโหลด...</p>

    <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded">
      {{ errorMessage }}
    </p>

    <!-- ✅ เพิ่ม min-w-0 ให้ grid เพื่อกันคอลัมน์บานตามเนื้อหายาว -->
    <div v-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
      <!-- รูปภาพ -->
      <div class="min-w-0">
        <img
          v-if="product.image"
          :src="product.image"
          class="w-full h-64 object-cover rounded-xl border"
        />
        <div
          v-else
          class="w-full h-64 bg-gray-100 rounded-xl flex items-center justify-center text-6xl"
        >
          📦
        </div>
      </div>

      <!-- ข้อมูล -->
      <div class="min-w-0 space-y-3">
        <p class="break-words">
          <span class="font-semibold text-gray-500">SKU:</span>
          <span class="font-mono ml-2">{{ product.sku }}</span>
        </p>

        <p class="break-words">
          <span class="font-semibold text-gray-500">ชื่อสินค้า:</span>
          <span class="ml-2 font-bold">{{ product.name }}</span>
        </p>

        <p class="break-words">
          <span class="font-semibold text-gray-500">หมวดหมู่:</span>
          <span class="badge-info ml-2">{{ product.category }}</span>
        </p>

        <p class="break-words">
          <span class="font-semibold text-gray-500">หน่วยนับ:</span>
          <span class="ml-2">{{ product.unit }}</span>
        </p>

        <p class="break-words">
          <span class="font-semibold text-gray-500">ราคาทุน:</span>
          <span class="ml-2">฿{{ product.costPrice?.toLocaleString() }}</span>
        </p>

        <p class="break-words">
          <span class="font-semibold text-gray-500">ราคาขาย:</span>
          <span class="ml-2 text-green-600 font-bold">฿{{ product.sellingPrice?.toLocaleString() }}</span>
        </p>

        <p class="break-words">
          <span class="font-semibold text-gray-500">สถานะ:</span>
          <span :class="product.isActive ? 'badge-success' : 'badge-danger'" class="ml-2">
            {{ product.isActive ? 'ใช้งาน' : 'ปิดใช้งาน' }}
          </span>
        </p>

        <!-- ✅ กล่องรายละเอียด: บังคับตัดคำ + จำกัดความสูง + scroll -->
        <div class="pt-2 min-w-0">
          <p class="font-semibold text-gray-500 mb-1">รายละเอียด:</p>
          <p
            class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 break-all whitespace-pre-wrap max-h-48 overflow-y-auto"
          >
            {{ product.description || '-' }}
          </p>
        </div>
      </div>
    </div>

    <div v-if="product" class="flex gap-3 mt-6 pt-4 border-t">
      <BaseButton variant="secondary" @click="router.push('/products')">
        ← กลับ
      </BaseButton>

      <RouterLink
        v-if="canManage"
        :to="`/products/${product._id}/edit`"
        class="btn-primary"
      >
        ✏️ แก้ไข
      </RouterLink>
    </div>
  </div>
</template>