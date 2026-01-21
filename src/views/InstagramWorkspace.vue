<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatDeck, { type StatItem } from '@/components/ui/StatDeck.vue'
import AIResponsePanel from '@/components/ui/AIResponsePanel.vue'
import { useInstagramStore } from '@/stores/instagram'
import { refineCaptions } from '@/services/aiService'
import { 
  Eye, 
  Heart, 
  Bookmark, 
  Share2,
  Sparkles,
  ExternalLink,
  Clock,
  UserPlus
} from 'lucide-vue-next'
import type { CaptionSuggestion } from '@/types'

const store = useInstagramStore()

// AI State
const aiLoading = ref(false)
const aiError = ref<string | null>(null)
const aiSuggestions = ref<CaptionSuggestion[]>([])

async function generateCaptionSuggestions() {
  if (store.posts.length < 3) {
    aiError.value = 'Need at least 3 posts to analyze patterns'
    return
  }

  aiLoading.value = true
  aiError.value = null

  try {
    aiSuggestions.value = await refineCaptions(store.posts)
  } catch (err) {
    aiError.value = 'Failed to generate suggestions. Please try again.'
  } finally {
    aiLoading.value = false
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const statItems = computed<StatItem[]>(() => [
  { label: 'Total Views', value: formatNumber(store.metrics.totalViews), icon: Eye, color: 'var(--color-instagram)' },
  { label: 'Total Reach', value: formatNumber(store.metrics.totalReach), icon: Sparkles, color: '#F56040' },
  { label: 'Engagement Rate', value: store.metrics.avgEngagementRate.toFixed(2) + '%', icon: Heart, color: '#E1306C' },
  { label: 'Total Saves', value: formatNumber(store.metrics.totalSaves), icon: Bookmark, color: '#C13584' },
  { label: 'Total Likes', value: formatNumber(store.metrics.totalLikes), icon: Heart, color: '#FD1D1D' },
  { label: 'Total Comments', value: formatNumber(store.metrics.totalComments), icon: Share2, color: '#5851DB' },
  { label: 'Total Shares', value: formatNumber(store.metrics.totalShares), icon: Share2, color: '#405DE6' },
  { label: 'Total Follows', value: formatNumber(store.metrics.totalFollows), icon: UserPlus, color: '#25D366' },
  { label: 'Total Duration', value: (store.metrics.totalDurationSec / 60).toFixed(0) + 'm', icon: Clock, color: '#833AB4' },
  { label: 'Top Performers', value: store.metrics.topPerformers, icon: Sparkles, color: '#FFDC80' },
])
</script>

<template>
  <DashboardLayout title="Instagram Workspace" subtitle="Brand Visuals & Community Growth">
    <div class="bento-grid">
      <!-- Row 1: Comprehensive Stat Deck -->
      <div class="col-span-12">
        <StatDeck :items="statItems" />
      </div>

      <!-- Row 2: Heatmap (Main) & AI Panel (Side) -->
      <div class="col-span-12 lg:col-span-8">
        <ChartCard 
          title="📅 Best Time to Post"
          subtitle="Engagement intensity heatmap"
          type="heatmap"
          :series="store.heatmapData"
          :height="350"
          :options="{
            dataLabels: { enabled: false },
            colors: ['#E4405F'],
            xaxis: {
              categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            plotOptions: {
              heatmap: {
                shadeIntensity: 0.5,
                radius: 4,
                colorScale: {
                  ranges: [
                    { from: 0, to: 0, color: '#1a1a25', name: 'None' },
                    { from: 1, to: 100, color: '#3d1f30', name: 'Low' },
                    { from: 101, to: 500, color: '#7a2d4a', name: 'Medium' },
                    { from: 501, to: 10000, color: '#E4405F', name: 'High' }
                  ]
                }
              }
            }
          }"
        />
      </div>

      <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <!-- AI Panel -->
        <div class="ai-section glass-card h-full">
          <div class="ai-section__header">
            <h3 class="ai-section__title">
              <Sparkles :size="18" class="text-purple" />
              Caption Refiner AI
            </h3>
            <p class="ai-section__desc">
              Generate caption templates based on top performing posts
            </p>
            <button 
              class="btn btn-primary w-full"
              :disabled="aiLoading || store.posts.length < 3"
              @click="generateCaptionSuggestions"
            >
              <Sparkles :size="16" />
              {{ aiLoading ? 'Analyzing...' : 'Generate Templates' }}
            </button>
          </div>

          <AIResponsePanel 
            title="Suggestions"
            :loading="aiLoading"
            :error="aiError"
            :content="aiSuggestions.length ? 'Generated' : null"
            @retry="generateCaptionSuggestions"
            class="flex-1 min-h-0"
          >
            <div v-if="aiSuggestions.length" class="suggestions-list">
              <div 
                v-for="(suggestion, idx) in aiSuggestions" 
                :key="idx"
                class="suggestion-item"
              >
                <div class="suggestion-item__header">
                  <span class="suggestion-item__badge">Template {{ idx + 1 }}</span>
                  <span class="suggestion-item__tone">{{ suggestion.tone }}</span>
                </div>
                <p class="suggestion-item__template">{{ suggestion.template }}</p>
              </div>
            </div>
          </AIResponsePanel>
        </div>
      </div>

      <!-- Row 3: Top Posts Gallery -->
      <div class="col-span-12">
        <h3 class="section-title mb-4">📸 Top Posts by Saves</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            v-for="post in store.topBySaves.slice(0, 4)" 
            :key="post.postId"
            class="post-card glass-card hover:scale-[1.02] transition-transform"
          >
            <div class="post-card__header">
              <span class="post-card__type">{{ post.postType || 'Post' }}</span>
              <a 
                v-if="post.permalink"
                :href="post.permalink" 
                target="_blank"
                class="post-card__link"
              >
                <ExternalLink :size="14" />
              </a>
            </div>
            
            <p class="post-card__caption">
              {{ truncateText(post.description, 80) }}
            </p>
            
            <div class="post-card__stats mt-auto">
              <div class="post-card__stat text-neon-purple">
                <Bookmark :size="14" />
                <span>{{ formatNumber(post.saves) }}</span>
              </div>
              <div class="post-card__stat">
                <Heart :size="14" />
                <span>{{ formatNumber(post.likes) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 4: Detailed Table -->
      <div class="col-span-12">
        <DataTable 
          :data="store.posts"
          :columns="[
            { key: 'postId', label: 'Post ID', sortable: true },
            { key: 'date', label: 'Date', sortable: true, type: 'date' },
            { key: 'description', label: 'Description', sortable: true, format: (val) => truncateText(val, 30) },
            { key: 'durationSec', label: 'Duration (s)', sortable: true, type: 'number' },
            { key: 'postType', label: 'Type', sortable: true },
            { key: 'accountUsername', label: 'Username', sortable: true },
            { key: 'views', label: 'Views', sortable: true, type: 'number' },
            { key: 'reach', label: 'Reach', sortable: true, type: 'number' },
            { key: 'likes', label: 'Likes', sortable: true, type: 'number' },
            { key: 'comments', label: 'Comments', sortable: true, type: 'number' },
            { key: 'shares', label: 'Shares', sortable: true, type: 'number' },
            { key: 'saves', label: 'Saves', sortable: true, type: 'number' },
            { key: 'follows', label: 'Follows', sortable: true, type: 'number' },
            { key: 'dataComment', label: 'Data Comment', sortable: true },
            { key: 'retentionRate', label: 'Retention (%)', sortable: true, format: (val) => val ? val + '%' : '-' },
            { key: 'permalink', label: 'Link', type: 'link' }
          ]"
          default-sort="date"
          :loading="store.loading"
        />
      </div>
    </div>
  </DashboardLayout>
</template>

<style scoped>
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  width: 100%;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
}

.post-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.post-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-card__type {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-instagram);
  font-weight: 600;
  letter-spacing: 0.5px;
}

.post-card__link {
  color: var(--color-text-muted);
  transition: color 0.2s;
}

.post-card__link:hover {
  color: var(--color-text-primary);
}

.post-card__caption {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0;
  flex: 1;
}

.post-card__stats {
  display: flex;
  gap: 16px;
}

.post-card__stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.empty-section {
  padding: 40px;
  text-align: center;
  color: var(--color-text-muted);
}

/* AI Section */
.ai-section {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.ai-section__header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ai-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.text-purple {
  color: var(--color-neon-purple);
}

.ai-section__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.suggestion-item {
  padding: 16px;
  background: var(--color-void-light);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-glass-border);
}

.suggestion-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.suggestion-item__badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-neon-purple);
}

.suggestion-item__tone {
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-glass);
  padding: 4px 8px;
  border-radius: 4px;
}

.suggestion-item__template {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .bento-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}
</style>
