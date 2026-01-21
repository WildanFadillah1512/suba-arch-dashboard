import Groq from 'groq-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type {
  CaptionSuggestion,
  HookIdea,
  RepurposedContent,
  LeadSummary,
  InstagramPost,
  TikTokVideo,
  YouTubeVideo
} from '@/types'

// --- Configuration ---
// Load API keys from environment variables
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// Warn if API keys are missing
if (!GROQ_API_KEY) console.warn('[AI] VITE_GROQ_API_KEY is not set in .env')
if (!GEMINI_API_KEY) console.warn('[AI] VITE_GEMINI_API_KEY is not set in .env')

// Initialize Clients
const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" })

const META_MODEL = 'llama3-70b-8192'

// --- Mock Fallbacks (Safety Net) ---
// These are used if BOTH AI services fail
function getMockCaptions(): CaptionSuggestion[] {
  return [
    { template: "🔥 [TOPIC] is changing everything! Here's why...", explanation: "Curiosity gap", tone: "Excited" },
    { template: "Stop doing [MISTAKE]. Try this instead 👇", explanation: "Negative hook", tone: "Authoritative" },
    { template: "Save this for later! 📌 Guide to [TOPIC]", explanation: "Saveable content", tone: "Helpful" }
  ]
}

function getMockHooks(): HookIdea[] {
  return [
    { title: "The Secret to [RESULT]", hook: "You've been doing this wrong...", explanation: "Challenges belief" },
    { title: "Fastest Way to [GOAL]", hook: "If you want [RESULT], watch this...", explanation: "Direct benefit" },
    { title: "My Biggest Mistake", hook: "I wish I knew this sooner...", explanation: "Personal story" }
  ]
}

function getMockRepurposed(): RepurposedContent {
  return {
    tiktokScripts: ["Hook: Did you know... \nBody: ... \nCTA: Follow!"],
    blogArticle: "## Ultimate Guide\n\nContent generation failed. Please try again."
  }
}

function getMockLeadSummary(): LeadSummary {
  return {
    summary: "Could not generate summary. Please check connection.",
    sentiment: "neutral",
    nextAction: "Review manually",
    keyPoints: []
  }
}

// --- Dual Model Execution Logic ---

async function executeWithFallback<T>(
  groqFn: () => Promise<T>,
  geminiFn: () => Promise<T>,
  fallbackFn: () => T,
  serviceName: string
): Promise<T> {
  // 1. Try Groq (Primary)
  try {
    // console.log(`[AI] Trying Groq for ${serviceName}...`)
    return await groqFn()
  } catch (groqError) {
    console.warn(`[AI] Groq failed for ${serviceName}. Switching to Gemini...`, groqError)
    
    // 2. Try Gemini (Secondary)
    try {
      return await geminiFn()
    } catch (geminiError) {
      console.error(`[AI] Gemini also failed for ${serviceName}. Using fallback.`, geminiError)
      
      // 3. Return Mock
      return fallbackFn()
    }
  }
}

// --- Specific Implementations ---

export async function refineCaptions(posts: InstagramPost[]): Promise<CaptionSuggestion[]> {
  const topPosts = posts.sort((a, b) => b.saves - a.saves).slice(0, 5)
  const context = JSON.stringify(topPosts.map(p => ({ desc: p.description, saves: p.saves })), null, 2)
  
  const systemPrompt = `Analyze these successful Instagram captions:\n${context}\n\nCreate 3 new caption templates based on their patterns. Return ONLY a JSON array: [{"template": "...", "explanation": "...", "tone": "..."}]`

  return executeWithFallback(
    // Groq
    async () => {
      const resp = await groq.chat.completions.create({
        model: META_MODEL,
        messages: [{ role: 'user', content: systemPrompt }],
        max_tokens: 1500
      })
      const content = resp.choices[0]?.message?.content || '[]'
      const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1)
      return JSON.parse(jsonStr)
    },
    // Gemini
    async () => {
      const result = await geminiModel.generateContent(systemPrompt)
      const text = result.response.text()
      const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1)
      return JSON.parse(jsonStr)
    },
    getMockCaptions,
    'refineCaptions'
  )
}

export async function generateHooks(videos: TikTokVideo[]): Promise<HookIdea[]> {
  const topVideos = videos.slice(0, 5)
  const context = JSON.stringify(topVideos.map(v => ({ title: v.title, shares: v.shares })), null, 2)
  
  const systemPrompt = `You are a viral TikTok strategist. Analyze these top videos:\n${context}\n\nGenerate 10 viral hook ideas. Return ONLY a JSON array: [{"title": "...", "hook": "...", "explanation": "..."}]`

  return executeWithFallback(
    async () => {
      const resp = await groq.chat.completions.create({
        model: META_MODEL,
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.8
      })
      const content = resp.choices[0]?.message?.content || '[]'
      const jsonStr = content.substring(content.indexOf('['), content.lastIndexOf(']') + 1)
      return JSON.parse(jsonStr)
    },
    async () => {
      const result = await geminiModel.generateContent(systemPrompt)
      const text = result.response.text()
      const jsonStr = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1)
      return JSON.parse(jsonStr)
    },
    getMockHooks,
    'generateHooks'
  )
}

export async function repurposeContent(video: YouTubeVideo): Promise<RepurposedContent> {
  const systemPrompt = `Repurpose this YouTube video:\nTitle: ${video.title}\nStats: ${video.views} views, ${video.watchTimeHours}h watch time.\n\nCreate:\n1. 3 TikTok scripts\n2. 1 Blog Post\n\nReturn ONLY JSON: {"tiktokScripts": ["..."], "blogArticle": "..."}`

  return executeWithFallback(
    async () => {
      const resp = await groq.chat.completions.create({ model: META_MODEL, messages: [{ role: 'user', content: systemPrompt }] })
      const content = resp.choices[0]?.message?.content || '{}'
      const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1)
      return JSON.parse(jsonStr)
    },
    async () => {
      const result = await geminiModel.generateContent(systemPrompt)
      const text = result.response.text()
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
      return JSON.parse(jsonStr)
    },
    getMockRepurposed,
    'repurposeContent'
  )
}

export async function summarizeLead(chatContent: string, leadName: string): Promise<LeadSummary> {
  const systemPrompt = `Analyze this WhatsApp chat with lead "${leadName}":\n${chatContent}\n\nReturn ONLY JSON: {"summary": "...", "sentiment": "...", "nextAction": "...", "keyPoints": []}`

  return executeWithFallback(
    async () => {
      const resp = await groq.chat.completions.create({ model: META_MODEL, messages: [{ role: 'user', content: systemPrompt }] })
      const content = resp.choices[0]?.message?.content || '{}'
      const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1)
      return JSON.parse(jsonStr)
    },
    async () => {
      const result = await geminiModel.generateContent(systemPrompt)
      const text = result.response.text()
      const jsonStr = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1)
      return JSON.parse(jsonStr)
    },
    getMockLeadSummary,
    'summarizeLead'
  )
}
