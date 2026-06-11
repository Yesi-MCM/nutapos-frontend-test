<template>
  <div class="dialog-overlay" @click.self="$emit('cancel')">
    <div class="dialog" style="max-width: 440px;">
      <div class="dialog-header">
        <h2 class="dialog-title">Hapus Diskon</h2>
      </div>
      <div class="dialog-body">
        <p class="text-body-large" style="color: var(--md-sys-color-on-surface-variant);">
          {{ isBulk
            ? 'Apakah Anda yakin ingin menghapus diskon yang dipilih?'
            : `Apakah Anda yakin ingin menghapus diskon ${discountName}?`
          }}
        </p>
        <ul style="padding-left: 20px; color: var(--md-sys-color-on-surface-variant);">
          <li class="text-body-medium">Diskon yang dihapus tidak bisa dikembalikan lagi.</li>
        </ul>
      </div>
      <div class="dialog-actions-right" style="gap: 12px;">
        <button class="btn btn-outlined" id="delete-cancel-btn" @click="$emit('cancel')">Batalkan</button>
        <button class="btn btn-error" id="delete-confirm-btn" @click="$emit('confirm')" :disabled="loading">
          <span v-if="loading" class="material-symbols-rounded spin" style="font-size:16px">progress_activity</span>
          Hapus
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  discountName: { type: String, default: '' },
  isBulk: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.dialog-actions-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 24px;
  gap: 12px;
}
.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
