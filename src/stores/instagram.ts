import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Papa from 'papaparse'
import type { InstagramPost, InstagramMetrics } from '@/types'

export const useInstagramStore = defineStore('instagram', () => {
  // State
  const posts = ref<InstagramPost[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed: Metrics
  const metrics = computed<InstagramMetrics>(() => {
    if (posts.value.length === 0) {
      return {
        totalPosts: 0,
        totalViews: 0,
        totalEngagement: 0,
        avgEngagementRate: 0,
        topPerformers: 0,
        totalReach: 0,
        totalSaves: 0,
        avgSavesPerPost: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        totalFollows: 0,
        totalDurationSec: 0
      }
    }

    const totalViews = posts.value.reduce((sum, p) => sum + p.views, 0)
    const totalReach = posts.value.reduce((sum, p) => sum + p.reach, 0)
    const totalSaves = posts.value.reduce((sum, p) => sum + p.saves, 0)
    const totalLikes = posts.value.reduce((sum, p) => sum + p.likes, 0)
    const totalComments = posts.value.reduce((sum, p) => sum + p.comments, 0)
    const totalShares = posts.value.reduce((sum, p) => sum + p.shares, 0)
    const totalEngagement = totalLikes + totalComments + totalShares + totalSaves

    // Top performers: posts with saves above average
    const avgSaves = totalSaves / posts.value.length
    const topPerformers = posts.value.filter(p => p.saves > avgSaves).length

    return {
      totalPosts: posts.value.length,
      totalViews,
      totalEngagement,
      avgEngagementRate: totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0,
      topPerformers,
      totalReach,
      totalSaves,
      avgSavesPerPost: totalSaves / posts.value.length,
      totalLikes,
      totalComments,
      totalShares,
      totalFollows: posts.value.reduce((sum, p) => sum + p.follows, 0),
      totalDurationSec: posts.value.reduce((sum, p) => sum + p.durationSec, 0)
    }
  })

  // Computed: Top posts by saves
  const topBySaves = computed(() => {
    return [...posts.value].sort((a, b) => b.saves - a.saves).slice(0, 10)
  })

  // Computed: Heatmap data (hour vs day)
  const heatmapData = computed(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const data: { name: string; data: { x: string; y: number }[] }[] = []

    for (let hour = 0; hour < 24; hour++) {
      const hourData: { x: string; y: number }[] = []
      
      for (const day of days) {
        const postsInSlot = posts.value.filter(p => {
          const date = new Date(p.publishTime)
          return date.getHours() === hour && days[date.getDay()] === day
        })
        const engagement = postsInSlot.reduce((sum, p) => sum + p.likes + p.comments + p.saves, 0)
        hourData.push({ x: day, y: engagement })
      }
      
      data.push({ name: `${hour}:00`, data: hourData })
    }

    return data
  })

  // Action: Import CSV
  function importCSV(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      loading.value = true
      error.value = null

      Papa.parse(file as any, {
        header: true,
        skipEmptyLines: 'greedy', // Skip empty lines even inside quoted fields
        quoteChar: '"',
        escapeChar: '"',
        transformHeader: (header: string) => header.trim(), // Trim whitespace from headers
        complete: (results: any) => {
          try {
            importData(results.data)
            loading.value = false
            resolve()
          } catch (e) {
            error.value = 'Failed to parse Instagram CSV'
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
      const parsed: InstagramPost[] = data
        .filter((row: any) => row['Post ID'] && row['Post ID'].trim() !== '') // Filter out empty rows
        .map((row: any) => {
          // Parse dates safely with fallback
          const parseDate = (dateStr: string): Date => {
            if (!dateStr) return new Date()
            const parsed = new Date(dateStr)
            return isNaN(parsed.getTime()) ? new Date() : parsed
          }

          return {
            postId: row['Post ID'] || '',
            accountId: row['Account ID'] || '',
            accountUsername: row['Account username'] || '',
            accountName: row['Account name'] || '',
            description: row['Description'] || '',
            durationSec: parseInt(row['Duration (sec)']) || 0,
            publishTime: parseDate(row['Publish time']),
            permalink: row['Permalink'] || '',
            postType: row['Post type'] || '',
            dataComment: row['Data comment'] || '',
            date: parseDate(row['Date']),
            views: parseInt(row['Views']) || 0,
            reach: parseInt(row['Reach']) || 0,
            likes: parseInt(row['Likes']) || 0,
            shares: parseInt(row['Shares']) || 0,
            follows: parseInt(row['Follows']) || 0,
            comments: parseInt(row['Comments']) || 0,
            saves: parseInt(row['Saves']) || 0 // Fixed: use 'Saves' as per CSV format
          }
        })

      posts.value = parsed
      loading.value = false
    } catch (e) {
      error.value = 'Failed to parse Instagram data'
      loading.value = false
      throw e
    }
  }

  // Action: Clear data
  function clearData() {
    posts.value = []
    error.value = null
  }

  return {
    posts,
    loading,
    error,
    metrics,
    topBySaves,
    heatmapData,
    importCSV,
    importData,
    clearData
  }
})

