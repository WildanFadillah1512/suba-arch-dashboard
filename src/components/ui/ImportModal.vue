<script setup lang="ts">
import { ref } from 'vue'
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-vue-next'
import { useInstagramStore } from '@/stores/instagram'
import { useTikTokStore } from '@/stores/tiktok'
import { useYouTubeStore } from '@/stores/youtube'
import { useWhatsAppStore } from '@/stores/whatsapp'
import { parseFile, getFileType } from '@/utils/fileParser'
import type { Platform } from '@/types'

interface Props {
  show: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  (e: 'close'): void
}>()

const instagramStore = useInstagramStore()
const tiktokStore = useTikTokStore()
const youtubeStore = useYouTubeStore()
const whatsappStore = useWhatsAppStore()

const selectedPlatform = ref<Platform>('instagram')
const file = ref<File | null>(null)
const loading = ref(false)
const result = ref<{ success: boolean; message: string } | null>(null)
const dragOver = ref(false)

const platforms = [
  { id: 'instagram' as Platform, name: 'Instagram', icon: '📸', color: 'var(--color-instagram)' },
  { id: 'tiktok' as Platform, name: 'TikTok', icon: '🎵', color: 'var(--color-tiktok)' },
  { id: 'youtube' as Platform, name: 'YouTube', icon: '▶️', color: 'var(--color-youtube)' },
  { id: 'whatsapp' as Platform, name: 'WhatsApp', icon: '💬', color: 'var(--color-whatsapp)' }
]

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    file.value = input.files[0]
    result.value = null
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    file.value = event.dataTransfer.files[0]
    result.value = null
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function handleDragLeave() {
  dragOver.value = false
}

async function handleImport() {
  if (!file.value) return

  loading.value = true
  result.value = null

  try {
    // Parse file (supports CSV and XLSX)
    const parsed = await parseFile(file.value)
    const fileType = getFileType(file.value)
    const fileTypeLabel = fileType === 'xlsx' ? 'Excel' : 'CSV'

    switch (selectedPlatform.value) {
      case 'instagram':
        await instagramStore.importData(parsed.data)
        result.value = { success: true, message: `Imported ${instagramStore.posts.length} Instagram posts from ${fileTypeLabel}` }
        break
      case 'tiktok':
        await tiktokStore.importData(parsed.data)
        result.value = { success: true, message: `Imported ${tiktokStore.videos.length} TikTok videos from ${fileTypeLabel}` }
        break
      case 'youtube':
        await youtubeStore.importData(parsed.data)
        result.value = { success: true, message: `Imported ${youtubeStore.videos.length} YouTube videos from ${fileTypeLabel}` }
        break
      case 'whatsapp':
        await whatsappStore.importData(parsed.data)
        result.value = { success: true, message: `Imported ${whatsappStore.leads.length} WhatsApp leads from ${fileTypeLabel}` }
        break
    }
  } catch (error) {
    result.value = { success: false, message: `Import failed: ${error}` }
  } finally {
    loading.value = false
  }
}

function reset() {
  file.value = null
  result.value = null
}

function close() {
  reset()
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="close">
        <div class="modal glass">
          <!-- Header -->
          <div class="modal__header">
            <h2 class="modal__title">Import Data</h2>
            <button class="modal__close" @click="close">
              <X :size="20" />
            </button>
          </div>

          <!-- Platform Selection -->
          <div class="modal__platforms">
            <button
              v-for="platform in platforms"
              :key="platform.id"
              class="platform-btn"
              :class="{ 'platform-btn--active': selectedPlatform === platform.id }"
              :style="selectedPlatform === platform.id ? { borderColor: platform.color } : {}"
              @click="selectedPlatform = platform.id"
            >
              <span class="platform-btn__icon">{{ platform.icon }}</span>
              <span class="platform-btn__name">{{ platform.name }}</span>
            </button>
          </div>

          <!-- Drop Zone -->
          <div 
            class="dropzone"
            :class="{ 'dropzone--active': dragOver, 'dropzone--has-file': file }"
            @drop="handleDrop"
            @dragover="handleDragOver"
            @dragleave="handleDragLeave"
          >
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              class="dropzone__input"
              @change="handleFileSelect"
            />
            
            <template v-if="file">
              <FileSpreadsheet :size="40" class="dropzone__icon" />
              <p class="dropzone__filename">{{ file.name }}</p>
              <button class="btn btn-secondary" @click.stop="reset">Change File</button>
            </template>
            <template v-else>
              <Upload :size="40" class="dropzone__icon" />
              <p class="dropzone__text">Drag & drop CSV or Excel file here</p>
              <p class="dropzone__hint">Supports .csv, .xlsx, .xls formats</p>
            </template>
          </div>

          <!-- Result Message -->
          <div v-if="result" class="modal__result" :class="{ 'modal__result--success': result.success }">
            <CheckCircle v-if="result.success" :size="20" />
            <AlertCircle v-else :size="20" />
            <span>{{ result.message }}</span>
          </div>

          <!-- Actions -->
          <div class="modal__actions">
            <button class="btn btn-secondary" @click="close">Cancel</button>
            <button 
              class="btn btn-primary" 
              :disabled="!file || loading"
              @click="handleImport"
            >
              <span v-if="loading">Importing...</span>
              <span v-else>Import Data</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 520px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal__title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.modal__close:hover {
  background: var(--color-glass);
  color: var(--color-text-primary);
}

.modal__platforms {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.platform-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: var(--color-void-light);
  border: 2px solid var(--color-glass-border);
  border-radius: var(--radius-card);
  cursor: pointer;
  transition: all 0.2s;
}

.platform-btn:hover {
  background: var(--color-glass);
}

.platform-btn--active {
  background: var(--color-glass);
}

.platform-btn__icon {
  font-size: 24px;
}

.platform-btn__name {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.dropzone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  border: 2px dashed var(--color-glass-border);
  border-radius: var(--radius-card);
  background: var(--color-void-light);
  cursor: pointer;
  transition: all 0.2s;
}

.dropzone:hover,
.dropzone--active {
  border-color: var(--color-neon-blue);
  background: rgba(0, 212, 255, 0.05);
}

.dropzone--has-file {
  border-style: solid;
  border-color: var(--color-neon-green);
  background: rgba(16, 185, 129, 0.05);
}

.dropzone__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.dropzone__icon {
  color: var(--color-text-muted);
}

.dropzone--has-file .dropzone__icon {
  color: var(--color-neon-green);
}

.dropzone__text {
  font-size: 14px;
  color: var(--color-text-primary);
  margin: 0;
}

.dropzone__hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.dropzone__filename {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0;
}

.modal__result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(236, 72, 153, 0.1);
  border-radius: var(--radius-button);
  color: var(--color-neon-pink);
  font-size: 14px;
}

.modal__result--success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-neon-green);
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.95) translateY(10px);
}

/* Mobile */
@media (max-width: 640px) {
  .modal {
    margin: 16px;
  }
  
  .modal__platforms {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
