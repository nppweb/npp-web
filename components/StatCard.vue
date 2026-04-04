<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  hint: string;
}>();
</script>

<template>
  <Card>
    <CardHeader class="space-y-3">
      <CardDescription>{{ label }}</CardDescription>
      <CardTitle class="text-3xl">{{ value }}</CardTitle>
      <p class="text-sm text-muted-foreground">{{ hint }}</p>
    </CardHeader>
  </Card>
</template>
