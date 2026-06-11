<template>
  <div class="table-container">
    <!-- Table Toolbar -->
    <div class="table-toolbar">
      <!-- Search -->
      <div class="search-field">
        <span class="material-symbols-rounded search-icon">search</span>
        <input
          id="search-diskon-input"
          type="text"
          v-model="searchQuery"
          placeholder="Cari diskon"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''" title="Hapus pencarian">
          <span class="material-symbols-rounded" style="font-size:18px">close</span>
        </button>
      </div>

      <!-- API URL Field (replaces outlet dropdown) -->
      <div class="api-url-field">
        <span class="material-symbols-rounded api-icon">link</span>
        <input
          id="api-url-input"
          type="text"
          v-model="localApiUrl"
          placeholder="https://crudcrud.com/api/your-unique-id"
          @keyup.enter="applyApiUrl"
          @blur="applyApiUrl"
        />
        <button v-if="localApiUrl" class="api-apply-btn" @click="applyApiUrl" title="Terapkan URL">
          <span class="material-symbols-rounded" style="font-size:18px">check</span>
        </button>
      </div>
    </div>

    <!-- Bulk Delete Bar -->
    <Transition name="slide-bar">
      <div v-if="selectedIds.length > 0" class="bulk-bar">
        <span class="text-label-large">{{ selectedIds.length }} diskon dipilih</span>
        <button class="btn btn-error" id="bulk-delete-btn" @click="$emit('bulk-delete', selectedIds)">
          <span class="material-symbols-rounded" style="font-size:16px">delete</span>
          Hapus
        </button>
      </div>
    </Transition>

    <!-- Table -->
    <div class="table-wrapper">
      <table class="diskon-table">
        <thead>
          <tr>
            <th class="col-check">
              <input
                type="checkbox"
                class="md-checkbox"
                id="select-all-checkbox"
                :checked="isAllSelected"
                :indeterminate="isIndeterminate"
                @change="toggleSelectAll"
              />
            </th>
            <th class="col-nama">
              <button class="sort-btn" @click="toggleSort('namaDiskon')" id="sort-nama-btn">
                Nama Diskon
                <span class="material-symbols-rounded sort-icon" :class="{ active: sortKey === 'namaDiskon' }">
                  {{ sortKey === 'namaDiskon' && sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward' }}
                </span>
              </button>
            </th>
            <th class="col-nilai">
              <button class="sort-btn" @click="toggleSort('nilaiDiskon')" id="sort-nilai-btn">
                Nilai Diskon
                <span class="material-symbols-rounded sort-icon" :class="{ active: sortKey === 'nilaiDiskon' }">
                  {{ sortKey === 'nilaiDiskon' && sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward' }}
                </span>
              </button>
            </th>
            <th class="col-aksi"></th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr v-if="loading">
            <td colspan="4" class="table-state">
              <span class="material-symbols-rounded spin" style="font-size:32px;color:var(--md-sys-color-primary)">progress_activity</span>
              <span class="text-body-medium" style="color:var(--md-sys-color-on-surface-variant)">Memuat data...</span>
            </td>
          </tr>

          <!-- Empty State (no API url) -->
          <tr v-else-if="!apiUrl">
            <td colspan="4" class="table-state">
              <span class="material-symbols-rounded" style="font-size:48px;color:#BDBDBD">link_off</span>
              <span class="text-title-medium" style="color:var(--md-sys-color-on-surface-variant)">Masukkan URL API</span>
              <span class="text-body-medium" style="color:#BDBDBD">Masukkan URL endpoint crudcrud.com Anda di atas</span>
            </td>
          </tr>

          <!-- Empty Search Result -->
          <tr v-else-if="paginatedRows.length === 0 && searchQuery">
            <td colspan="4" class="table-state">
              <span class="material-symbols-rounded" style="font-size:48px;color:#BDBDBD">search_off</span>
              <span class="text-title-medium" style="color:var(--md-sys-color-on-surface-variant)">Tidak ada hasil</span>
              <span class="text-body-medium" style="color:#BDBDBD">Coba kata kunci lain</span>
            </td>
          </tr>

          <!-- Empty Data -->
          <tr v-else-if="paginatedRows.length === 0">
            <td colspan="4" class="table-state">
              <span class="material-symbols-rounded" style="font-size:48px;color:#BDBDBD">discount</span>
              <span class="text-title-medium" style="color:var(--md-sys-color-on-surface-variant)">Belum ada diskon</span>
              <span class="text-body-medium" style="color:#BDBDBD">Klik "+ Tambah diskon" untuk menambahkan diskon baru</span>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr
            v-else
            v-for="item in paginatedRows"
            :key="item._id"
            class="table-row"
            :class="{ selected: selectedIds.includes(item._id) }"
          >
            <td class="col-check">
              <input
                type="checkbox"
                class="md-checkbox"
                :id="`check-${item._id}`"
                :checked="selectedIds.includes(item._id)"
                @change="toggleSelect(item._id)"
              />
            </td>
            <td class="col-nama">
              <span class="item-name">{{ item.namaDiskon }}</span>
            </td>
            <td class="col-nilai">
              <span class="item-value">{{ formatNilai(item) }}</span>
            </td>
            <td class="col-aksi">
              <button
                class="action-btn"
                :id="`edit-btn-${item._id}`"
                @click="$emit('edit', item)"
                title="Edit diskon"
              >
                <span class="material-symbols-rounded">edit</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination-bar" v-if="filteredRows.length > 0">
      <div class="page-size-select">
        <select v-model.number="pageSize" id="page-size-select" @change="currentPage = 1">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
        <span class="material-symbols-rounded" style="font-size:18px;pointer-events:none;position:absolute;right:8px;top:50%;transform:translateY(-50%)">expand_more</span>
      </div>
      <span class="text-body-medium" style="color:var(--md-sys-color-on-surface-variant)">data per halaman</span>

      <div class="pagination-controls">
        <button
          class="page-btn"
          id="prev-page-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          <span class="material-symbols-rounded">chevron_left</span>
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          class="page-btn"
          :class="{ active: page === currentPage, dots: page === '...' }"
          :id="`page-btn-${page}`"
          :disabled="page === '...'"
          @click="page !== '...' && (currentPage = page)"
        >{{ page }}</button>

        <button
          class="page-btn"
          id="next-page-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          <span class="material-symbols-rounded">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  diskons: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  apiUrl: { type: String, default: '' },
})

const emit = defineEmits(['edit', 'bulk-delete', 'api-url-change'])

// API URL
const localApiUrl = ref(props.apiUrl)
watch(() => props.apiUrl, (v) => { localApiUrl.value = v })

const applyApiUrl = () => {
  emit('api-url-change', localApiUrl.value.trim())
}

// Search
const searchQuery = ref('')

// Sort
const sortKey = ref('namaDiskon')
const sortDir = ref('asc')

const toggleSort = (key) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

// Filter + sort
const filteredRows = computed(() => {
  let rows = [...props.diskons]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    rows = rows.filter(r => r.namaDiskon?.toLowerCase().includes(q))
  }
  rows.sort((a, b) => {
    const valA = a[sortKey.value]
    const valB = b[sortKey.value]
    if (typeof valA === 'string') {
      return sortDir.value === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    }
    return sortDir.value === 'asc' ? valA - valB : valB - valA
  })
  return rows
})

// Pagination
const pageSize = ref(10)
const currentPage = ref(1)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)))

