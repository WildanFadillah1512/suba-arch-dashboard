<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import DataTable from '@/components/ui/DataTable.vue'
import AIResponsePanel from '@/components/ui/AIResponsePanel.vue'
import { useWhatsAppStore } from '@/stores/whatsapp'
import { summarizeLead } from '@/services/aiService'
import { 
  Users, 
  TrendingUp, 
  Flame, 
  MessageCircle,
  Sparkles,
  GripVertical,
  Phone,
  MapPin,
  ExternalLink
} from 'lucide-vue-next'
import type { WhatsAppLead, KanbanColumn, LeadSummary } from '@/types'

const store = useWhatsAppStore()

// Drag state
const draggedLead = ref<WhatsAppLead | null>(null)

// AI State
const aiLoading = ref(false)
const aiError = ref<string | null>(null)
const selectedLead = ref<WhatsAppLead | null>(null)
const leadSummary = ref<LeadSummary | null>(null)

const kanbanColumns: { id: KanbanColumn; title: string; color: string }[] = [
  { id: 'new', title: 'New Leads', color: 'var(--color-neon-blue)' },
  { id: 'contacted', title: 'Contacted', color: 'var(--color-neon-purple)' },
  { id: 'meeting', title: 'Meeting', color: 'var(--color-neon-orange)' },
  { id: 'closing', title: 'Closing', color: 'var(--color-neon-green)' }
]

// Pie chart data
const sourceChartSeries = computed(() => 
  store.sourceDistribution.map(s => s.count)
)
const sourceChartLabels = computed(() => 
  store.sourceDistribution.map(s => s.name)
)

function getColumnLeads(columnId: KanbanColumn): WhatsAppLead[] {
  return store.kanban[columnId]
}

function handleDragStart(lead: WhatsAppLead) {
  draggedLead.value = lead
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
}

function handleDrop(columnId: KanbanColumn) {
  if (draggedLead.value) {
    store.moveLead(draggedLead.value.id, columnId)
    draggedLead.value = null
  }
}

async function analyzeLead(lead: WhatsAppLead) {
  selectedLead.value = lead
  
  if (!lead.chat) {
    aiError.value = 'No chat content available for this lead'
    return
  }

  aiLoading.value = true
  aiError.value = null

  try {
    leadSummary.value = await summarizeLead(lead.chat, lead.name)
    // Update the lead in store
    store.updateLeadSummary(
      lead.id, 
      leadSummary.value.summary, 
      leadSummary.value.sentiment,
      leadSummary.value.nextAction
    )
  } catch (err) {
    aiError.value = 'Failed to analyze lead. Please try again.'
  } finally {
    aiLoading.value = false
  }
}

function getLevelColor(level: string): string {
  switch (level) {
    case 'hot': return 'var(--color-neon-pink)'
    case 'warm': return 'var(--color-neon-orange)'
    default: return 'var(--color-neon-blue)'
  }
}

function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive': return 'var(--color-neon-green)'
    case 'urgent': return 'var(--color-neon-pink)'
    case 'negative': return 'var(--color-neon-orange)'
    default: return 'var(--color-text-secondary)'
  }
}
</script>

