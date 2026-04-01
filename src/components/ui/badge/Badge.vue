<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../../lib/utils/cn";

const props = withDefaults(
  defineProps<{
    variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline";
  }>(),
  {
    variant: "secondary"
  }
);

const classes = computed(() => cn("badge", `badge--${props.variant}`));
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.75rem;
  padding: 0 0.625rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
}

.badge--default {
  background: var(--primary);
  color: var(--primary-foreground);
}

.badge--secondary {
  background: var(--accent);
  border-color: var(--border);
  color: var(--foreground);
}

.badge--success {
  background: var(--success-soft);
  border-color: color-mix(in srgb, var(--success) 18%, white);
  color: var(--success);
}

.badge--warning {
  background: var(--warning-soft);
  border-color: color-mix(in srgb, var(--warning) 18%, white);
  color: var(--warning);
}

.badge--destructive {
  background: var(--destructive-soft);
  border-color: color-mix(in srgb, var(--destructive) 18%, white);
  color: var(--destructive);
}

.badge--outline {
  background: transparent;
  border-color: var(--border);
  color: var(--muted-foreground);
}
</style>
