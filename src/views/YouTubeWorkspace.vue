<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatDeck, { type StatItem } from '@/components/ui/StatDeck.vue'
import AIResponsePanel from '@/components/ui/AIResponsePanel.vue'
import { useYouTubeStore } from '@/stores/youtube'
import { repurposeContent } from '@/services/aiService'
import { 
  Eye, 
  MousePointer, 
  Clock, 
  Users,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MessageSquare
} from 'lucide-vue-next'
import type { RepurposedContent } from '@/types'

const store = useYouTubeStore()

// AI State
const aiLoading = ref(false)
const aiError = ref<string | null>(null)
const aiContent = ref<RepurposedContent | null>(null)
const selectedVideoIndex = ref(0)

async function generateRepurposedContent() {
  if (store.videos.length === 0) {
    aiError.value = 'No videos available to repurpose'
    return
  }

  const video = store.videos[selectedVideoIndex.value]
  if (!video) return

  aiLoading.value = true
  aiError.value = null

  try {
    aiContent.value = await repurposeContent(video)
  } catch (err) {
    aiError.value = 'Failed to generate content. Please try again.'
  } finally {
    aiLoading.value = false
  }
}

// Chart data
const thumbnailChartSeries = computed(() => [
  {
    name: 'Impressions',
    data: store.thumbnailPerformance.map(v => v.impressions)
  },
  {
    name: 'CTR %',
    data: store.thumbnailPerformance.map(v => v.ctr)
  }
])

const thumbnailCategories = computed(() => 
  store.thumbnailPerformance.map(v => v.title)
)

const loyaltyChartSeries = computed(() => [
  { name: 'New Viewers', data: store.loyaltyData.newViewers },
  { name: 'Returning Viewers', data: store.loyaltyData.returningViewers }
])

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const statItems = computed<StatItem[]>(() => [
  { label: 'Total Views', value: formatNumber(store.metrics.totalViews), icon: Eye, color: 'var(--color-youtube)' },
  { label: 'Total Engagement', value: formatNumber(store.metrics.totalEngagement), icon: TrendingUp, color: '#FF0000' },
  { label: 'Watch Time', value: formatNumber(store.metrics.totalWatchTimeHours) + 'h', icon: Clock, color: '#A855F7' },
  { label: 'Net Subscribers', value: (store.metrics.subscriberNetChange >= 0 ? '+' : '') + formatNumber(store.metrics.subscriberNetChange), icon: Users, color: '#22C55E', trend: store.metrics.subscriberNetChange >= 0 ? 'up' : 'down' },
  { label: 'Subs Gained', value: formatNumber(store.metrics.totalSubscribersGained), icon: Users, color: '#22C55E' },
  { label: 'Subs Lost', value: formatNumber(store.metrics.totalSubscribersLost), icon: TrendingDown, color: '#EF4444' },
  { label: 'Avg CTR', value: store.metrics.avgCTR.toFixed(2) + '%', icon: MousePointer, color: '#3B82F6' },
  { label: 'Avg Retention', value: store.metrics.avgRetention.toFixed(2) + '%', icon: Clock, color: '#F59E0B' },
  { label: 'Total Likes', value: formatNumber(store.metrics.totalLikes), icon: TrendingUp, color: '#FF0000' },
  { label: 'Total Dislikes', value: formatNumber(store.metrics.totalDislikes), icon: TrendingDown, color: '#EF4444' },
  { label: 'Total Shares', value: formatNumber(store.metrics.totalShares), icon: TrendingUp, color: '#3B82F6' },
  { label: 'Total Comments', value: formatNumber(store.metrics.totalComments), icon: MessageSquare, color: '#8B5CF6' },
  { label: 'Unique Viewers', value: formatNumber(store.metrics.totalUniqueViewers), icon: Users, color: '#EC4899' },
])
</script>