<template>
  <DashboardLayout title="WhatsApp CRM" subtitle="Revenue & Lead Management">
    <!-- Metrics Row -->
    <div class="metrics-grid">
      <MetricCard 
        title="Total Leads" 
        :value="store.metrics.totalLeads.toString()"
        :icon="Users"
        color="var(--color-whatsapp)"
      />
      <MetricCard 
        title="Conversion Rate" 
        :value="store.metrics.conversionRate.toFixed(1) + '%'"
        :icon="TrendingUp"
        color="var(--color-neon-green)"
      />
      <MetricCard 
        title="Hot Leads" 
        :value="(store.metrics.leadsByLevel['hot'] || 0).toString()"
        :icon="Flame"
        color="var(--color-neon-pink)"
      />
      <MetricCard 
        title="Active Chats" 
        :value="((store.metrics.leadsByStatus['contacted'] || 0) + (store.metrics.leadsByStatus['meeting'] || 0)).toString()"
        :icon="MessageCircle"
        color="var(--color-neon-purple)"
      />
      <MetricCard 
        title="New Leads" 
        :value="(store.metrics.leadsByStatus['new'] || 0).toString()"
        :icon="Sparkles"
        color="var(--color-neon-blue)"
      />
      <MetricCard 
        title="Meetings" 
        :value="(store.metrics.leadsByStatus['meeting'] || 0).toString()"
        :icon="Users"
        color="var(--color-neon-orange)"
      />
      <MetricCard 
        title="Closed" 
        :value="(store.metrics.leadsByStatus['closing'] || 0).toString()"
        :icon="TrendingUp"
        color="var(--color-neon-green)"
      />
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Kanban Board -->
      <div class="kanban-section">
        <h3 class="section-title">📋 Lead Pipeline</h3>
        <div class="kanban-board">
          <div 
            v-for="column in kanbanColumns"
            :key="column.id"
            class="kanban-column"
            @dragover="handleDragOver"
            @drop="handleDrop(column.id)"
          >
            <div class="kanban-column__header">
              <span 
                class="kanban-column__indicator" 
                :style="{ background: column.color }"
              />
              <span class="kanban-column__title">{{ column.title }}</span>
              <span class="kanban-column__count">{{ getColumnLeads(column.id).length }}</span>
            </div>

            <div class="kanban-column__cards">
              <div 
                v-for="lead in getColumnLeads(column.id)"
                :key="lead.id"
                class="lead-card"
                draggable="true"
                @dragstart="handleDragStart(lead)"
                @click="analyzeLead(lead)"
              >
                <div class="lead-card__header">
                  <GripVertical :size="14" class="drag-handle" />
                  <span 
                    class="lead-card__level"
                    :style="{ background: getLevelColor(lead.level) + '20', color: getLevelColor(lead.level) }"
                  >
                    {{ lead.level }}
                  </span>
                </div>

                <h4 class="lead-card__name">{{ lead.name }}</h4>

                <div class="lead-card__info">
                  <span v-if="lead.phone">
                    <Phone :size="12" /> {{ lead.phone }}
                  </span>
                  <span v-if="lead.domicile">
                    <MapPin :size="12" /> {{ lead.domicile }}
                  </span>
                </div>

                <div class="lead-card__service" v-if="lead.service">
                  {{ lead.service }}
                </div>

                <div class="lead-card__source">
                  Source: {{ lead.source }}
                </div>

                <!-- AI Summary if available -->
                <div v-if="lead.summary" class="lead-card__ai">
                  <div 
                    class="ai-sentiment"
                    :style="{ color: getSentimentColor(lead.sentiment || 'neutral') }"
                  >
                    <Sparkles :size="12" />
                    {{ lead.sentiment }}
                  </div>
                  <p class="ai-summary">{{ lead.summary }}</p>
                </div>
              </div>

              <div v-if="getColumnLeads(column.id).length === 0" class="kanban-empty">
                No leads
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Source ROI + AI Panel -->
      <div class="content-sidebar">
        <!-- Source ROI Chart -->
        <ChartCard 
          title="📊 Lead Sources"
          subtitle="Where your leads come from"
          type="donut"
          :series="sourceChartSeries"
          :height="260"
          :options="{
            labels: sourceChartLabels,
            colors: ['#00d4ff', '#a855f7', '#ec4899', '#10b981', '#f97316'],
            plotOptions: {
              pie: {
                donut: {
                  size: '65%'
                }
              }
            }
          }"
        />

        <!-- AI Lead Summarizer -->
        <div class="ai-section glass-card">
          <div class="ai-section__header">
            <h3 class="ai-section__title">
              <Sparkles :size="18" class="text-whatsapp" />
              Smart Lead Summarizer
            </h3>
            <p class="ai-section__desc">
              Click any lead card to analyze chat with AI
            </p>
          </div>

          <!-- Selected Lead Info -->
          <div v-if="selectedLead" class="selected-lead">
            <div class="selected-lead__header">
              <span class="selected-lead__name">{{ selectedLead.name }}</span>
              <a 
                v-if="selectedLead.link" 
                :href="selectedLead.link" 
                target="_blank"
                class="selected-lead__link"
              >
                <ExternalLink :size="14" />
              </a>
            </div>
            <p class="selected-lead__preview">
              {{ selectedLead.chat?.substring(0, 150) }}...
            </p>
          </div>

          <!-- AI Response -->
          <AIResponsePanel 
            title="Lead Analysis"
            :loading="aiLoading"
            :error="aiError"
            :content="leadSummary ? 'Generated' : null"
            @retry="selectedLead && analyzeLead(selectedLead)"
          >
            <div v-if="leadSummary" class="lead-analysis">
              <!-- Summary -->
              <div class="analysis-section">
                <span class="analysis-label">Summary</span>
                <p>{{ leadSummary.summary }}</p>
              </div>

              <!-- Sentiment -->
              <div class="analysis-section">
                <span class="analysis-label">Sentiment</span>
                <span 
                  class="sentiment-badge"
                  :style="{ 
                    background: getSentimentColor(leadSummary.sentiment) + '20',
                    color: getSentimentColor(leadSummary.sentiment)
                  }"
                >
                  {{ leadSummary.sentiment }}
                </span>
              </div>

              <!-- Next Action -->
              <div class="analysis-section">
                <span class="analysis-label">Recommended Action</span>
                <p class="next-action">{{ leadSummary.nextAction }}</p>
              </div>

              <!-- Key Points -->
              <div v-if="leadSummary.keyPoints?.length" class="analysis-section">
                <span class="analysis-label">Key Points</span>
                <ul class="key-points">
                  <li v-for="(point, idx) in leadSummary.keyPoints" :key="idx">
                    {{ point }}
                  </li>
                </ul>
              </div>
            </div>
          </AIResponsePanel>
        </div>
      </div>
    </div>

    <!-- Row 3: Detailed Lead Table -->
    <div class="mt-6">
      <DataTable 
        :data="store.leads"
        :columns="[
          { key: 'time', label: 'Time', sortable: true, type: 'date' },
          { key: 'day', label: 'Day', sortable: true },
          { key: 'name', label: 'Name', sortable: true },
          { key: 'phone', label: 'Phone', sortable: true },
          { key: 'domicile', label: 'Domicile', sortable: true },
          { key: 'service', label: 'Service', sortable: true },
          { key: 'source', label: 'Source', sortable: true },
          { key: 'level', label: 'Level', sortable: true },
          { key: 'status', label: 'Status', sortable: true },
          { key: 'chat', label: 'Chat Preview', sortable: true, format: (val) => val ? val.substring(0, 50) + '...' : '-' },
          { key: 'link', label: 'Link', type: 'link' }
        ]"
        default-sort="time"
        :loading="store.loading"
      />
    </div>
  </DashboardLayout>
