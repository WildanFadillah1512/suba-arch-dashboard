<script setup lang="ts">
import { ref } from 'vue'
import { Upload, Search, Bell, User } from 'lucide-vue-next'
import ImportModal from './ui/ImportModal.vue'

defineProps<{
  title: string
  subtitle?: string
}>()

const showImportModal = ref(false)
const searchQuery = ref('')
</script>

<template>
  <header class="header">
    <div class="header__left">
      <div class="header__titles">
        <h1 class="header__title">{{ title }}</h1>
        <p v-if="subtitle" class="header__subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <div class="header__right">
      <!-- Search -->
      <div class="header__search">
        <Search :size="18" class="header__search-icon" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search..."
          class="header__search-input"
        />
      </div>

      <!-- Import Button -->
      <button class="btn btn-primary" @click="showImportModal = true">
        <Upload :size="18" />
        <span>Import Data</span>
      </button>

      <!-- Notifications -->
      <button class="header__icon-btn">
        <Bell :size="20" />
        <span class="header__notification-dot" />
      </button>

      <!-- Profile -->
      <button class="header__profile">
        <User :size="20" />
      </button>
    </div>

    <!-- Import Modal -->
    <ImportModal 
      :show="showImportModal" 
      @close="showImportModal = false" 
    />
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: var(--color-void);
  border-bottom: 1px solid var(--color-glass-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header__left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.header__titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header__title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.header__subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.header__right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__search {
  position: relative;
  display: flex;
  align-items: center;
}

.header__search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-muted);
  pointer-events: none;
}

.header__search-input {
  background: var(--color-void-light);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-button);
  padding: 10px 16px 10px 40px;
  color: var(--color-text-primary);
  font-size: 14px;
  width: 240px;
  outline: none;
  transition: all 0.2s ease;
}

.header__search-input:focus {
  border-color: var(--color-neon-blue);
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.header__search-input::placeholder {
  color: var(--color-text-muted);
}

.header__icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-glass);
  border: 1px solid var(--color-glass-border);
  border-radius: 10px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.header__icon-btn:hover {
  background: var(--color-glass-hover);
  color: var(--color-text-primary);
}

.header__notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: var(--color-neon-pink);
  border-radius: 50%;
}

.header__profile {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-neon-blue), var(--color-neon-purple));
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.header__profile:hover {
  transform: scale(1.05);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .header {
    padding: 16px;
  }

  .header__search {
    display: none;
  }

  .btn span {
    display: none;
  }
}
</style>
