<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import MetricCard from '@/components/ui/MetricCard.vue'
import ChartCard from '@/components/ui/ChartCard.vue'
import { useInstagramStore } from '@/stores/instagram'
import { useTikTokStore } from '@/stores/tiktok'
import { useYouTubeStore } from '@/stores/youtube'
import { useWhatsAppStore } from '@/stores/whatsapp'
import { 
  Eye, 
  Heart, 
  Users, 
  TrendingUp, 
  Instagram, 
  Music2, 
  Youtube, 
  MessageCircle 
} from 'lucide-vue-next'
import { computed } from 'vue'

const instagramStore = useInstagramStore()
const tiktokStore = useTikTokStore()
const youtubeStore = useYouTubeStore()
const whatsappStore = useWhatsAppStore()

// Aggregate metrics
const totalViews = computed(() => {
  return instagramStore.metrics.totalViews + 
         tiktokStore.metrics.totalViews + 
         youtubeStore.metrics.totalViews
})

const totalEngagement = computed(() => {
  return instagramStore.metrics.totalEngagement + 
         tiktokStore.metrics.totalEngagement + 
         youtubeStore.metrics.totalEngagement
})

const totalFollowers = computed(() => {
  return tiktokStore.metrics.totalNewFollowers + 
         youtubeStore.metrics.subscriberNetChange
})

const totalLeads = computed(() => whatsappStore.metrics.totalLeads)

// Platform breakdown for chart
const platformBreakdown = computed(() => [
  { name: 'Instagram', data: [instagramStore.metrics.totalViews] },
  { name: 'TikTok', data: [tiktokStore.metrics.totalViews] },
  { name: 'YouTube', data: [youtubeStore.metrics.totalViews] }
])

// Engagement trend (mock data for now - would come from historical data)
const engagementTrend = computed(() => [
  {
    name: 'Engagement',
    data: [320, 450, 380, 520, 610, 580, 720]
  }
])

const engagementCategories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Platform stats cards
const platformStats = computed(() => [
  { 
    name: 'Instagram', 
    icon: Instagram, 
    color: 'var(--color-instagram)',
    posts: instagramStore.metrics.totalPosts,
    views: instagramStore.metrics.totalViews,
    engagement: instagramStore.metrics.avgEngagementRate.toFixed(1) + '%'
  },
  { 
    name: 'TikTok', 
    icon: Music2, 
    color: 'var(--color-tiktok)',
    posts: tiktokStore.metrics.totalPosts,
    views: tiktokStore.metrics.totalViews,
    engagement: tiktokStore.metrics.avgEngagementRate.toFixed(1) + '%'
  },
  { 
    name: 'YouTube', 
    icon: Youtube, 
    color: 'var(--color-youtube)',
    posts: youtubeStore.metrics.totalPosts,
    views: youtubeStore.metrics.totalViews,
    engagement: youtubeStore.metrics.avgEngagementRate.toFixed(1) + '%'
  },
  { 
    name: 'WhatsApp', 
    icon: MessageCircle, 
    color: 'var(--color-whatsapp)',
    posts: whatsappStore.metrics.totalLeads,
    views: '-',
    engagement: whatsappStore.metrics.conversionRate.toFixed(1) + '%'
  }
])

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}
</script>

