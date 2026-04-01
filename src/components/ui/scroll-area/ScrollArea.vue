<script setup lang="ts">
withDefaults(
  defineProps<{
    maxHeight?: string;
    direction?: "both" | "x" | "y";
  }>(),
  {
    maxHeight: "",
    direction: "both"
  }
);
</script>

<template>
  <div
    class="scroll-area"
    :class="`scroll-area--${direction}`"
    :style="maxHeight ? { maxHeight } : undefined"
  >
    <slot />
  </div>
</template>

<style scoped>
.scroll-area {
  min-width: 0;
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--muted-foreground) 35%, white) transparent;
}

.scroll-area::-webkit-scrollbar {
  width: 0.625rem;
  height: 0.625rem;
}

.scroll-area::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--muted-foreground) 28%, white);
}

.scroll-area--both {
  overflow: auto;
}

.scroll-area--x {
  overflow-x: auto;
  overflow-y: hidden;
}

.scroll-area--y {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
