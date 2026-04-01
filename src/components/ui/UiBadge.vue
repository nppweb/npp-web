<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: "neutral" | "success" | "warning" | "danger";
  }>(),
  {
    tone: "neutral"
  }
);
</script>

<template>
  <span class="ui-badge" :class="`is-${tone}`">
    <slot />
  </span>
</template>
