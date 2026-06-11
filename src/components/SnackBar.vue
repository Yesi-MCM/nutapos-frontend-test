<template>
  <Transition name="snack">
    <div v-if="visible" class="snackbar" :class="type">
      <span class="material-symbols-rounded" style="font-size:20px">
        {{ type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info' }}
      </span>
      {{ message }}
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'success' }, // 'success' | 'error' | 'info'
  duration: { type: Number, default: 3000 },
})

const emit = defineEmits(['hide'])
const visible = ref(false)
let timer = null

watch(() => props.message, (val) => {
  if (val) {
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => {
      visible.value = false
      emit('hide')
    }, props.duration)
  }
})
</script>

<style scoped>
.snack-enter-active, .snack-leave-active {
  transition: all 0.25s ease;
}
.snack-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
.snack-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}
</style>
