<template>
  <div class="dialog-overlay" @click.self="handleClose">
    <div class="dialog">
      <!-- Header -->
      <div class="dialog-header">
        <h2 class="dialog-title">{{ isEdit ? 'Ubah Diskon' : 'Tambah Diskon' }}</h2>
        <button class="dialog-close" @click="handleClose" id="diskon-dialog-close">
          <span class="material-symbols-rounded">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="dialog-body">
        <!-- Nama Diskon Field -->
        <div class="text-field" :class="{ error: errors.namaDiskon }">
          <label>{{ isEdit ? form.namaDiskon || 'Nama Diskon' : 'Nama Diskon' }}</label>
          <input
            id="input-nama-diskon"
            type="text"
            v-model="form.namaDiskon"
            placeholder="Misal: Diskon opening, diskon akhir tahun"
            @input="validateNama"
            @blur="validateNama"
            :style="errors.namaDiskon ? 'padding-right: 40px;' : ''"
          />
          <span v-if="errors.namaDiskon" class="material-symbols-rounded field-icon-right" style="color: var(--md-sys-color-error)">info</span>
          <p v-if="errors.namaDiskon" class="field-error">{{ errors.namaDiskon }}</p>
        </div>

        <!-- Diskon Field + Type Toggle -->
        <div>
          <div class="diskon-row">
            <!-- Input -->
            <div class="text-field diskon-input" :class="{ error: errors.nilaiDiskon }">
              <label>Diskon</label>
              <div class="diskon-input-wrap">
                <span v-if="form.jenisDiskon === 'nominal'" class="diskon-prefix">Rp</span>
                <input
                  id="input-nilai-diskon"
                  type="number"
                  v-model.number="form.nilaiDiskon"
                  :placeholder="form.jenisDiskon === 'persentase' ? '0' : '0'"
                  min="0"
                  :max="form.jenisDiskon === 'persentase' ? 100 : undefined"
                  @input="validateNilai"
                  @blur="validateNilai"
                />
                <span v-if="form.jenisDiskon === 'persentase'" class="diskon-suffix">%</span>
              </div>
            </div>

            <!-- Type Toggle Buttons -->
            <div class="type-toggle" role="group" aria-label="Jenis Diskon">
              <button
                id="btn-type-persentase"
                class="type-btn"
                :class="{ active: form.jenisDiskon === 'persentase' }"
                @click="selectType('persentase')"
                type="button"
              >
                <span v-if="form.jenisDiskon === 'persentase'" class="material-symbols-rounded" style="font-size:16px;color:var(--md-sys-color-primary)">check</span>
                <span class="type-label" :style="form.jenisDiskon === 'persentase' ? 'color:var(--md-sys-color-primary)' : ''">%</span>
              </button>
              <button
                id="btn-type-nominal"
                class="type-btn"
                :class="{ active: form.jenisDiskon === 'nominal' }"
                @click="selectType('nominal')"
                type="button"
              >
                <span v-if="form.jenisDiskon === 'nominal'" class="material-symbols-rounded" style="font-size:16px;color:var(--md-sys-color-primary)">check</span>
                <span class="type-label" :style="form.jenisDiskon === 'nominal' ? 'color:var(--md-sys-color-primary)' : ''">Rp</span>
              </button>
            </div>
          </div>
          <p v-if="errors.nilaiDiskon" class="field-error" style="margin-top:4px">{{ errors.nilaiDiskon }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div v-if="isEdit" class="dialog-actions">
        <button class="btn btn-text" id="diskon-dialog-hapus" @click="$emit('delete', editData)" type="button">
          Hapus
        </button>
        <button
          class="btn btn-filled"
          id="diskon-dialog-simpan"
          @click="handleSubmit"
          :disabled="loading"
          type="button"
        >
          <span v-if="loading" class="material-symbols-rounded spin" style="font-size:16px">progress_activity</span>
          Simpan
        </button>
      </div>
      <div v-else class="dialog-actions-right" style="margin-top:24px">
        <button
          class="btn btn-filled btn-filled-wide"
          id="diskon-dialog-simpan"
          @click="handleSubmit"
          :disabled="loading"
          type="button"
        >
          <span v-if="loading" class="material-symbols-rounded spin" style="font-size:16px">progress_activity</span>
          Simpan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  editData: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  existingNames: { type: Array, default: () => [] },
})

