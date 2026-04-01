<script setup lang="ts">
import { computed } from "vue";

type BarChartItem = {
  label: string;
  value: number;
  hint?: string;
};

const props = withDefaults(
  defineProps<{
    items: BarChartItem[];
    emptyLabel?: string;
  }>(),
  {
    emptyLabel: "Нет данных для графика."
  }
);

const maxValue = computed(() =>
  props.items.reduce((max, item) => Math.max(max, item.value), 1)
);

function width(value: number) {
  if (value <= 0) {
    return "0%";
  }

  return `${Math.max((value / maxValue.value) * 100, 8)}%`;
}
</script>

<template>
  <div v-if="items.length === 0" class="chart-empty">{{ emptyLabel }}</div>
  <div v-else class="chart-list">
    <article v-for="item in items" :key="item.label" class="chart-row">
      <div class="chart-row-head">
        <strong>{{ item.label }}</strong>
        <span>{{ item.value }}</span>
      </div>
      <div class="chart-track">
        <div class="chart-fill" :style="{ width: width(item.value) }"></div>
      </div>
      <small v-if="item.hint">{{ item.hint }}</small>
    </article>
  </div>
</template>

<style scoped>
.chart-empty {
  padding: 0.35rem 0;
  color: var(--muted-foreground);
}

.chart-list {
  display: grid;
  gap: 1rem;
}

.chart-row {
  display: grid;
  gap: 0.45rem;
}

.chart-row-head {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: center;
}

.chart-row-head strong,
.chart-row-head span,
.chart-row small {
  margin: 0;
}

.chart-row-head span,
.chart-row small {
  color: var(--muted-foreground);
}

.chart-track {
  width: 100%;
  height: 0.6rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--border-subtle);
}

.chart-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary), color-mix(in srgb, var(--primary) 72%, white));
}
</style>