<template>
  <DashboardLayout title="Command Center" subtitle="Global overview across all platforms">
    <!-- Hero Metrics -->
    <div class="metrics-grid">
      <MetricCard 
        title="Total Views" 
        :value="formatNumber(totalViews)"
        :icon="Eye"
        color="var(--color-neon-blue)"
        trend="up"
        trend-value="+12.5%"
        subtitle="Across all platforms"
      />
      <MetricCard 
        title="Total Engagement" 
        :value="formatNumber(totalEngagement)"
        :icon="Heart"
        color="var(--color-neon-pink)"
        trend="up"
        trend-value="+8.3%"
        subtitle="Likes, comments, shares, saves"
      />
      <MetricCard 
        title="New Followers" 
        :value="formatNumber(totalFollowers)"
        :icon="Users"
        color="var(--color-neon-purple)"
        trend="up"
        trend-value="+15.2%"
        subtitle="From TikTok & YouTube"
      />
      <MetricCard 
        title="Active Leads" 
        :value="totalLeads.toString()"
        :icon="TrendingUp"
        color="var(--color-neon-green)"
        trend="neutral"
        trend-value="0%"
        subtitle="WhatsApp CRM"
      />
    </div>

    <!-- Charts Row -->
    <div class="charts-grid">
      <ChartCard 
        title="Engagement Trend"
        subtitle="Last 7 days"
        type="area"
        :series="engagementTrend"
        :height="280"
        :options="{
          xaxis: { categories: engagementCategories }
        }"
      />

      <ChartCard 
        title="Platform Distribution"
        subtitle="Views by platform"
        type="donut"
        :series="[
          instagramStore.metrics.totalViews || 1,
          tiktokStore.metrics.totalViews || 1,
          youtubeStore.metrics.totalViews || 1
        ]"
        :height="280"
        :options="{
          labels: ['Instagram', 'TikTok', 'YouTube'],
          colors: ['#E4405F', '#00f2ea', '#FF0000'],
          plotOptions: {
            pie: {
              donut: {
                size: '70%',
                labels: {
                  show: true,
                  total: {
                    show: true,
                    label: 'Total',
                    color: '#94a3b8'
                  }
                }
              }
            }
          }
        }"
      />
    </div>

    <!-- Platform Cards -->
    <div class="platform-cards">
      <h3 class="section-title">Platform Overview</h3>
      <div class="platform-cards__grid">
        <router-link 
          v-for="platform in platformStats" 
          :key="platform.name"
          :to="`/${platform.name.toLowerCase()}`"
          class="platform-card glass-card"
        >
          <div class="platform-card__header">
            <div 
              class="platform-card__icon"
              :style="{ background: `${platform.color}20`, color: platform.color }"
            >
              <component :is="platform.icon" :size="24" />
            </div>
            <span class="platform-card__name">{{ platform.name }}</span>
          </div>
          
          <div class="platform-card__stats">
            <div class="platform-card__stat">
              <span class="platform-card__stat-value">{{ platform.posts }}</span>
              <span class="platform-card__stat-label">{{ platform.name === 'WhatsApp' ? 'Leads' : 'Posts' }}</span>
            </div>
            <div class="platform-card__stat">
              <span class="platform-card__stat-value">{{ typeof platform.views === 'number' ? formatNumber(platform.views) : platform.views }}</span>
              <span class="platform-card__stat-label">Views</span>
            </div>
            <div class="platform-card__stat">
              <span class="platform-card__stat-value">{{ platform.engagement }}</span>
              <span class="platform-card__stat-label">{{ platform.name === 'WhatsApp' ? 'Conv. Rate' : 'Eng. Rate' }}</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="totalViews === 0" class="empty-state glass-card">
      <div class="empty-state__icon">📊</div>
      <h3>No Data Yet</h3>
      <p>Import your first CSV to see analytics across all platforms</p>
      <p class="empty-state__hint">Click "Import Data" button in the header to get started</p>
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

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--color-text-primary);
}

.platform-cards__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.platform-card {
  padding: 20px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.platform-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.platform-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.platform-card__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.platform-card__stats {
  display: flex;
  justify-content: space-between;
}

.platform-card__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.platform-card__stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.platform-card__stat-label {
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.empty-state {
  padding: 60px 40px;
  text-align: center;
  margin-top: 24px;
}

.empty-state__icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  margin: 0 0 8px 0;
  color: var(--color-text-primary);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin: 0;
}

.empty-state__hint {
  margin-top: 16px !important;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* Responsive */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .platform-cards__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-grid,
  .charts-grid,
  .platform-cards__grid {
    grid-template-columns: 1fr;
  }
}
</style>
