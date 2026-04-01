<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../../lib/utils/cn";

const props = withDefaults(
  defineProps<{
    variant?: "default" | "muted";
    padding?: "default" | "sm" | "none";
  }>(),
  {
    variant: "default",
    padding: "default"
  }
);

const classes = computed(() =>
  cn("card", `card--${props.variant}`, `card--padding-${props.padding}`)
);
</script>

<template>
  <section :class="classes">
    <slot />
  </section>
</template>

<style scoped>
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.card--muted {
  background: var(--muted);
}

.card--padding-default {
  padding: 1.25rem;
}

.card--padding-sm {
  padding: 1rem;
}
</style>
