<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatDeck, { type StatItem } from '@/components/ui/StatDeck.vue'
import AIResponsePanel from '@/components/ui/AIResponsePanel.vue'
import { useTikTokStore } from '@/stores/tiktok'
import { generateHooks } from '@/services/aiService'
import { 
  Eye, 
  Clock, 
  Zap, 
  Users,
  Sparkles,
  Share2,
  Play,
  MessageSquare,
  Bookmark,
  UserPlus
} from 'lucide-vue-next'
import type { HookIdea } from '@/types'

const store = useTikTokStore()

// AI State
const aiLoading = ref(false)
const aiError = ref<string | null>(null)
const aiHooks = ref<HookIdea[]>([])

async function generateHookIdeas() {
  if (store.videos.length < 3) {
    aiError.value = 'Need at least 3 videos to analyze patterns'
    return
  }

  aiLoading.value = true
  aiError.value = null

  try {
    aiHooks.value = await generateHooks(store.videos)
  } catch (err) {
    aiError.value = 'Failed to generate hooks. Please try again.'
  } finally {
    aiLoading.value = false
  }
}

// Scatter plot series
const scatterSeries = computed(() => [{
  name: 'Videos',
  data: store.scatterData.map(d => ({
    x: d.x,
    y: d.y
  }))
}])

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const statItems = computed<StatItem[]>(() => [
  { label: 'Total Views', value: formatNumber(store.metrics.totalViews), icon: Eye, color: 'var(--color-tiktok)' },
  { label: 'Total Engagement', value: formatNumber(store.metrics.totalEngagement), icon: Zap, color: '#FE2C55' },
  { label: 'Avg Watch Time', value: store.metrics.avgWatchTime.toFixed(1) + 's', icon: Clock, color: '#25F4EE' },
  { label: 'Virality Score', value: store.metrics.viralityScore.toFixed(2), icon: Sparkles, color: '#FF0050' },
  { label: 'Total Likes', value: formatNumber(store.metrics.totalLikes), icon: Zap, color: '#FE2C55' },
  { label: 'Total Comments', value: formatNumber(store.metrics.totalComments), icon: MessageSquare, color: '#25F4EE' },
  { label: 'Total Shares', value: formatNumber(store.metrics.totalShares), icon: Share2, color: '#00F2EA' },
  { label: 'Total Saves', value: formatNumber(store.metrics.totalSaves), icon: Bookmark, color: '#FFDC80' },
  { label: 'Total New Follows', value: formatNumber(store.metrics.totalNewFollowers), icon: UserPlus, color: '#00f2ea' },
  { label: 'Completion Rate', value: store.metrics.avgCompletionRate.toFixed(1) + '%', icon: Clock, color: '#E1306C' },
])
</script>

