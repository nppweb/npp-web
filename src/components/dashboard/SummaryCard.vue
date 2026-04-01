<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  hint: string;
}>();
</script>

<template>
  <article class="summary-card">
    <span class="summary-card__label">{{ label }}</span>
    <strong>{{ value }}</strong>
    <p>{{ hint }}</p>
  </article>
</template>
