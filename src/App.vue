<template>
  <div class="page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Daftar Diskon</h1>
        <p class="page-subtitle">
          Total jumlah diskon: <strong>{{ diskons.length }}</strong>
        </p>
      </div>
      <button
        class="btn btn-filled"
        id="tambah-diskon-btn"
        @click="openCreate"
      >
        <span class="material-symbols-rounded">add</span>
        Tambah diskon
      </button>
    </div>

    <!-- Table -->
    <DiskonTable
      :diskons="diskons"
      :loading="loading"
      :apiUrl="apiUrl"
      @edit="openEdit"
      @bulk-delete="handleBulkDelete"
      @api-url-change="handleApiUrlChange"
    />

    <!-- Create / Edit Dialog -->
    <Transition name="dialog-fade">
      <DiskonDialog
        v-if="showDialog"
        :edit-data="editingItem"
        :is-edit="!!editingItem"
        :loading="loading"
        :existing-names="existingNames"
        @save="handleSave"
        @delete="openDeleteFromEdit"
        @close="closeDialog"
      />
    </Transition>

    <!-- Delete Confirmation Dialog -->
    <Transition name="dialog-fade">
      <DeleteDialog
        v-if="showDeleteDialog"
        :discount-name="deletingItem ? deletingItem.namaDiskon : ''"
        :is-bulk="isBulkDelete"
        :loading="loading"
        @confirm="confirmDelete"
        @cancel="closeDeleteDialog"
      />
    </Transition>

    <!-- Snackbar -->
    <SnackBar
      :message="snackMessage"
      :type="snackType"
      @hide="snackMessage = ''"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DiskonTable from './components/DiskonTable.vue'
import DiskonDialog from './components/DiskonDialog.vue'
import DeleteDialog from './components/DeleteDialog.vue'
import SnackBar from './components/SnackBar.vue'
import { useDiskon } from './composables/useDiskon'

const {
  apiUrl,
  diskons,
  loading,
  saveApiUrl,
  fetchDiskons,
  createDiskon,
  updateDiskon,
  deleteDiskon,
  deleteMultipleDiskons,
} = useDiskon()

// Dialog state
const showDialog = ref(false)
const editingItem = ref(null)

// Delete state
const showDeleteDialog = ref(false)
const deletingItem = ref(null)
const isBulkDelete = ref(false)
const pendingBulkIds = ref([])

// Snackbar
const snackMessage = ref('')
const snackType = ref('success')

const showSnack = (msg, type = 'success') => {
  snackMessage.value = msg
  snackType.value = type
}

// Existing names for duplicate validation
const existingNames = computed(() => diskons.value.map(d => d.namaDiskon))

// Initialize
onMounted(async () => {
  if (apiUrl.value) {
    await fetchDiskons()
  }
})

// API URL
const handleApiUrlChange = async (url) => {
  saveApiUrl(url)
  if (url) {
    await fetchDiskons()
  }
}

// Open Create
const openCreate = () => {
  editingItem.value = null
  showDialog.value = true
}

// Open Edit
const openEdit = (item) => {
  editingItem.value = { ...item }
  showDialog.value = true
}

// Close Dialog
const closeDialog = () => {
  showDialog.value = false
  editingItem.value = null
}

// Save (Create or Update)
const handleSave = async (formData) => {
  if (editingItem.value) {
    // Update
    const result = await updateDiskon(editingItem.value._id, formData)
    if (result.success) {
      showSnack(`Diskon "${formData.namaDiskon}" berhasil diubah.`)
      closeDialog()
    } else {
      showSnack('Gagal mengubah diskon. Coba lagi.', 'error')
    }
  } else {
    // Create
    const result = await createDiskon(formData)
    if (result.success) {
      showSnack(`Diskon "${formData.namaDiskon}" berhasil ditambahkan.`)
      closeDialog()
    } else {
      showSnack('Gagal menambahkan diskon. Coba lagi.', 'error')
    }
  }
}

// Delete from edit dialog (triggers delete confirmation)
const openDeleteFromEdit = (item) => {
  deletingItem.value = item
  isBulkDelete.value = false
  showDialog.value = false
  showDeleteDialog.value = true
}

// Bulk delete
const handleBulkDelete = (ids) => {
  pendingBulkIds.value = ids
  isBulkDelete.value = true
  deletingItem.value = null
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  deletingItem.value = null
  pendingBulkIds.value = []
  isBulkDelete.value = false
}

const confirmDelete = async () => {
  if (isBulkDelete.value) {
    const result = await deleteMultipleDiskons(pendingBulkIds.value)
    if (result.success) {
      showSnack(`${pendingBulkIds.value.length} diskon berhasil dihapus.`)
    } else {
      showSnack('Gagal menghapus diskon.', 'error')
    }
  } else {
    const result = await deleteDiskon(deletingItem.value._id)
    if (result.success) {
      showSnack(`Diskon "${deletingItem.value.namaDiskon}" berhasil dihapus.`)
    } else {
      showSnack('Gagal menghapus diskon.', 'error')
    }
  }
  closeDeleteDialog()
}
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-title {
  font-size: 28px;
  font-weight: 400;
  color: var(--md-sys-color-on-surface);
  line-height: 1.2;
}

.page-subtitle {
  font-size: 14px;
  color: var(--md-sys-color-on-surface-variant);
}

/* Dialog transition */
.dialog-fade-enter-active, .dialog-fade-leave-active {
  transition: opacity 0.15s ease;
}
.dialog-fade-enter-from, .dialog-fade-leave-to {
  opacity: 0;
}
</style>
