<script setup lang="ts">
withDefaults(
  defineProps<{
    content: string;
    side?: "top" | "bottom";
  }>(),
  {
    side: "top"
  }
);
</script>

<template>
  <span class="tooltip" :class="`tooltip--${side}`">
    <span class="tooltip__trigger">
      <slot />
    </span>
    <span class="tooltip__content" role="tooltip">{{ content }}</span>
  </span>
</template>

<style scoped>
.tooltip {
  position: relative;
  display: inline-flex;
}

.tooltip__content {
  position: absolute;
  left: 50%;
  z-index: 30;
  min-width: max-content;
  max-width: 16rem;
  padding: 0.5rem 0.625rem;
  border-radius: calc(var(--radius) - 4px);
  background: var(--foreground);
  color: var(--background);
  font-size: 0.75rem;
  line-height: 1.35;
  opacity: 0;
  pointer-events: none;
  transform: translateX(-50%) translateY(0.25rem);
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.tooltip--top .tooltip__content {
  bottom: calc(100% + 0.5rem);
}

.tooltip--bottom .tooltip__content {
  top: calc(100% + 0.5rem);
}

.tooltip:hover .tooltip__content,
.tooltip:focus-within .tooltip__content {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