<template>
  <DashboardLayout title="TikTok Workspace" subtitle="Virality Engine & Hook Analysis">
    <div class="bento-grid">
      <!-- Row 1: Comprehensive Stat Deck -->
      <div class="col-span-12">
        <StatDeck :items="statItems" class="mb-2" />
      </div>

      <!-- Row 2: Scatter Plot & AI Panel -->
      <div class="col-span-12 lg:col-span-8">
        <ChartCard 
          title="🎯 Hook Efficiency"
          subtitle="Duration vs Completion Rate - Find the sweet spot"
          type="scatter"
          :series="scatterSeries"
          :height="350"
          :options="{
            xaxis: {
              title: { text: 'Duration (seconds)', style: { color: '#94a3b8' } },
              tickAmount: 10
            },
            yaxis: {
              title: { text: 'Completion Rate (%)', style: { color: '#94a3b8' } },
              max: 100
            },
            markers: {
              size: 10,
              colors: ['#00f2ea'],
              strokeColors: '#fff',
              strokeWidth: 2
            },
            tooltip: {
              custom: function({ seriesIndex, dataPointIndex, w }) {
                const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex]
                return `<div style='padding: 10px'>` +
                  `<strong>Duration:</strong> ${data.x}s<br>` +
                  `<strong>Completion:</strong> ${data.y.toFixed(1)}%</div>`
              }
            }
          }"
        />
      </div>

      <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <div class="ai-section glass-card h-full">
          <div class="ai-section__header">
            <h3 class="ai-section__title">
              <Sparkles :size="18" class="text-tiktok" />
              Hook Generator AI
            </h3>
            <p class="ai-section__desc">
              Generate 10 viral title ideas based on your top performing videos
            </p>
            <button 
              class="btn btn-primary w-full"
              :disabled="aiLoading || store.videos.length < 3"
              @click="generateHookIdeas"
            >
              <Sparkles :size="16" />
              {{ aiLoading ? 'Generating...' : 'Generate Hooks' }}
            </button>
          </div>

          <AIResponsePanel 
            title="Hook Ideas"
            :loading="aiLoading"
            :error="aiError"
            :content="aiHooks.length ? 'Generated' : null"
            @retry="generateHookIdeas"
            class="flex-1 min-h-0"
          >
            <div v-if="aiHooks.length" class="hooks-list">
              <div 
                v-for="(hook, idx) in aiHooks" 
                :key="idx"
                class="hook-item"
              >
                <div class="hook-item__number">{{ idx + 1 }}</div>
                <div class="hook-item__content">
                  <p class="hook-item__title">{{ hook.title }}</p>
                  <p v-if="hook.hook" class="hook-item__hook">
                    <Play :size="12" /> "{{ hook.hook }}"
                  </p>
                </div>
              </div>
            </div>
          </AIResponsePanel>
        </div>
      </div>

      <!-- Row 3: Virality Ranking (Horizontal Cards) -->
      <div class="col-span-12">
        <h3 class="section-title mb-6 flex items-center gap-2">
           <Zap class="text-tiktok" :size="20"/> 
           Virality Ranking (Top 4)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            v-for="(video, idx) in store.viralityTable.slice(0, 4)" 
            :key="idx"
            class="glass-card p-4 flex flex-col gap-3 relative overflow-hidden"
          >
            <!-- Rank Badge -->
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2">
                <span class="flex items-center justify-center w-6 h-6 rounded-full bg-tiktok text-black font-bold text-xs">
                  #{{ idx + 1 }}
                </span>
                <span class="text-xs font-semibold text-tiktok uppercase tracking-wider">
                  {{ video.viralityRatio.toFixed(1) }}x Viral
                </span>
              </div>
            </div>

            <!-- Title -->
            <h4 class="font-medium text-white text-sm line-clamp-2 leading-relaxed" :title="video.title">
              {{ video.title }}
            </h4>

            <!-- Stats -->
            <div class="mt-auto pt-3 border-t border-glass-border flex justify-between text-xs text-secondary">
              <span class="flex items-center gap-1.5">
                <Eye :size="14" /> 
                {{ formatNumber(video.views) }}
              </span>
              <span class="flex items-center gap-1.5">
                <Share2 :size="14" /> 
                {{ formatNumber(video.shares) }}
              </span>
            </div>
            
            <!-- Subtle gradient bg -->
            <div class="absolute inset-0 bg-gradient-to-br from-tiktok/5 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </div>

      <!-- Row 4: Detailed Table -->
      <div class="col-span-12">
        <DataTable 
          :data="store.videos"
          :columns="[
            { key: 'title', label: 'Title', sortable: true, format: (val) => val.length > 50 ? val.substring(0, 50) + '...' : val },
            { key: 'publishDate', label: 'Date', sortable: true, type: 'date' },
            { key: 'duration', label: 'Duration (s)', sortable: true, type: 'number' },
            { key: 'views', label: 'Views', sortable: true, type: 'number' },
            { key: 'likes', label: 'Likes', sortable: true, type: 'number' },
            { key: 'comments', label: 'Comments', sortable: true, type: 'number' },
            { key: 'shares', label: 'Shares', sortable: true, type: 'number' },
            { key: 'saves', label: 'Saves', sortable: true, type: 'number' },
            { key: 'avgWatchTime', label: 'Avg Watch (s)', sortable: true, type: 'number' },
            { key: 'totalPlayTime', label: 'Total Play Time', sortable: true, type: 'number' },
            { key: 'fullVideoWatched', label: 'Full Watched (%)', sortable: true, type: 'percent' },
            { key: 'retentionRate', label: 'Retention (%)', sortable: true, type: 'percent' },
            { key: 'newFollowers', label: 'New Followers', sortable: true, type: 'number' },
            { key: 'scrapeTime', label: 'Scrape Time', sortable: true, type: 'date' }
          ]"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 32px; /* Increased gap for better spacing */
  width: 100%;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.content-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

/* Table Styles */
.table-container {
  padding: 0;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--color-glass-border);
}

.data-table th {
  background: var(--color-void-lighter);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-muted);
}

.data-table td {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.data-table tr:hover td {
  background: var(--color-glass);
}

.rank {
  font-weight: 600;
  color: var(--color-text-muted);
  width: 40px;
}

.title {
  color: var(--color-text-primary) !important;
  font-weight: 500;
}

.virality-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: var(--color-glass);
  color: var(--color-text-secondary);
}

.virality-badge.viral {
  background: rgba(0, 242, 234, 0.15);
  color: var(--color-tiktok);
}

.empty-table {
  padding: 40px;
  text-align: center;
  color: var(--color-text-muted);
}

/* AI Section */
.content-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-section {
  padding: 20px;
}

.ai-section__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.ai-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.text-tiktok {
  color: var(--color-tiktok);
}

.ai-section__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.hooks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.hook-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: var(--color-void-light);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-glass-border);
}

.hook-item__number {
  width: 24px;
  height: 24px;
  background: var(--color-tiktok);
  color: #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.hook-item__content {
  flex: 1;
}

.hook-item__title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 6px 0;
}

.hook-item__hook {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-tiktok);
  margin: 0 0 6px 0;
  font-style: italic;
}

.hook-item__explanation {
  font-size: 11px;
  color: var(--color-text-muted);
  margin: 0;
}

/* Quick Stats */
.quick-stats {
  padding: 20px;
}

.quick-stats__title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.quick-stat {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-glass-border);
}

.quick-stat:last-child {
  border-bottom: none;
}

.quick-stat__label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.quick-stat__value {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Responsive */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
</style>