</template>

<style scoped>
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

/* Kanban Board */
.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kanban-column {
  background: var(--color-void-light);
  border-radius: var(--radius-glass);
  padding: 16px;
  min-height: 500px;
}

.kanban-column__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.kanban-column__indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.kanban-column__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.kanban-column__count {
  margin-left: auto;
  font-size: 12px;
  color: var(--color-text-muted);
  background: var(--color-glass);
  padding: 2px 8px;
  border-radius: 10px;
}

.kanban-column__cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lead-card {
  background: var(--color-glass);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-card);
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.lead-card:hover {
  background: var(--color-glass-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.lead-card:active {
  cursor: grabbing;
}

.lead-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.drag-handle {
  color: var(--color-text-muted);
  cursor: grab;
}

.lead-card__level {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
}

.lead-card__name {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--color-text-primary);
}

.lead-card__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.lead-card__info span {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-muted);
}

.lead-card__service {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 6px 10px;
  background: var(--color-void-lighter);
  border-radius: 6px;
  margin-bottom: 8px;
}

.lead-card__source {
  font-size: 10px;
  color: var(--color-text-muted);
}

.lead-card__ai {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--color-glass-border);
}

.ai-sentiment {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
  margin-bottom: 6px;
}

.ai-summary {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.kanban-empty {
  text-align: center;
  padding: 20px;
  color: var(--color-text-muted);
  font-size: 13px;
}

/* Sidebar */
.content-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-section {
  padding: 20px;
}

.ai-section__header {
  margin-bottom: 16px;
}

.ai-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.text-whatsapp {
  color: var(--color-whatsapp);
}

.ai-section__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.selected-lead {
  background: var(--color-void-light);
  border-radius: var(--radius-button);
  padding: 12px;
  margin-bottom: 16px;
}

.selected-lead__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.selected-lead__name {
  font-size: 14px;
  font-weight: 600;
}

.selected-lead__link {
  color: var(--color-text-muted);
}

.selected-lead__link:hover {
  color: var(--color-text-primary);
}

.selected-lead__preview {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.4;
}

.lead-analysis {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.analysis-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
}

.analysis-section p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.sentiment-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  padding: 4px 12px;
  border-radius: 6px;
  width: fit-content;
}

.next-action {
  background: var(--color-void-light);
  padding: 10px 12px;
  border-radius: 6px;
  border-left: 3px solid var(--color-whatsapp);
}

.key-points {
  margin: 0;
  padding-left: 20px;
}

.key-points li {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
}

/* Responsive */
@media (max-width: 1400px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metrics-grid,
  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>