watch(filteredRows, () => { currentPage.value = 1 })

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
})

// Selection
const selectedIds = ref([])

const isAllSelected = computed(() =>
  paginatedRows.value.length > 0 &&
  paginatedRows.value.every(r => selectedIds.value.includes(r._id))
)

const isIndeterminate = computed(() =>
  selectedIds.value.length > 0 && !isAllSelected.value
)

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = selectedIds.value.filter(id => !paginatedRows.value.find(r => r._id === id))
  } else {
    paginatedRows.value.forEach(r => {
      if (!selectedIds.value.includes(r._id)) selectedIds.value.push(r._id)
    })
  }
}

const toggleSelect = (id) => {
  const idx = selectedIds.value.indexOf(id)
  if (idx === -1) selectedIds.value.push(id)
  else selectedIds.value.splice(idx, 1)
}

// Clear selection after bulk delete
watch(() => props.diskons, () => {
  selectedIds.value = selectedIds.value.filter(id => props.diskons.find(d => d._id === id))
})

// Format nilai
const formatNilai = (item) => {
  if (item.jenisDiskon === 'persentase') return `${item.nilaiDiskon}%`
  return `Rp ${Number(item.nilaiDiskon).toLocaleString('id-ID')}`
}
</script>

<style scoped>
.table-container {
  background: var(--md-sys-color-surface);
  border-radius: var(--md-sys-shape-corner-medium);
  box-shadow: var(--md-sys-elevation-1);
  overflow: hidden;
}

/* Toolbar */
.table-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  flex-wrap: wrap;
}

