<script setup lang="ts">
withDefaults(
  defineProps<{
    padded?: boolean;
    muted?: boolean;
  }>(),
  {
    padded: true,
    muted: false
  }
);
</script>

<template>
  <section class="ui-card" :class="{ 'is-padded': padded, 'is-muted': muted }">
    <slot />
  </section>
</template>
