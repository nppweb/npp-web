<script setup lang="ts">
type MetricColumnItem = {
  label: string;
  shortLabel?: string;
  value: number;
  valueLabel?: string;
  note?: string;
  accent?: "primary" | "success" | "warning" | "danger" | "muted";
};

const props = withDefaults(
  defineProps<{
    items: MetricColumnItem[];
    emptyText?: string;
  }>(),
  {
    emptyText: "Недостаточно данных для диаграммы."
  }
);

const maxValue = computed(() => Math.max(...props.items.map((item) => item.value), 1));

function heightPercent(value: number) {
  return `${Math.max(14, (value / maxValue.value) * 100)}%`;
}

function accentClass(accent?: MetricColumnItem["accent"]) {
  if (accent === "success") {
    return "bg-emerald-500/85";
  }

  if (accent === "warning") {
    return "bg-amber-500/85";
  }

  if (accent === "danger") {
    return "bg-rose-500/85";
  }

  if (accent === "muted") {
    return "bg-slate-400/85";
  }

  return "bg-primary/85";
}
</script>

<template>
  <div v-if="items.length === 0" class="rounded-2xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
    {{ emptyText }}
  </div>

  <div v-else class="space-y-4">
    <div class="grid h-52 grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
      <div
        v-for="item in items"
        :key="`${item.label}-${item.value}`"
        class="flex min-w-0 flex-col justify-end gap-3"
      >
        <div class="flex-1 rounded-2xl border border-dashed border-border/70 bg-muted/15 p-2">
          <div class="flex h-full items-end">
            <div
              class="w-full rounded-xl transition-[height]"
              :class="accentClass(item.accent)"
              :style="{ height: heightPercent(item.value) }"
            />
          </div>
        </div>
        <div class="space-y-1 text-xs">
          <p class="truncate font-medium text-foreground">{{ item.shortLabel ?? item.label }}</p>
          <p class="text-muted-foreground">{{ item.valueLabel ?? formatNumber(item.value) }}</p>
        </div>
      </div>
    </div>

    <p v-if="items.some((item) => item.note)" class="text-xs text-muted-foreground">
      {{
        items
          .map((item) => item.note)
          .filter((item): item is string => Boolean(item))
          .join(" · ")
      }}
    </p>
  </div>
</template>