<template>
  <DashboardLayout title="YouTube Workspace" subtitle="Authority & SEO Deep Content">
    <div class="bento-grid">
      <!-- Row 1: Comprehensive Stat Deck -->
      <div class="col-span-12">
        <StatDeck :items="statItems" />
      </div>

      <!-- Row 2: Thumbnail Performance & AI Panel -->
      <div class="col-span-12 lg:col-span-8">
        <ChartCard 
          title="🖼️ Thumbnail Performance"
          subtitle="High impressions + Low CTR = Change thumbnail"
          type="bar"
          :series="thumbnailChartSeries"
          :height="350"
          :options="{
            chart: { stacked: false },
            xaxis: { 
              categories: thumbnailCategories,
              labels: { rotate: -45, style: { fontSize: '10px' } }
            },
            yaxis: [
              { title: { text: 'Impressions' } },
              { opposite: true, title: { text: 'CTR %' } }
            ],
            colors: ['#FF0000', '#00d4ff'],
            plotOptions: {
              bar: { columnWidth: '60%', borderRadius: 4 }
            }
          }"
        >
          <template #actions>
            <div class="thumbnail-legend">
              <span class="legend-item">
                <AlertTriangle :size="14" class="text-warning" />
                Needs improvement
              </span>
            </div>
          </template>
        </ChartCard>
      </div>

      <div class="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <div class="ai-section glass-card h-full">
          <div class="ai-section__header">
            <h3 class="ai-section__title">
              <Sparkles :size="18" class="text-youtube" />
              Content Repurposing AI
            </h3>
            <p class="ai-section__desc">
              Transform long-form YouTube content into TikTok scripts and blog articles
            </p>

            <!-- Video Selector -->
            <div v-if="store.videos.length" class="video-selector">
              <label>Select video to repurpose:</label>
              <select v-model="selectedVideoIndex" class="input">
                <option 
                  v-for="(video, idx) in store.videos.slice(0, 10)" 
                  :key="idx" 
                  :value="idx"
                >
                  {{ video.title.substring(0, 40) }}...
                </option>
              </select>
            </div>
            
            <button 
              class="btn btn-primary w-full"
              :disabled="aiLoading || store.videos.length === 0"
              @click="generateRepurposedContent"
            >
              <Sparkles :size="16" />
              {{ aiLoading ? 'Generating...' : 'Repurpose Content' }}
            </button>
          </div>

          <AIResponsePanel 
            title="Repurposed Content"
            :loading="aiLoading"
            :error="aiError"
            :content="aiContent ? 'Generated' : null"
            @retry="generateRepurposedContent"
            class="flex-1 min-h-0"
          >
            <div v-if="aiContent" class="repurposed-content">
              <!-- TikTok Scripts -->
              <div class="content-section">
                <h4>🎵 TikTok/Reels Scripts</h4>
                <div 
                  v-for="(script, idx) in aiContent.tiktokScripts" 
                  :key="idx"
                  class="script-card"
                >
                  <span class="script-badge">Script {{ idx + 1 }}</span>
                  <p>{{ script }}</p>
                </div>
              </div>

              <!-- Blog Article -->
              <div class="content-section">
                <h4>📝 Blog Article</h4>
                <div class="blog-preview">
                  {{ aiContent.blogArticle.substring(0, 500) }}...
                </div>
              </div>
            </div>
          </AIResponsePanel>
        </div>
      </div>

      <!-- Row 3: Audience Loyalty & Improvements -->
      <div class="col-span-12 lg:col-span-8">
        <ChartCard 
          title="👥 Audience Loyalty"
          subtitle="New vs Returning viewers over time"
          type="area"
          :series="loyaltyChartSeries"
          :height="280"
          :options="{
            xaxis: { categories: store.loyaltyData.categories },
            colors: ['#00d4ff', '#a855f7'],
            fill: {
              type: 'gradient',
              gradient: { opacityFrom: 0.4, opacityTo: 0.1 }
            }
          }"
        />
      </div>

      <div class="col-span-12 lg:col-span-4">
        <!-- Videos needing thumbnail improvement -->
        <div class="h-full glass-card p-4 flex flex-col" v-if="store.thumbnailPerformance.some(v => v.needsImprovement)">
          <h3 class="section-title flex items-center gap-2">
            <AlertTriangle :size="16" class="text-warning"/> 
            Fix Thumbnails
          </h3>
          <div class="improvement-grid flex-1 overflow-y-auto pr-2">
            <div 
              v-for="video in store.thumbnailPerformance.filter(v => v.needsImprovement)"
              :key="video.title"
              class="improvement-card glass-card mb-3 last:mb-0"
            >
              <div class="improvement-card__title">{{ video.title }}</div>
              <div class="improvement-card__stats">
                <div class="improvement-card__stat">
                  <span class="stat-label">Impressions</span>
                  <span class="stat-value good">{{ formatNumber(video.impressions) }}</span>
                </div>
                <div class="improvement-card__stat">
                  <span class="stat-label">CTR</span>
                  <span class="stat-value bad">{{ video.ctr.toFixed(2) }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Row 4: Detailed Table -->
      <div class="col-span-12">
        <DataTable 
          :data="store.videos"
          :columns="[
            { key: 'title', label: 'Title', sortable: true, format: (val) => val.length > 50 ? val.substring(0, 50) + '...' : val },
            { key: 'publishTime', label: 'Published', sortable: true, type: 'date' },
            { key: 'duration', label: 'Duration (s)', sortable: true, type: 'number' },
            { key: 'views', label: 'Views', sortable: true, type: 'number' },
            { key: 'watchTimeHours', label: 'Watch Time (h)', sortable: true, type: 'number' },
            { key: 'avgViewDuration', label: 'Avg Watch (s)', sortable: true, type: 'number', format: (val) => val.toFixed(0) },
            { key: 'avgPercentViewed', label: 'Avg % Viewed', sortable: true, type: 'percent' },
            { key: 'uniqueViewers', label: 'Unique Viewers', sortable: true, type: 'number' },
            { key: 'avgViewsPerViewer', label: 'Views/Viewer', sortable: true, type: 'number', format: (val) => val.toFixed(2) },
            { key: 'newViewers', label: 'New Viewers', sortable: true, type: 'number' },
            { key: 'returningViewers', label: 'Returning', sortable: true, type: 'number' },
            { key: 'subscribersGained', label: 'Subs (+)', sortable: true, type: 'number' },
            { key: 'subscribersLost', label: 'Subs (-)', sortable: true, type: 'number' },
            { key: 'likes', label: 'Likes', sortable: true, type: 'number' },
            { key: 'dislikes', label: 'Dislikes', sortable: true, type: 'number' },
            { key: 'likePercentage', label: 'Like Ratio', sortable: true, type: 'percent' },
            { key: 'shares', label: 'Shares', sortable: true, type: 'number' },
            { key: 'commentsAdded', label: 'Comments', sortable: true, type: 'number' },
            { key: 'impressions', label: 'Impressions', sortable: true, type: 'number' },
            { key: 'impressionsCTR', label: 'CTR (%)', sortable: true, type: 'percent' },
            { key: 'retentionRate', label: 'Retention (%)', sortable: true, type: 'percent' },
            { key: 'premiumViews', label: 'Premium Views', sortable: true, type: 'number' },
            { key: 'remixCount', label: 'Remixes', sortable: true, type: 'number' },
            { key: 'hypePoints', label: 'Hype Points', sortable: true, type: 'number' },
            { key: 'link', label: 'Link', type: 'link' }
          ]"
          default-sort="views"
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

.text-youtube {
  color: var(--color-youtube);
}

.ai-section__desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.video-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.video-selector label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.video-selector select {
  width: 100%;
}

.repurposed-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
  overflow-y: auto;
  padding-right: 4px;
}

.content-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.script-card {
  padding: 12px;
  background: var(--color-void-light);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-glass-border);
  margin-bottom: 8px;
}

.script-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-tiktok);
  margin-bottom: 8px;
}

.script-card p {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0;
}

.blog-preview {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  padding: 12px;
  background: var(--color-void-light);
  border-radius: var(--radius-button);
  border: 1px solid var(--color-glass-border);
}

/* Improvement Cards */
.improvement-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.improvement-card {
  padding: 12px;
}

.improvement-card__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.improvement-card__stats {
  display: flex;
  gap: 16px;
}

.improvement-card__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 10px;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
}

.stat-value.good { color: var(--color-neon-green); }
.stat-value.bad { color: var(--color-neon-orange); }

/* Responsive */
@media (max-width: 1024px) {
  .bento-grid {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}
</style>
