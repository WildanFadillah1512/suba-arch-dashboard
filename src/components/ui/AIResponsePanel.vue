<script setup lang="ts">
import { ref, watch } from 'vue'
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-vue-next'

interface Props {
  title: string
  loading?: boolean
  error?: string | null
  content?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  (e: 'retry'): void
}>()

const copied = ref(false)

async function copyToClipboard() {
  if (!props.content) return
  
  try {
    await navigator.clipboard.writeText(props.content)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <div class="ai-panel glass-card">
    <div class="ai-panel__header">
      <div class="ai-panel__title">
        <Sparkles :size="18" class="ai-panel__icon" />
        <span>{{ title }}</span>
      </div>
      
      <div class="ai-panel__actions">
        <button 
          v-if="content" 
          class="ai-panel__btn"
          :class="{ 'ai-panel__btn--success': copied }"
          @click="copyToClipboard"
        >
          <Check v-if="copied" :size="16" />
          <Copy v-else :size="16" />
        </button>
        <button 
          v-if="error" 
          class="ai-panel__btn"
          @click="emit('retry')"
        >
          <RefreshCw :size="16" />
        </button>
      </div>
    </div>

    <div class="ai-panel__content">
      <!-- Loading State -->
      <div v-if="loading" class="ai-panel__loading">
        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p>AI is thinking...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="ai-panel__error">
        <p>{{ error }}</p>
      </div>

      <!-- Content -->
      <div v-else-if="content" class="ai-panel__text">
        <slot>
          {{ content }}
        </slot>
      </div>

      <!-- Empty State -->
      <div v-else class="ai-panel__empty">
        <Sparkles :size="32" />
        <p>Click a button above to generate AI insights</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.ai-panel__icon {
  color: var(--color-neon-purple);
}

.ai-panel__actions {
  display: flex;
  gap: 8px;
}

.ai-panel__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-glass);
  border: 1px solid var(--color-glass-border);
  border-radius: 6px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.ai-panel__btn:hover {
  background: var(--color-glass-hover);
  color: var(--color-text-primary);
}

.ai-panel__btn--success {
  color: var(--color-neon-green);
  background: rgba(16, 185, 129, 0.1);
}

.ai-panel__content {
  min-height: 120px;
}

.ai-panel__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 40px 20px;
  color: var(--color-text-secondary);
}

.loading-dots {
  display: flex;
  gap: 6px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: var(--color-neon-purple);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0) }
  40% { transform: scale(1) }
}

.ai-panel__error {
  padding: 16px;
  background: rgba(236, 72, 153, 0.1);
  border-radius: var(--radius-button);
  color: var(--color-neon-pink);
  font-size: 14px;
}

.ai-panel__text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  white-space: pre-wrap;
}

.ai-panel__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--color-text-muted);
  text-align: center;
}

.ai-panel__empty p {
  margin: 0;
  font-size: 13px;
}
</style>
