<script setup lang="ts">
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  icon?: any
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: string
  subtitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  trend: 'neutral',
  color: 'var(--color-neon-blue)'
})

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus
}
</script>

<template>
  <div class="metric-card glass-card">
    <div class="metric-card__header">
      <div 
        v-if="icon" 
        class="metric-card__icon"
        :style="{ background: `${color}20`, color: color }"
      >
        <component :is="icon" :size="20" />
      </div>
      <span class="metric-card__title">{{ title }}</span>
    </div>

    <div class="metric-card__body">
      <span class="metric-card__value" :style="{ color }">{{ value }}</span>
      
      <div 
        v-if="trendValue" 
        class="metric-card__trend"
        :class="`metric-card__trend--${trend}`"
      >
        <component :is="trendIcon[trend]" :size="14" />
        <span>{{ trendValue }}</span>
      </div>
    </div>

    <p v-if="subtitle" class="metric-card__subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.metric-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-card__title {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-card__body {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.metric-card__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.metric-card__trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
}

.metric-card__trend--up {
  color: var(--color-neon-green);
  background: rgba(16, 185, 129, 0.1);
}

.metric-card__trend--down {
  color: var(--color-neon-pink);
  background: rgba(236, 72, 153, 0.1);
}

.metric-card__trend--neutral {
  color: var(--color-text-secondary);
  background: var(--color-glass);
}

.metric-card__subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