const emit = defineEmits(['save', 'delete', 'close'])

const form = reactive({
  namaDiskon: '',
  jenisDiskon: 'persentase',
  nilaiDiskon: 0,
})

const errors = reactive({
  namaDiskon: '',
  nilaiDiskon: '',
})

// Initialize form if editing
watch(() => props.editData, (data) => {
  if (data) {
    form.namaDiskon = data.namaDiskon || ''
    form.jenisDiskon = data.jenisDiskon || 'persentase'
    form.nilaiDiskon = data.nilaiDiskon || 0
  }
}, { immediate: true })

const selectType = (type) => {
  form.jenisDiskon = type
  form.nilaiDiskon = 0
  errors.nilaiDiskon = ''
}

const validateNama = () => {
  const name = form.namaDiskon.trim()
  if (!name) {
    errors.namaDiskon = 'Nama diskon tidak boleh kosong.'
    return false
  }
  // Check duplicate (exclude self if editing)
  const lowerName = name.toLowerCase()
  const isDuplicate = props.existingNames.some(n => {
    if (props.isEdit && props.editData && n.toLowerCase() === props.editData.namaDiskon.toLowerCase()) return false
    return n.toLowerCase() === lowerName
  })
  if (isDuplicate) {
    errors.namaDiskon = 'Nama diskon sudah digunakan, silahkan gunakan nama lain.'
    return false
  }
  errors.namaDiskon = ''
  return true
}

const validateNilai = () => {
  if (!form.nilaiDiskon && form.nilaiDiskon !== 0) {
    errors.nilaiDiskon = 'Diskon tidak boleh kosong.'
    return false
  }
  if (form.nilaiDiskon <= 0) {
    errors.nilaiDiskon = 'Diskon tidak boleh kosong.'
    return false
  }
  if (form.jenisDiskon === 'persentase' && form.nilaiDiskon > 100) {
    errors.nilaiDiskon = 'Nilai persentase tidak boleh lebih dari 100.'
    return false
  }
  errors.nilaiDiskon = ''
  return true
}

const handleSubmit = () => {
  const validNama = validateNama()
  const validNilai = validateNilai()
  if (!validNama || !validNilai) return

  emit('save', {
    namaDiskon: form.namaDiskon.trim(),
    jenisDiskon: form.jenisDiskon,
    nilaiDiskon: form.nilaiDiskon,
  })
}

const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
.diskon-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.diskon-input {
  flex: 1;
}

.diskon-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.diskon-input-wrap input {
  padding-left: 16px;
  padding-right: 36px;
}

.diskon-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
  z-index: 1;
}

.diskon-prefix ~ input {
  padding-left: 36px !important;
}

.diskon-suffix {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
  pointer-events: none;
}

.type-toggle {
  display: flex;
  border-radius: var(--md-sys-shape-corner-full);
  overflow: hidden;
  border: 1.5px solid var(--md-sys-color-outline-variant);
  height: 52px;
  align-items: center;
  background: white;
  flex-shrink: 0;
}

.type-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface-variant);
  transition: all 0.15s ease;
  height: 100%;
  min-width: 56px;
}

.type-btn.active {
  background: var(--md-sys-color-primary-lighter);
}

.type-btn:first-child {
  border-right: 1.5px solid var(--md-sys-color-outline-variant);
}

.type-label {
  font-weight: 600;
  font-size: 14px;
}

.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.dialog-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
}
</style>
