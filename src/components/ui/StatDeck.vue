<script setup lang="ts">
import { type Component, ref, onMounted, onUnmounted } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

export interface StatItem {
  label: string
  value: string | number
  icon?: Component
  color?: string
  trend?: 'up' | 'down' | 'neutral'
  subtext?: string
}

defineProps<{
  items: StatItem[]
}>()

const deckRef = ref<HTMLElement | null>(null)
const showLeftArrow = ref(false)
const showRightArrow = ref(true)

function scroll(direction: 'left' | 'right') {
  if (!deckRef.value) return
  
  const scrollAmount = 300
  const currentScroll = deckRef.value.scrollLeft
  
  deckRef.value.scrollTo({
    left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
    behavior: 'smooth'
  })
}

function checkScroll() {
  if (!deckRef.value) return
  
  const { scrollLeft, scrollWidth, clientWidth } = deckRef.value
  showLeftArrow.value = scrollLeft > 0
  // Allow a small buffer (1px) for calculation errors
  showRightArrow.value = scrollLeft < scrollWidth - clientWidth - 1
}

onMounted(() => {
  checkScroll()
  window.addEventListener('resize', checkScroll)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScroll)
})
</script>

<template>
  <div class="stat-deck-container">
    <button 
      v-if="showLeftArrow"
      class="nav-btn prev"
      @click="scroll('left')"
      aria-label="Scroll left"
    >
      <ChevronLeft :size="24" />
    </button>

    <div class="stat-deck" ref="deckRef" @scroll="checkScroll">
      <div 
        v-for="(item, idx) in items" 
        :key="idx"
        class="stat-card glass-card"
        :style="{ '--accent-color': item.color || 'var(--color-text-primary)' }"
      >
        <div class="stat-card__icon-wrapper" v-if="item.icon">
          <component :is="item.icon" :size="20" class="stat-card__icon" />
        </div>
        
        <div class="stat-card__content">
          <span class="stat-card__label">{{ item.label }}</span>
          <div class="stat-card__value-row">
            <span class="stat-card__value">{{ item.value }}</span>
            <span 
              v-if="item.trend" 
              class="stat-card__trend"
              :class="item.trend"
            >
              {{ item.trend === 'up' ? '↑' : '↓' }}
            </span>
          </div>
          <span v-if="item.subtext" class="stat-card__subtext">{{ item.subtext }}</span>
        </div>
        
        <div class="stat-card__glow"></div>
      </div>
    </div>

    <button 
      v-if="showRightArrow"
      class="nav-btn next"
      @click="scroll('right')"
      aria-label="Scroll right"
    >
      <ChevronRight :size="24" />
    </button>
  </div>
</template>

<style scoped>
.stat-deck-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.stat-deck {
  display: flex;
  gap: 16px;
  width: 100%;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 4px; /* Space for shadows/hover effects */
  /* Hide scrollbar */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.stat-deck::-webkit-scrollbar {
  display: none;
}

.nav-btn {
  position: absolute;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(20, 20, 25, 0.8);
  border: 1px solid var(--color-glass-border);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.nav-btn:hover {
  background: var(--color-accent);
  color: white;
  transform: scale(1.1);
}

.nav-btn.prev {
  left: -20px;
}

.nav-btn.next {
  right: -20px;
}

.stat-card {
  position: relative;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 200px; /* Fixed width for horizontal scroll */
  flex-shrink: 0;   /* Prevent shrinking */
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
}

.stat-card__icon-wrapper {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-color);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-card__icon-wrapper {
  background: var(--accent-color);
  color: #000;
  transform: scale(1.1);
}

.stat-card__content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-card__label {
  font-size: 12px;
  color: var(--color-text-muted);
  font-weight: 500;
}

.stat-card__value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.stat-card__value {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.5px;
}

.stat-card__trend {
  font-size: 12px;
  font-weight: 600;
}

.stat-card__trend.up { color: var(--color-neon-green); }
.stat-card__trend.down { color: var(--color-neon-orange); }

.stat-card__subtext {
  font-size: 11px;
  color: var(--color-text-muted);
  opacity: 0.8;
}

/* Glow Effect */
.stat-card__glow {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 100px;
  height: 100px;
  background: var(--accent-color);
  filter: blur(60px);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.stat-card:hover .stat-card__glow {
  opacity: 0.15;
}
</style>
