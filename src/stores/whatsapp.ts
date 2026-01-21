import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Papa from 'papaparse'
import type { WhatsAppLead, KanbanState, WhatsAppMetrics, KanbanColumn } from '@/types'

export const useWhatsAppStore = defineStore('whatsapp', () => {
  // State
  const leads = ref<WhatsAppLead[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed: Kanban state
  const kanban = computed<KanbanState>(() => ({
    new: leads.value.filter(l => l.status === 'new'),
    contacted: leads.value.filter(l => l.status === 'contacted'),
    meeting: leads.value.filter(l => l.status === 'meeting'),
    closing: leads.value.filter(l => l.status === 'closing')
  }))

  // Computed: Metrics
  const metrics = computed<WhatsAppMetrics>(() => {
    if (leads.value.length === 0) {
      return {
        totalLeads: 0,
        leadsBySource: {},
        leadsByLevel: {},
        leadsByStatus: {},
        conversionRate: 0,
        avgResponseTime: 0
      }
    }

    // Group by source
    const leadsBySource: Record<string, number> = {}
    leads.value.forEach(l => {
      leadsBySource[l.source] = (leadsBySource[l.source] || 0) + 1
    })

    // Group by level
    const leadsByLevel: Record<string, number> = {}
    leads.value.forEach(l => {
      leadsByLevel[l.level] = (leadsByLevel[l.level] || 0) + 1
    })

    // Group by status
    const leadsByStatus: Record<string, number> = {}
    leads.value.forEach(l => {
      leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1
    })

    // Conversion rate: closing / total
    const closingCount = leads.value.filter(l => l.status === 'closing').length
    const conversionRate = leads.value.length > 0 ? (closingCount / leads.value.length) * 100 : 0

    return {
      totalLeads: leads.value.length,
      leadsBySource,
      leadsByLevel,
      leadsByStatus,
      conversionRate,
      avgResponseTime: 0 // Would need timestamp data
    }
  })

  // Computed: Source distribution for pie chart
  const sourceDistribution = computed(() => {
    const sources = metrics.value.leadsBySource
    return Object.entries(sources).map(([name, count]) => ({
      name,
      count
    }))
  })

  // Action: Import CSV
  function importCSV(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      loading.value = true
      error.value = null

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            importData(results.data)
            loading.value = false
            resolve()
          } catch (e) {
            error.value = 'Failed to parse WhatsApp CSV'
            loading.value = false
            reject(e)
          }
        },
        error: (err) => {
          error.value = err.message
          loading.value = false
          reject(err)
        }
      })
    })
  }

  // Action: Import pre-parsed data (from CSV or XLSX)
  function importData(data: any[]): void {
    loading.value = true
    error.value = null

    try {
      const parsed: WhatsAppLead[] = data.map((row: any, index: number) => {
        // Parse dates safely with fallback
        const parseDate = (dateStr: string): Date => {
          if (!dateStr) return new Date()
          const parsed = new Date(dateStr)
          return isNaN(parsed.getTime()) ? new Date() : parsed
        }

        // Parse level
        let level: 'cold' | 'warm' | 'hot' = 'cold'
        const levelStr = (row['level'] || '').toLowerCase()
        if (levelStr.includes('hot')) level = 'hot'
        else if (levelStr.includes('warm')) level = 'warm'

        // Parse status
        let status: WhatsAppLead['status'] = 'new'
        const statusStr = (row['status'] || '').toLowerCase()
        if (statusStr.includes('contact')) status = 'contacted'
        else if (statusStr.includes('meeting')) status = 'meeting'
        else if (statusStr.includes('closing') || statusStr.includes('close')) status = 'closing'
        else if (statusStr.includes('lost')) status = 'lost'

        return {
          id: `lead-${index}-${Date.now()}`,
          time: parseDate(row['waktu']),
          day: row['hari'] || '',
          name: row['nama'] || '',
          phone: row['nomor'] || '',
          domicile: row['domisili'] || '',
          service: row['layanan'] || '',
          source: row['source'] || 'Unknown',
          level,
          status,
          link: row['link'] || '',
          chat: row['chat (wa)'] || row['chat'] || ''
        }
      })

      leads.value = parsed
      loading.value = false
    } catch (e) {
      error.value = 'Failed to parse WhatsApp data'
      loading.value = false
      throw e
    }
  }

  // Action: Move lead to different column
  function moveLead(leadId: string, newStatus: KanbanColumn) {
    const lead = leads.value.find(l => l.id === leadId)
    if (lead) {
      lead.status = newStatus
    }
  }

  // Action: Update lead AI summary
  function updateLeadSummary(
    leadId: string, 
    summary: string, 
    sentiment: WhatsAppLead['sentiment'], 
    nextAction: string
  ) {
    const lead = leads.value.find(l => l.id === leadId)
    if (lead) {
      lead.summary = summary
      lead.sentiment = sentiment
      lead.nextAction = nextAction
    }
  }

  // Action: Clear data
  function clearData() {
    leads.value = []
    error.value = null
  }

  return {
    leads,
    loading,
    error,
    kanban,
    metrics,
    sourceDistribution,
    importCSV,
    importData,
    moveLead,
    updateLeadSummary,
    clearData
  }
})

