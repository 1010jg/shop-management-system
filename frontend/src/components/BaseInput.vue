<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  error: String,
  required: Boolean,
  disabled: Boolean
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mb-4">
    <label v-if="label" class="label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <input
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['input', error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '']"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>