.search-field {
  display: flex;
  align-items: center;
  background: var(--md-sys-color-surface);
  border: 1.5px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-full);
  padding: 8px 16px;
  gap: 8px;
  min-width: 220px;
  max-width: 300px;
  transition: border-color 0.2s;
}
.search-field:focus-within {
  border-color: var(--md-sys-color-primary);
}
.search-field .search-icon {
  font-size: 20px;
  color: var(--md-sys-color-on-surface-variant);
  flex-shrink: 0;
}
.search-field input {
  border: none;
  outline: none;
  flex: 1;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: var(--md-sys-color-on-surface);
  background: transparent;
  min-width: 0;
}
.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  align-items: center;
  padding: 0;
}

.api-url-field {
  display: flex;
  align-items: center;
  background: var(--md-sys-color-surface);
  border: 1.5px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-full);
  padding: 8px 16px;
  gap: 8px;
  flex: 1;
  min-width: 240px;
  transition: border-color 0.2s;
}
.api-url-field:focus-within {
  border-color: var(--md-sys-color-primary);
}
.api-icon {
  font-size: 20px;
  color: var(--md-sys-color-on-surface-variant);
  flex-shrink: 0;
}
.api-url-field input {
  border: none;
  outline: none;
  flex: 1;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: var(--md-sys-color-on-surface);
  background: transparent;
  min-width: 0;
}
.api-apply-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-primary);
  display: flex;
  align-items: center;
}

/* Bulk bar */
.bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: var(--md-sys-color-primary-lighter);
  border-bottom: 1px solid var(--md-sys-color-primary-container);
}
.slide-bar-enter-active, .slide-bar-leave-active {
  transition: all 0.2s ease;
}
.slide-bar-enter-from, .slide-bar-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.diskon-table {
  width: 100%;
  border-collapse: collapse;
}

.diskon-table thead th {
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--md-sys-color-on-surface-variant);
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  background: var(--md-sys-color-surface);
  white-space: nowrap;
}

.diskon-table tbody td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant);
  vertical-align: middle;
}

.diskon-table tbody tr:last-child td {
  border-bottom: none;
}

.table-row {
  transition: background 0.15s;
}

.table-row:hover {
  background: var(--md-sys-color-surface-variant);
}

.table-row.selected {
  background: var(--md-sys-color-primary-lighter);
}

.col-check {
  width: 48px;
  padding-left: 20px !important;
}

.col-nama {
  width: 60%;
}

.col-nilai {
  width: 30%;
}

.col-aksi {
  width: 60px;
  text-align: right;
  padding-right: 20px !important;
}

.item-name {
  font-size: 14px;
  font-weight: 400;
  color: var(--md-sys-color-on-surface);
}

.item-value {
  font-size: 14px;
  color: var(--md-sys-color-on-surface);
}

/* Sort button */
.sort-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  color: var(--md-sys-color-on-surface-variant);
  padding: 0;
  font-family: 'Roboto', sans-serif;
}

.sort-icon {
  font-size: 14px;
  opacity: 0.4;
  transition: opacity 0.15s;
}
.sort-icon.active {
  opacity: 1;
  color: var(--md-sys-color-primary);
}

/* Action button */
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--md-sys-color-on-surface-variant);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition: all 0.15s;
  margin-left: auto;
}
.action-btn:hover {
  background: var(--md-sys-color-surface-variant);
  color: var(--md-sys-color-on-surface);
}
.action-btn .material-symbols-rounded {
  font-size: 20px;
}

/* Empty / Loading state */
.table-state {
  text-align: center;
  padding: 60px 20px !important;
}
.table-state > * {
  display: block;
  margin-bottom: 8px;
}

/* Pagination */
.pagination-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-top: 1px solid var(--md-sys-color-outline-variant);
  flex-wrap: wrap;
}

.page-size-select {
  position: relative;
  display: flex;
  align-items: center;
}
.page-size-select select {
  appearance: none;
  border: 1.5px solid var(--md-sys-color-outline-variant);
  border-radius: var(--md-sys-shape-corner-small);
  padding: 6px 32px 6px 12px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  background: white;
  cursor: pointer;
  outline: none;
}
.page-size-select select:focus {
  border-color: var(--md-sys-color-primary);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: transparent;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled):not(.dots) {
  background: var(--md-sys-color-surface-variant);
}
.page-btn.active {
  background: var(--md-sys-color-primary);
  color: white;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.page-btn.dots {
  cursor: default;
}
.page-btn .material-symbols-rounded {
  font-size: 20px;
}

.spin {
  animation: spin 0.8s linear infinite;
  display: flex;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
