<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productService } from '../../services/productService'
import { productCategories } from '../../data/categories'
import BaseButton from '../../components/BaseButton.vue'

const route = useRoute()
const router = useRouter()

const productId = route.params.id
const isEdit = computed(() => !!productId)

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const currentSku = ref('')

const existingProducts = ref([])

const form = reactive({
  name: '',
  description: '',
  category: '',
  unit: 'ชิ้น',
  costPrice: 0,
  sellingPrice: 0,
  image: ''
})

// ========== ⚠️ คำเตือนชื่อซ้ำ (แนะนำเท่านั้น ไม่บล็อกการบันทึก) ==========
const duplicateByName = computed(() => {
  const list = Array.isArray(existingProducts.value) ? existingProducts.value : []
  const name = String(form.name || '').trim().toLowerCase()
  if (!name) return null
  return (
    list.find(
      p => p && p._id !== productId && String(p.name || '').trim().toLowerCase() === name
    ) || null
  )
})

const isCategoryInList = computed(() =>
  productCategories.some(g => g.items.includes(form.category))
)

// ========== โหลดข้อมูล ==========
const fetchExistingProducts = async () => {
  try {
    const data = await productService.getAll()
    existingProducts.value = Array.isArray(data) ? data : []
  } catch (e) {
    existingProducts.value = []
  }
}

const fetchProduct = async () => {
  if (!isEdit.value) return
  try {
    loading.value = true
    const product = await productService.getById(productId)
    currentSku.value = product.sku
    Object.assign(form, {
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      image: product.image
    })
  } catch (error) {
    errorMessage.value = error.message || 'โหลดข้อมูลสินค้าไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

// ========== บันทึก (ให้ Backend เป็นผู้ตัดสินเรื่องซ้ำ) ==========
const submitForm = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    if (!form.name || !String(form.name).trim()) {
      errorMessage.value = 'กรุณากรอกชื่อสินค้า'
      return
    }

    if (!form.category) {
      errorMessage.value = 'กรุณาเลือกหมวดหมู่สินค้า'
      return
    }

    if (form.sellingPrice < form.costPrice) {
      errorMessage.value = 'ราคาขายไม่ควรต่ำกว่าราคาทุน'
      return
    }

    if (isEdit.value) {
      await productService.update(productId, form)
      successMessage.value = '✅ แก้ไขสินค้าสำเร็จ'
    } else {
      const created = await productService.create(form)
      successMessage.value = `✅ เพิ่มสินค้าสำเร็จ (รหัส: ${created.product?.sku || '-'})`
    }

    setTimeout(() => router.push('/products'), 900)
  } catch (error) {
    // ✅ ถ้าชื่อซ้ำจริง Backend จะส่ง 400 +ข้อความภาษาไทย มาแสดงที่นี่
    errorMessage.value = error.message || 'บันทึกข้อมูลไม่สำเร็จ'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchExistingProducts()
  await fetchProduct()
})
</script>

<template>
  <div class="card max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">
      {{ isEdit ? '✏️ แก้ไขสินค้า' : '➕ เพิ่มสินค้าใหม่' }}
    </h1>

    <!-- กล่องแจ้งรหัสสินค้า -->
    <div class="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded mb-4 text-sm">
      <span v-if="isEdit">
        🔖 รหัสสินค้า: <span class="font-mono font-bold">{{ currentSku }}</span>
        (ระบบสร้างให้ แก้ไขไม่ได้)
      </span>
      <span v-else>
        💡 รหัสสินค้าจะถูกสร้างอัตโนมัติเมื่อบันทึก (เช่น P031, P032, ...)
      </span>
    </div>

    <!-- ⚠️ คำเตือนแนะนำ (ไม่บล็อกปุ่มบันทึก) -->
    <div
      v-if="duplicateByName"
      class="bg-yellow-100 border border-yellow-300 text-yellow-800 p-3 rounded mb-4 text-sm"
    >
      ⚠️ ระบบพบชื่อ "{{ form.name }}" คล้ายกับสินค้าเดิม
      (รหัส: {{ duplicateByName.sku }}) — กดบันทึกเพื่อตรวจสอบอีกครั้ง
    </div>

    <p v-if="errorMessage" class="bg-red-100 text-red-700 p-3 rounded mb-4">
      {{ errorMessage }}
    </p>

    <p v-if="successMessage" class="bg-green-100 text-green-700 p-3 rounded mb-4">
      {{ successMessage }}
    </p>

    <form @submit.prevent="submitForm">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="label">ชื่อสินค้า <span class="text-red-500">*</span></label>
          <input
            v-model="form.name"
            class="input"
            placeholder="เช่น นมถั่วเหลือง"
            required
          />
          <p v-if="duplicateByName" class="mt-1 text-xs text-yellow-600">
            มีสินค้าชื่อใกล้เคียงอยู่แล้ว (รหัส: {{ duplicateByName.sku }})
          </p>
        </div>

        <div>
          <label class="label">หมวดหมู่ <span class="text-red-500">*</span></label>
          <select v-model="form.category" class="input" required>
            <option value="" disabled>— เลือกหมวดหมู่ —</option>
            <optgroup
              v-for="group in productCategories"
              :key="group.group"
              :label="group.group"
            >
              <option v-for="cat in group.items" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </optgroup>
            <option v-if="form.category && !isCategoryInList" :value="form.category">
              {{ form.category }} (หมวดหมู่เดิม)
            </option>
          </select>
        </div>

        <div>
          <label class="label">หน่วยนับ <span class="text-red-500">*</span></label>
          <select v-model="form.unit" class="input">
            <option value="ชิ้น">ชิ้น</option>
            <option value="กล่อง">กล่อง</option>
            <option value="ถุง">ถุง</option>
            <option value="ขวด">ขวด</option>
            <option value="กระป๋อง">กระป๋อง</option>
            <option value="แพ็ค">แพ็ค</option>
            <option value="ม้วน">ม้วน</option>
            <option value="กก.">กก.</option>
          </select>
        </div>

        <div>
          <label class="label">ราคาทุน (บาท) <span class="text-red-500">*</span></label>
          <input v-model.number="form.costPrice" type="number" min="0" class="input" required />
        </div>

        <div>
          <label class="label">ราคาขาย (บาท) <span class="text-red-500">*</span></label>
          <input v-model.number="form.sellingPrice" type="number" min="0" class="input" required />
        </div>
      </div>

      <div class="mt-4">
        <label class="label">รายละเอียด</label>
        <textarea v-model="form.description" class="input" rows="4" placeholder="รายละเอียดสินค้า..."></textarea>
      </div>

      <div class="mt-4 mb-6">
        <label class="label">URL รูปภาพ</label>
        <input v-model="form.image" class="input" placeholder="https://..." />
        <img
          v-if="form.image"
          :src="form.image"
          class="mt-3 w-40 h-40 object-cover rounded-lg border"
          @error="form.image = ''"
        />
      </div>

      <div class="flex gap-3">
        <!-- ✅ ปุ่มไม่ถูก disable อีกต่อไป -->
        <BaseButton type="submit" :loading="loading">
          {{ loading ? 'กำลังบันทึก...' : '💾 บันทึก' }}
        </BaseButton>
        <RouterLink to="/products" class="btn-secondary">ยกเลิก</RouterLink>
      </div>
    </form>
  </div>
</template>