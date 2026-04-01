<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "default" | "secondary" | "ghost" | "destructive";
    size?: "md" | "sm";
    block?: boolean;
  }>(),
  {
    variant: "default",
    size: "md",
    block: false
  }
);
</script>

<template>
  <button
    class="ui-button"
    :class="[`is-${variant}`, `is-${size}`, { 'is-block': block }]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>
