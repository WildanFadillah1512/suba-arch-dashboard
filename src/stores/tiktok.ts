import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Papa from 'papaparse'
import type { TikTokVideo, TikTokMetrics, ScatterData } from '@/types'

export const useTikTokStore = defineStore('tiktok', () => {
  // State
  const videos = ref<TikTokVideo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed: Metrics
  const metrics = computed<TikTokMetrics>(() => {
    if (videos.value.length === 0) {
      return {
        totalPosts: 0,
        totalViews: 0,
        totalEngagement: 0,
        avgEngagementRate: 0,
        topPerformers: 0,
        avgWatchTime: 0,
        avgCompletionRate: 0,
        viralityScore: 0,
        totalNewFollowers: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalSaves: 0
      }
    }

    const totalViews = videos.value.reduce((sum, v) => sum + v.views, 0)
    const totalLikes = videos.value.reduce((sum, v) => sum + v.likes, 0)
    const totalComments = videos.value.reduce((sum, v) => sum + v.comments, 0)
    const totalShares = videos.value.reduce((sum, v) => sum + v.shares, 0)
    const totalSaves = videos.value.reduce((sum, v) => sum + v.saves, 0)
    const totalEngagement = totalLikes + totalComments + totalShares + totalSaves
    const totalNewFollowers = videos.value.reduce((sum, v) => sum + v.newFollowers, 0)

    const avgWatchTime = videos.value.reduce((sum, v) => sum + v.avgWatchTime, 0) / videos.value.length
    
    // Completion rate: avgWatchTime / duration * 100
    const completionRates = videos.value.map(v => v.duration > 0 ? (v.avgWatchTime / v.duration) * 100 : 0)
    const avgCompletionRate = completionRates.reduce((a, b) => a + b, 0) / completionRates.length

    // Virality score: (shares / views) * 1000
    const viralityScore = totalViews > 0 ? (totalShares / totalViews) * 1000 : 0

    // Top performers: videos with above average shares/views ratio
    const avgRatio = viralityScore / 1000
    const topPerformers = videos.value.filter(v => v.views > 0 && (v.shares / v.views) > avgRatio).length

    return {
      totalPosts: videos.value.length,
      totalViews,
      totalEngagement,
      avgEngagementRate: totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0,
      topPerformers,
      avgWatchTime,
      avgCompletionRate,
      viralityScore,
      totalNewFollowers,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves
    }
  })

  // Computed: Scatter plot data (duration vs completion rate)
  const scatterData = computed<ScatterData[]>(() => {
    return videos.value.map(v => ({
      x: v.duration,
      y: v.duration > 0 ? (v.avgWatchTime / v.duration) * 100 : 0,
      title: v.title
    }))
  })

  // Computed: Virality table (sorted by shares/views ratio)
  const viralityTable = computed(() => {
    return [...videos.value]
      .map(v => ({
        ...v,
        viralityRatio: v.views > 0 ? (v.shares / v.views) * 100 : 0
      }))
      .sort((a, b) => b.viralityRatio - a.viralityRatio)
      .slice(0, 20)
  })

  // Computed: Top videos by performance
  const topVideos = computed(() => {
    return [...videos.value].sort((a, b) => b.views - a.views).slice(0, 10)
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
            error.value = 'Failed to parse TikTok CSV'
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
      const parsed: TikTokVideo[] = data.map((row: any) => {
        // Parse dates safely with fallback
        const parseDate = (dateStr: string): Date => {
          if (!dateStr) return new Date()
          const parsed = new Date(dateStr)
          return isNaN(parsed.getTime()) ? new Date() : parsed
        }

        // Parse duration - could be in various formats
        let duration = 0
        const durationStr = row['Durasi'] || row['Duration'] || '0'
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

        return {
          title: row['Judul Video'] || row['Title'] || '',
          publishDate: parseDate(row['Tanggal Post'] || row['Publish Date']),
          duration,
          views: parseInt(row['Views']) || 0,
          likes: parseInt(row['Likes']) || 0,
          comments: parseInt(row['Comments']) || 0,
          shares: parseInt(row['Shares']) || 0,
          saves: parseInt(row['Saves']) || 0,
          totalPlayTime: parseInt(row['Total Play Time']) || 0,
          avgWatchTime: parseFloat(row['Avg Watch Time']) || 0,
          fullVideoWatched: parseFloat(row['Full Video']) || 0,
          newFollowers: parseInt(row['New Followers']) || 0,
          scrapeTime: parseDate(row['Waktu Scrape (tiktok)']),
          retentionRate: duration > 0 ? ((parseFloat(row['Avg Watch Time']) || 0) / duration) * 100 : 0
        }
      })

      videos.value = parsed
      loading.value = false
    } catch (e) {
      error.value = 'Failed to parse TikTok data'
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
    scatterData,
    viralityTable,
    topVideos,
    importCSV,
    importData,
    clearData
  }
})

