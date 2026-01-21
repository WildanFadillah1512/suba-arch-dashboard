import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'command-center',
      component: () => import('@/views/CommandCenter.vue'),
      meta: { title: 'Command Center' }
    },
    {
      path: '/instagram',
      name: 'instagram',
      component: () => import('@/views/InstagramWorkspace.vue'),
      meta: { title: 'Instagram Workspace' }
    },
    {
      path: '/tiktok',
      name: 'tiktok',
      component: () => import('@/views/TikTokWorkspace.vue'),
      meta: { title: 'TikTok Workspace' }
    },
    {
      path: '/youtube',
      name: 'youtube',
      component: () => import('@/views/YouTubeWorkspace.vue'),
      meta: { title: 'YouTube Workspace' }
    },
    {
      path: '/whatsapp',
      name: 'whatsapp',
      component: () => import('@/views/WhatsAppCRM.vue'),
      meta: { title: 'WhatsApp CRM' }
    }
  ]
})

// Update document title on route change
router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Dashboard'} | SUBA Analytics`
  next()
})

export default router

