<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowUpDown, ExternalLink } from 'lucide-vue-next'

export interface Column {
  key: string
  label: string
  sortable?: boolean
  format?: (value: any) => string
  type?: 'text' | 'number' | 'link' | 'percent' | 'date'
}

const props = defineProps<{
  data: any[]
  columns: Column[]
  defaultSort?: string
  loading?: boolean
}>()

const sortKey = ref(props.defaultSort || '')
const sortOrder = ref<'asc' | 'desc'>('desc')
const searchQuery = ref('')

const sortedData = computed(() => {
  let result = [...props.data]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(item => 
      Object.keys(item).some(key => 
        String(item[key]).toLowerCase().includes(query)
      )
    )
  }

  if (sortKey.value) {
    result.sort((a, b) => {
      const aVal = a[sortKey.value]
      const bVal = b[sortKey.value]
      
      if (aVal === bVal) return 0
      
      const comparison = aVal > bVal ? 1 : -1
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  }

  return result
})

function toggleSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

function formatValue(row: any, col: Column) {
  const val = row[col.key]
  
  if (col.format) return col.format(val)
  if (val === undefined || val === null) return '-'
  
  switch (col.type) {
    case 'number':
      return new Intl.NumberFormat('en-US').format(val)
    case 'percent':
      return `${val.toFixed(2)}%`
    case 'date':
      return new Date(val).toLocaleDateString()
    default:
      return val
  }
}
</script>

<template>
  <div class="glass-panel p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-white">Detailed Data Analysis</h3>
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search data..." 
        class="bg-void-light border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-blue w-64"
      />
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-white/10">
            <th 
              v-for="col in columns" 
              :key="col.key"
              class="py-3 px-4 font-medium text-gray-400 text-sm cursor-pointer hover:text-white transition-colors whitespace-nowrap"
              @click="col.sortable && toggleSort(col.key)"
            >
              <div class="flex items-center gap-1">
                {{ col.label }}
                <ArrowUpDown v-if="col.sortable" :size="14" class="opacity-50" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody v-if="loading">
          <tr v-for="i in 5" :key="i">
            <td v-for="col in columns" :key="col.key" class="py-4 px-4">
              <div class="h-4 bg-white/5 rounded animate-pulse"></div>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="sortedData.length > 0">
          <tr 
            v-for="(row, i) in sortedData" 
            :key="i"
            class="border-b border-white/5 hover:bg-white/5 transition-colors"
          >
            <td v-for="col in columns" :key="col.key" class="py-3 px-4 text-sm text-gray-300 whitespace-nowrap">
              <template v-if="col.type === 'link' && row[col.key]">
                <a 
                  :href="row[col.key]" 
                  target="_blank" 
                  class="text-neon-blue hover:text-neon-purple flex items-center gap-1"
                >
                  Link <ExternalLink :size="12" />
                </a>
              </template>
              <template v-else>
                {{ formatValue(row, col) }}
              </template>
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td :colspan="columns.length" class="py-8 text-center text-gray-500">
              No data available
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="mt-4 text-xs text-gray-500 text-right">
      Showing {{ sortedData.length }} rows
    </div>
  </div>
</template>
