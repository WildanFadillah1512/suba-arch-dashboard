<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Instagram,
  Music2,
  Youtube,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'

interface NavItem {
  name: string
  path: string
  icon: any
  color: string
}

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle'): void
}>()

const route = useRoute()

const navItems: NavItem[] = [
  { name: 'Command Center', path: '/', icon: LayoutDashboard, color: 'var(--color-neon-blue)' },
  { name: 'Instagram', path: '/instagram', icon: Instagram, color: 'var(--color-instagram)' },
  { name: 'TikTok', path: '/tiktok', icon: Music2, color: 'var(--color-tiktok)' },
  { name: 'YouTube', path: '/youtube', icon: Youtube, color: 'var(--color-youtube)' },
  { name: 'WhatsApp CRM', path: '/whatsapp', icon: MessageCircle, color: 'var(--color-whatsapp)' }
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <aside 
    class="sidebar"
    :class="{ 'sidebar--collapsed': collapsed }"
  >
    <!-- Logo -->
    <div class="sidebar__logo">
      <div class="sidebar__logo-icon">
        <span class="logo-text">S</span>
      </div>
      <span v-if="!collapsed" class="sidebar__logo-name">SUBA</span>
    </div>

    <!-- Navigation -->
    <nav class="sidebar__nav">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="sidebar__link"
        :class="{ 'sidebar__link--active': isActive(item.path) }"
        :style="isActive(item.path) ? { '--active-color': item.color } : {}"
      >
        <component 
          :is="item.icon" 
          :size="20"
          :style="{ color: isActive(item.path) ? item.color : 'var(--color-text-secondary)' }"
        />
        <span v-if="!collapsed" class="sidebar__link-text">{{ item.name }}</span>
        <div 
          v-if="isActive(item.path)" 
          class="sidebar__link-indicator"
          :style="{ background: item.color }"
        />
      </router-link>
    </nav>

    <!-- Collapse Toggle -->
    <button class="sidebar__toggle" @click="emit('toggle')">
      <ChevronLeft v-if="!collapsed" :size="18" />
      <ChevronRight v-else :size="18" />
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--spacing-sidebar);
  background: var(--color-void-light);
  border-right: 1px solid var(--color-glass-border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  transition: width 0.3s ease;
  z-index: 100;
}

.sidebar--collapsed {
  width: var(--spacing-sidebar-collapsed);
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  margin-bottom: 40px;
}

.sidebar__logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-neon-blue), var(--color-neon-purple));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.sidebar__logo-name {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-neon-blue), var(--color-neon-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

.sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-button);
  text-decoration: none;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.sidebar__link:hover {
  background: var(--color-glass);
  color: var(--color-text-primary);
}

.sidebar__link--active {
  background: var(--color-glass);
  color: var(--color-text-primary);
}

.sidebar__link-text {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.sidebar__link-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  border-radius: 0 4px 4px 0;
}

.sidebar__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-glass);
  border: 1px solid var(--color-glass-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  margin: 0 auto;
  transition: all 0.2s ease;
}

.sidebar__toggle:hover {
  background: var(--color-glass-hover);
  color: var(--color-text-primary);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .sidebar {
    width: var(--spacing-sidebar-collapsed);
  }
  
  .sidebar__logo-name,
  .sidebar__link-text {
    display: none;
  }
}
</style>
