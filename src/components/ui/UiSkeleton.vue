<script setup lang="ts">
withDefaults(
  defineProps<{
    lines?: number;
    dense?: boolean;
  }>(),
  {
    lines: 1,
    dense: false
  }
);
</script>

<template>
  <div class="ui-skeleton" :class="{ 'is-dense': dense }">
    <span v-for="line in lines" :key="line" class="ui-skeleton__line"></span>
  </div>
</template>
