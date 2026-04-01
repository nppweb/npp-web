<script setup lang="ts">
import { computed } from "vue";

type LineChartPoint = {
  label: string;
  value: number;
};

const props = withDefaults(
  defineProps<{
    points: LineChartPoint[];
    emptyLabel?: string;
  }>(),
  {
    emptyLabel: "Нет данных для графика."
  }
);

const maxValue = computed(() =>
  props.points.reduce((max, point) => Math.max(max, point.value), 1)
);

const chartPoints = computed(() => {
  if (props.points.length === 0) {
    return "";
  }

  const step = props.points.length === 1 ? 0 : 100 / (props.points.length - 1);

  return props.points
    .map((point, index) => {
      const x = index * step;
      const y = 56 - (point.value / maxValue.value) * 44;
      return `${x},${Math.max(y, 8)}`;
    })
    .join(" ");
});

const areaPoints = computed(() => {
  if (!chartPoints.value) {
    return "";
  }

  return `0,56 ${chartPoints.value} 100,56`;
});
</script>

<template>
  <div v-if="points.length === 0" class="chart-empty">{{ emptyLabel }}</div>
  <div v-else class="line-chart">
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
      <polyline class="line-chart-area" :points="areaPoints"></polyline>
      <polyline class="line-chart-line" :points="chartPoints"></polyline>
      <circle
        v-for="(point, index) in points"
        :key="`${point.label}-${index}`"
        class="line-chart-dot"
        :cx="points.length === 1 ? 50 : index * (100 / (points.length - 1))"
        :cy="Math.max(56 - (point.value / maxValue) * 44, 8)"
        r="1.9"
      ></circle>
    </svg>
    <div class="line-chart-labels">
      <div v-for="point in points" :key="point.label" class="line-chart-label">
        <strong>{{ point.value }}</strong>
        <span>{{ point.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-empty {
  padding: 0.35rem 0;
  color: var(--muted-foreground);
}

.line-chart {
  display: grid;
  gap: 1rem;
}

.line-chart svg {
  width: 100%;
  height: 220px;
}

.line-chart-area {
  fill: rgba(31, 79, 209, 0.1);
}

.line-chart-line {
  fill: none;
  stroke: var(--primary);
  stroke-width: 2;
}

.line-chart-dot {
  fill: var(--primary);
}

.line-chart-labels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(52px, 1fr));
  gap: 0.5rem;
}

.line-chart-label {
  display: grid;
  gap: 0.2rem;
}

.line-chart-label strong {
  font-size: 1rem;
}

.line-chart-label span {
  color: var(--muted-foreground);
  font-size: 0.82rem;
}
</style>
