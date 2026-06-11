import { ref, computed } from 'vue'
import axios from 'axios'

const API_STORAGE_KEY = 'nutapos_diskon_api_url'

export function useDiskon() {
  const apiUrl = ref(localStorage.getItem(API_STORAGE_KEY) || '')
  const diskons = ref([])
  const loading = ref(false)
  const error = ref(null)

  const saveApiUrl = (url) => {
    apiUrl.value = url
    localStorage.setItem(API_STORAGE_KEY, url)
  }

  const getDiskonEndpoint = () => {
    const base = apiUrl.value.trim().replace(/\/$/, '')
    return `${base}/diskon`
  }

  const fetchDiskons = async () => {
    if (!apiUrl.value) return
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(getDiskonEndpoint())
      diskons.value = data
    } catch (err) {
      error.value = 'Gagal memuat data diskon. Periksa URL API Anda.'
      diskons.value = []
    } finally {
      loading.value = false
    }
  }

  const createDiskon = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.post(getDiskonEndpoint(), payload)
      diskons.value.push(data)
      return { success: true, data }
    } catch (err) {
      error.value = 'Gagal membuat diskon baru.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const updateDiskon = async (id, payload) => {
    loading.value = true
    error.value = null
    try {
      await axios.put(`${getDiskonEndpoint()}/${id}`, payload)
      const idx = diskons.value.findIndex(d => d._id === id)
      if (idx !== -1) {
        diskons.value[idx] = { ...diskons.value[idx], ...payload }
      }
      return { success: true }
    } catch (err) {
      error.value = 'Gagal mengupdate diskon.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const deleteDiskon = async (id) => {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`${getDiskonEndpoint()}/${id}`)
      diskons.value = diskons.value.filter(d => d._id !== id)
      return { success: true }
    } catch (err) {
      error.value = 'Gagal menghapus diskon.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const deleteMultipleDiskons = async (ids) => {
    loading.value = true
    error.value = null
    try {
      await Promise.all(ids.map(id => axios.delete(`${getDiskonEndpoint()}/${id}`)))
      diskons.value = diskons.value.filter(d => !ids.includes(d._id))
      return { success: true }
    } catch (err) {
      error.value = 'Gagal menghapus beberapa diskon.'
      return { success: false }
    } finally {
      loading.value = false
    }
  }

  const isNameDuplicate = (name, excludeId = null) => {
    return diskons.value.some(
      d => d.namaDiskon.toLowerCase() === name.toLowerCase() && d._id !== excludeId
    )
  }

  return {
    apiUrl,
    diskons,
    loading,
    error,
    saveApiUrl,
    fetchDiskons,
    createDiskon,
    updateDiskon,
    deleteDiskon,
    deleteMultipleDiskons,
    isNameDuplicate,
  }
}
