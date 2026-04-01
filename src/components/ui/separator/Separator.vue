<script setup lang="ts">
withDefaults(
  defineProps<{
    orientation?: "horizontal" | "vertical";
  }>(),
  {
    orientation: "horizontal"
  }
);
</script>

<template>
  <div
    class="separator"
    :class="`separator--${orientation}`"
    :aria-orientation="orientation"
    role="separator"
  />
</template>

<style scoped>
.separator {
  flex-shrink: 0;
  background: var(--border);
}

.separator--horizontal {
  width: 100%;
  height: 1px;
}

.separator--vertical {
  width: 1px;
  align-self: stretch;
}
</style>
