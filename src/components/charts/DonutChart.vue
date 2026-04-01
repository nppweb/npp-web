<script setup lang="ts">
import { computed } from "vue";

type DonutChartSegment = {
  label: string;
  value: number;
  color: string;
};

const props = withDefaults(
  defineProps<{
    segments: DonutChartSegment[];
    emptyLabel?: string;
  }>(),
  {
    emptyLabel: "Нет данных для графика."
  }
);

const total = computed(() =>
  props.segments.reduce((sum, segment) => sum + segment.value, 0)
);

const radius = 44;
const circumference = 2 * Math.PI * radius;

const normalizedSegments = computed(() => {
  let offset = 0;

  return props.segments.map((segment) => {
    const dash = total.value > 0 ? (segment.value / total.value) * circumference : 0;
    const item = {
      ...segment,
      dash,
      offset
    };

    offset += dash;
    return item;
  });
});
</script>

<template>
  <div v-if="segments.length === 0 || total === 0" class="chart-empty">{{ emptyLabel }}</div>
  <div v-else class="donut-chart">
    <div class="donut-visual">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle class="donut-base" cx="60" cy="60" :r="radius"></circle>
        <circle
          v-for="segment in normalizedSegments"
          :key="segment.label"
          class="donut-segment"
          cx="60"
          cy="60"
          :r="radius"
          :stroke="segment.color"
          :stroke-dasharray="`${segment.dash} ${circumference}`"
          :stroke-dashoffset="`${-segment.offset}`"
        ></circle>
      </svg>
      <div class="donut-center">
        <strong>{{ total }}</strong>
        <span>всего</span>
      </div>
    </div>

    <div class="donut-legend">
      <article v-for="segment in normalizedSegments" :key="segment.label" class="legend-row">
        <div class="legend-label">
          <span class="legend-dot" :style="{ backgroundColor: segment.color }"></span>
          <strong>{{ segment.label }}</strong>
        </div>
        <span>{{ segment.value }}</span>
      </article>
    </div>
  </div>
</template>

<style scoped>
.chart-empty {
  padding: 0.35rem 0;
  color: var(--muted-foreground);
}

.donut-chart {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 1.25rem;
  align-items: center;
}

.donut-visual {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto;
}

.donut-visual svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.donut-base,
.donut-segment {
  fill: none;
  stroke-width: 12;
}

.donut-base {
  stroke: var(--border-subtle);
}

.donut-center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
}

.donut-center strong {
  font-size: 2rem;
}

.donut-center span {
  color: var(--muted-foreground);
}

.donut-legend {
  display: grid;
  gap: 0.75rem;
}

.legend-row,
.legend-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.legend-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 999px;
  flex-shrink: 0;
}

.legend-row span {
  color: var(--muted-foreground);
}

@media (max-width: 720px) {
  .donut-chart {
    grid-template-columns: 1fr;
  }
}
</style>
