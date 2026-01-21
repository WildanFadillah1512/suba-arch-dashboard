<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

interface Props {
  title: string
  subtitle?: string
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'scatter' | 'heatmap' | 'radialBar'
  series: any[]
  options?: ApexOptions
  height?: number | string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 300,
  loading: false
})

const chartRef = ref<any>(null)

// Default dark theme options
const defaultOptions: ApexOptions = {
  chart: {
    background: 'transparent',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Inter, sans-serif'
  },
  theme: { mode: 'dark' },
  colors: ['#00d4ff', '#a855f7', '#ec4899', '#10b981', '#f97316'],
  grid: {
    borderColor: 'rgba(255,255,255,0.1)',
    strokeDashArray: 4
  },
  xaxis: {
    labels: { style: { colors: '#94a3b8' } },
    axisBorder: { color: 'rgba(255,255,255,0.1)' },
    axisTicks: { color: 'rgba(255,255,255,0.1)' }
  },
  yaxis: {
    labels: { style: { colors: '#94a3b8' } }
  },
  legend: {
    labels: { colors: '#94a3b8' },
    position: 'bottom'
  },
  tooltip: {
    theme: 'dark',
    style: { fontFamily: 'Inter, sans-serif' }
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 0.4,
      opacityFrom: 0.5,
      opacityTo: 0.1
    }
  }
}

const mergedOptions = computed(() => {
  return {
    ...defaultOptions,
    ...props.options,
    chart: {
      ...defaultOptions.chart,
      ...(props.options?.chart || {}),
      type: props.type
    }
  }
})
</script>

<template>
  <div class="chart-card glass-card">
    <div class="chart-card__header">
      <div class="chart-card__titles">
        <h3 class="chart-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="chart-card__subtitle">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>

    <div class="chart-card__body">
      <!-- Loading State -->
      <div v-if="loading" class="chart-card__loading">
        <div class="skeleton" style="width: 100%; height: 100%;" />
      </div>

      <!-- Chart -->
      <VueApexCharts
        v-else
        ref="chartRef"
        :type="type"
        :options="mergedOptions"
        :series="series"
        :height="height"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue'
</script>

<style scoped>
.chart-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.chart-card__titles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chart-card__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text-primary);
}

.chart-card__subtitle {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.chart-card__body {
  position: relative;
  min-height: 200px;
}

.chart-card__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
