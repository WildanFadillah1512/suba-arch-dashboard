<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'

defineProps<{
  title: string
  subtitle?: string
}>()

const sidebarCollapsed = ref(false)
</script>

<template>
  <div class="layout">
    <Sidebar 
      :collapsed="sidebarCollapsed" 
      @toggle="sidebarCollapsed = !sidebarCollapsed" 
    />
    
    <main 
      class="layout__main"
      :class="{ 'layout__main--expanded': sidebarCollapsed }"
    >
      <Header :title="title" :subtitle="subtitle" />
      
      <div class="layout__content">
        <slot />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  background: var(--color-void);
}

.layout__main {
  margin-left: var(--spacing-sidebar);
  min-height: 100vh;
  transition: margin-left 0.3s ease;
}

.layout__main--expanded {
  margin-left: var(--spacing-sidebar-collapsed);
}

.layout__content {
  padding: 24px 32px;
  background: var(--color-void);
  min-height: calc(100vh - 80px);
}

/* Background mesh effect */
.layout__content::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(at 20% 20%, rgba(168, 85, 247, 0.08) 0, transparent 50%),
    radial-gradient(at 80% 80%, rgba(0, 212, 255, 0.06) 0, transparent 50%),
    radial-gradient(at 40% 60%, rgba(236, 72, 153, 0.04) 0, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.layout__content > :deep(*) {
  position: relative;
  z-index: 1;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .layout__main {
    margin-left: var(--spacing-sidebar-collapsed);
  }
  
  .layout__content {
    padding: 16px;
  }
}
</style>
