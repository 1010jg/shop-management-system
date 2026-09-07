<script setup>
defineProps({
  show: Boolean,
  title: { type: String, default: 'ยืนยันการดำเนินการ' },
  message: { type: String, default: 'คุณแน่ใจหรือไม่?' },
  confirmText: { type: String, default: 'ยืนยัน' },
  cancelText: { type: String, default: 'ยกเลิก' },
  danger: { type: Boolean, default: true }
})

defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('cancel')"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100">
          <div class="text-center">
            <div 
              :class="[
                'mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4',
                danger ? 'bg-red-100' : 'bg-blue-100'
              ]"
            >
              <span :class="danger ? 'text-red-600' : 'text-blue-600'" class="text-2xl">⚠️</span>
            </div>
            
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
            <p class="text-sm text-gray-500 mb-6">{{ message }}</p>
            
            <div class="flex gap-3 justify-center">
              <button class="btn-secondary flex-1" @click="$emit('cancel')">
                {{ cancelText }}
              </button>
              <button 
                :class="danger ? 'btn-danger' : 'btn-primary'" 
                class="flex-1"
                @click="$emit('confirm')"
              >
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>