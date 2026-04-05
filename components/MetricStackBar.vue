<script setup lang="ts">
type MetricStackSegment = {
  label: string;
  value: number;
  valueLabel?: string;
  accent?: "primary" | "success" | "warning" | "danger" | "muted";
};

const props = withDefaults(
  defineProps<{
    segments: MetricStackSegment[];
    emptyText?: string;
  }>(),
  {
    emptyText: "Недостаточно данных для распределения."
  }
);

const total = computed(() => props.segments.reduce((sum, item) => sum + item.value, 0));

function widthPercent(value: number) {
  if (total.value <= 0) {
    return "0%";
  }

  return `${(value / total.value) * 100}%`;
}

function accentClass(accent?: MetricStackSegment["accent"]) {
  if (accent === "success") {
    return "bg-emerald-500";
  }

  if (accent === "warning") {
    return "bg-amber-500";
  }

  if (accent === "danger") {
    return "bg-rose-500";
  }

  if (accent === "muted") {
    return "bg-slate-400";
  }

  return "bg-primary";
}
</script>

<template>
  <div v-if="segments.length === 0 || total === 0" class="rounded-2xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
    {{ emptyText }}
  </div>

  <div v-else class="space-y-4">
    <div class="flex h-4 overflow-hidden rounded-full bg-muted/70">
      <div
        v-for="segment in segments"
        :key="segment.label"
        class="h-full transition-[width]"
        :class="accentClass(segment.accent)"
        :style="{ width: widthPercent(segment.value) }"
      />
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <div
        v-for="segment in segments"
        :key="`${segment.label}-${segment.value}`"
        class="rounded-2xl border bg-muted/15 p-3"
      >
        <div class="flex items-center gap-2">
          <span class="h-2.5 w-2.5 rounded-full" :class="accentClass(segment.accent)" />
          <p class="text-sm font-medium">{{ segment.label }}</p>
        </div>
        <p class="mt-2 text-lg font-semibold">{{ segment.valueLabel ?? formatNumber(segment.value) }}</p>
        <p class="text-xs text-muted-foreground">
          {{ formatPercent((segment.value / total) * 100) }} от текущего объёма
        </p>
      </div>
    </div>
  </div>
</template>
