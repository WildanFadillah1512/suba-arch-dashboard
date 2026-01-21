// ===== Instagram Types =====
export interface InstagramPost {
  postId: string
  accountId: string
  accountUsername: string
  accountName: string
  description: string
  durationSec: number
  publishTime: Date
  permalink: string
  postType: string
  dataComment: string
  date: Date
  views: number
  reach: number
  likes: number
  shares: number
  follows: number
  comments: number
  saves: number
  retentionRate?: number
}

// ===== TikTok Types =====
export interface TikTokVideo {
  title: string
  publishDate: Date
  duration: number // seconds
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  totalPlayTime: number // seconds
  avgWatchTime: number // seconds
  fullVideoWatched: number // percentage or count
  newFollowers: number
  scrapeTime: Date
  retentionRate: number
  link?: string
}

// ===== YouTube Types =====
export interface YouTubeVideo {
  title: string
  publishTime: Date
  duration: number // seconds
  avgViewDuration: number // seconds
  avgPercentViewed: number
  uniqueViewers: number
  avgViewsPerViewer: number
  newViewers: number
  returningViewers: number
  hypePoints: number
  subscribersGained: number
  subscribersLost: number
  likes: number
  dislikes: number
  likePercentage: number
  shares: number
  commentsAdded: number
  premiumViews: number
  remixCount: number
  endScreenClicks: number
  views: number
  watchTimeHours: number
  subscribers: number
  impressions: number
  impressionsCTR: number
  retentionRate: number
  link?: string
}

// ===== WhatsApp CRM Types =====
export interface WhatsAppLead {
  id: string
  time: Date
  day: string
  name: string
  phone: string
  domicile: string
  service: string
  source: string
  level: 'cold' | 'warm' | 'hot'
  status: 'new' | 'contacted' | 'meeting' | 'closing' | 'lost'
  link: string
  chat: string
  // AI-generated fields
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative' | 'urgent'
  nextAction?: string
}

export type KanbanColumn = 'new' | 'contacted' | 'meeting' | 'closing'

export interface KanbanState {
  new: WhatsAppLead[]
  contacted: WhatsAppLead[]
  meeting: WhatsAppLead[]
  closing: WhatsAppLead[]
}

// ===== Dashboard Metrics Types =====
export interface PlatformMetrics {
  totalPosts: number
  totalViews: number
  totalEngagement: number
  avgEngagementRate: number
  topPerformers: number
}

export interface InstagramMetrics extends PlatformMetrics {
  totalReach: number
  totalSaves: number
  avgSavesPerPost: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalFollows: number
  totalDurationSec: number
}

export interface TikTokMetrics extends PlatformMetrics {
  avgWatchTime: number
  avgCompletionRate: number
  viralityScore: number
  totalNewFollowers: number
  totalLikes: number
  totalComments: number
  totalShares: number
  totalSaves: number
}

export interface YouTubeMetrics extends PlatformMetrics {
  avgCTR: number
  avgRetention: number
  totalWatchTimeHours: number
  subscriberNetChange: number
  newVsReturningRatio: number
  totalLikes: number
  totalDislikes: number
  totalShares: number
  totalComments: number
  totalSubscribersGained: number
  totalSubscribersLost: number
  totalUniqueViewers: number
}

export interface WhatsAppMetrics {
  totalLeads: number
  leadsBySource: Record<string, number>
  leadsByLevel: Record<string, number>
  leadsByStatus: Record<string, number>
  conversionRate: number
  avgResponseTime: number
}

// ===== AI Response Types =====
export interface AIResponse {
  loading: boolean
  error: string | null
  content: string | null
}

export interface CaptionSuggestion {
  template: string
  explanation: string
  tone: string
}

export interface HookIdea {
  title: string
  hook: string
  explanation: string
}

export interface RepurposedContent {
  tiktokScripts: string[]
  blogArticle: string
}

export interface LeadSummary {
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent'
  nextAction: string
  keyPoints: string[]
}

// ===== Chart Data Types =====
export interface ChartDataPoint {
  x: string | number | Date
  y: number
}

export interface HeatmapData {
  name: string
  data: { x: string; y: number }[]
}

export interface ScatterData {
  x: number
  y: number
  title?: string
}

// ===== Import Types =====
export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'whatsapp'

export interface ImportResult {
  success: boolean
  platform: Platform
  count: number
  errors: string[]
}
