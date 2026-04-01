<script setup lang="ts">
import Card from "../ui/card/Card.vue";

defineProps<{
  label: string;
  value: string;
  hint: string;
}>();
</script>

<template>
  <Card class="summary-card">
    <span class="summary-card__label">{{ label }}</span>
    <strong>{{ value }}</strong>
    <p>{{ hint }}</p>
  </Card>
</template>
