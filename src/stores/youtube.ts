import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Papa from 'papaparse'
import type { YouTubeVideo, YouTubeMetrics } from '@/types'

export const useYouTubeStore = defineStore('youtube', () => {
  // State
  const videos = ref<YouTubeVideo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed: Metrics
  const metrics = computed<YouTubeMetrics>(() => {
    if (videos.value.length === 0) {
      return {
        totalPosts: 0,
        totalViews: 0,
        totalEngagement: 0,
        avgEngagementRate: 0,
        topPerformers: 0,
        avgCTR: 0,
        avgRetention: 0,
        totalWatchTimeHours: 0,
        subscriberNetChange: 0,
        newVsReturningRatio: 0,
        totalLikes: 0,
        totalDislikes: 0,
        totalShares: 0,
        totalComments: 0,
        totalSubscribersGained: 0,
        totalSubscribersLost: 0,
        totalUniqueViewers: 0
      }
    }

    const totalViews = videos.value.reduce((sum, v) => sum + v.views, 0)
    const totalLikes = videos.value.reduce((sum, v) => sum + v.likes, 0)
    const totalDislikes = videos.value.reduce((sum, v) => sum + v.dislikes, 0)
    const totalComments = videos.value.reduce((sum, v) => sum + v.commentsAdded, 0)
    const totalShares = videos.value.reduce((sum, v) => sum + v.shares, 0)
    const totalEngagement = totalLikes + totalComments + totalShares
    const totalWatchTimeHours = videos.value.reduce((sum, v) => sum + v.watchTimeHours, 0)

    const avgCTR = videos.value.reduce((sum, v) => sum + v.impressionsCTR, 0) / videos.value.length
    const avgRetention = videos.value.reduce((sum, v) => sum + v.avgPercentViewed, 0) / videos.value.length

    const totalSubscribersGained = videos.value.reduce((sum, v) => sum + v.subscribersGained, 0)
    const totalSubscribersLost = videos.value.reduce((sum, v) => sum + v.subscribersLost, 0)
    const totalUniqueViewers = videos.value.reduce((sum, v) => sum + v.uniqueViewers, 0)

    const totalNewViewers = videos.value.reduce((sum, v) => sum + v.newViewers, 0)
    const totalReturningViewers = videos.value.reduce((sum, v) => sum + v.returningViewers, 0)

    // Top performers: CTR above average
    const topPerformers = videos.value.filter(v => v.impressionsCTR > avgCTR).length

    return {
      totalPosts: videos.value.length,
      totalViews,
      totalEngagement,
      avgEngagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
      topPerformers,
      avgCTR,
      avgRetention,
      totalWatchTimeHours,
      subscriberNetChange: totalSubscribersGained - totalSubscribersLost,
      newVsReturningRatio: totalReturningViewers > 0 ? totalNewViewers / totalReturningViewers : 0,
      totalLikes,
      totalDislikes,
      totalShares,
      totalComments,
      totalSubscribersGained,
      totalSubscribersLost,
      totalUniqueViewers
    }
  })

  // Computed: Thumbnail performance (impressions vs CTR)
  const thumbnailPerformance = computed(() => {
    return [...videos.value]
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 15)
      .map(v => ({
        title: v.title.length > 30 ? v.title.substring(0, 30) + '...' : v.title,
        impressions: v.impressions,
        ctr: v.impressionsCTR,
        needsImprovement: v.impressions > 1000 && v.impressionsCTR < 5
      }))
  })

  // Computed: Loyalty data (new vs returning viewers over time)
  const loyaltyData = computed(() => {
    const sorted = [...videos.value].sort((a, b) => 
      new Date(a.publishTime).getTime() - new Date(b.publishTime).getTime()
    )

    return {
      categories: sorted.map(v => {
        const date = new Date(v.publishTime)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      newViewers: sorted.map(v => v.newViewers),
      returningViewers: sorted.map(v => v.returningViewers)
    }
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
            error.value = 'Failed to parse YouTube CSV'
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
      const parsed: YouTubeVideo[] = data.map((row: any) => {
        // Parse dates safely with fallback
        const parseDate = (dateStr: string): Date => {
          if (!dateStr) return new Date()
          const parsed = new Date(dateStr)
          return isNaN(parsed.getTime()) ? new Date() : parsed
        }

        // Parse duration
        let duration = 0
        const durationStr = row['Duration'] || '0'
        if (typeof durationStr === 'string' && durationStr.includes(':')) {
          const parts = durationStr.split(':').map(Number)
          if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
            duration = parts[0] * 60 + parts[1]
          } else if (parts.length === 3 && parts[0] !== undefined && parts[1] !== undefined && parts[2] !== undefined) {
            duration = parts[0] * 3600 + parts[1] * 60 + parts[2]
          }
        } else {
          duration = parseInt(durationStr) || 0
        }

        // Parse avg view duration similarly
        let avgViewDuration = 0
        const avgDurStr = row['Average view duration'] || '0'
        if (typeof avgDurStr === 'string' && avgDurStr.includes(':')) {
          const parts = avgDurStr.split(':').map(Number)
          if (parts.length === 2 && parts[0] !== undefined && parts[1] !== undefined) {
            avgViewDuration = parts[0] * 60 + parts[1]
          } else if (parts.length === 3 && parts[0] !== undefined && parts[1] !== undefined && parts[2] !== undefined) {
            avgViewDuration = parts[0] * 3600 + parts[1] * 60 + parts[2]
          }
        } else {
          avgViewDuration = parseInt(avgDurStr) || 0
        }

        // Get views and watch time for calculations
        const views = parseInt(row['Views']) || 0
        const watchTimeHours = parseFloat(row['Watch time (hours)']) || 0
        
        // Calculate avg watch time: watch time (in seconds) / views
        const avgWatchTimeSeconds = views > 0 ? (watchTimeHours * 3600) / views : 0
        
        // Calculate retention rate: (avg watch time / duration) * 100
        const calculatedRetentionRate = duration > 0 ? (avgWatchTimeSeconds / duration) * 100 : 0
        
        return {
          title: row['Video title'] || '',
          publishTime: parseDate(row['Video publish time']),
          duration,
          avgViewDuration: avgWatchTimeSeconds, // Store calculated avg watch time
          avgPercentViewed: parseFloat(row['Average percentage viewed (%)']) || 0,
          uniqueViewers: parseInt(row['Unique viewers']) || 0,
          avgViewsPerViewer: parseFloat(row['Average views per viewer']) || 0,
          newViewers: parseInt(row['New viewers']) || 0,
          returningViewers: parseInt(row['Returning viewers']) || 0,
          hypePoints: parseInt(row['Hype points']) || 0,
          subscribersGained: parseInt(row['Subscribers gained']) || 0,
          subscribersLost: parseInt(row['Subscribers lost']) || 0,
          likes: parseInt(row['Likes']) || 0,
          dislikes: parseInt(row['Dislikes']) || 0,
          likePercentage: parseFloat(row['Likes (vs. dislikes) (%)']) || 0,
          shares: parseInt(row['Shares']) || 0,
          commentsAdded: parseInt(row['Comments added']) || 0,
          premiumViews: parseInt(row['YouTube Premium views']) || 0,
          remixCount: parseInt(row['Remix count']) || 0,
          endScreenClicks: parseInt(row['End screen element clicks']) || 0,
          views,
          watchTimeHours,
          subscribers: parseInt(row['Subscribers']) || 0,
          impressions: parseInt(row['Impressions']) || 0,
          impressionsCTR: parseFloat(row['Impressions click-through rate (%) (yt)']) || 0,
          retentionRate: calculatedRetentionRate, // Use calculated retention rate
          link: row['Video URL'] || row['URL'] || ''
        }
      })

      videos.value = parsed
      loading.value = false
    } catch (e) {
      error.value = 'Failed to parse YouTube data'
      loading.value = false
      throw e
    }
  }

  // Action: Clear data
  function clearData() {
    videos.value = []
    error.value = null
  }

  return {
    videos,
    loading,
    error,
    metrics,
    thumbnailPerformance,
    loyaltyData,
    importCSV,
    importData,
    clearData
  }
})

