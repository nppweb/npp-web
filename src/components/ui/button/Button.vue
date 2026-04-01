<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../../lib/utils/cn";

const props = withDefaults(
  defineProps<{
    variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    block?: boolean;
  }>(),
  {
    variant: "default",
    size: "default",
    block: false
  }
);

const classes = computed(() =>
  cn(
    "button",
    `button--${props.variant}`,
    `button--${props.size}`,
    props.block && "button--block"
  )
);
</script>

<template>
  <button :class="classes" v-bind="$attrs">
    <slot />
  </button>
</template>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  padding: 0 1rem;
  border: 1px solid transparent;
  border-radius: calc(var(--radius) - 2px);
  background: transparent;
  color: var(--foreground);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.button:focus-visible {
  outline: none;
  box-shadow: var(--ring);
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.button--block {
  width: 100%;
}

.button--default {
  background: var(--primary);
  color: var(--primary-foreground);
}

.button--default:hover:not(:disabled) {
  background: var(--primary-hover);
}

.button--secondary {
  background: var(--secondary);
  border-color: var(--border);
  color: var(--foreground);
}

.button--secondary:hover:not(:disabled),
.button--outline:hover:not(:disabled) {
  background: var(--accent);
}

.button--outline {
  background: var(--card);
  border-color: var(--border);
}

.button--ghost {
  color: var(--muted-foreground);
}

.button--ghost:hover:not(:disabled) {
  background: var(--accent);
  color: var(--foreground);
}

.button--destructive {
  background: var(--destructive);
  color: #fff;
}

.button--destructive:hover:not(:disabled) {
  background: var(--destructive-strong);
}

.button--link {
  min-height: auto;
  padding: 0;
  border-radius: 0;
  color: var(--primary);
}

.button--link:hover:not(:disabled) {
  color: var(--primary-hover);
  transform: none;
}

.button--sm {
  min-height: 2.25rem;
  padding: 0 0.875rem;
  font-size: 0.875rem;
}

.button--lg {
  min-height: 3rem;
  padding: 0 1.25rem;
}

.button--icon {
  width: 2.5rem;
  min-width: 2.5rem;
  padding: 0;
}
</style>
