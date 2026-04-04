<script setup lang="ts">
import { AlertTriangle } from "lucide-vue-next";

withDefaults(
  defineProps<{
    title?: string;
    description: string;
    actionLabel?: string;
  }>(),
  {
    title: "Не удалось загрузить данные",
    actionLabel: ""
  }
);

const emit = defineEmits<{
  (event: "action"): void;
}>();
</script>

<template>
  <div class="flex flex-col items-start gap-4 rounded-xl border bg-destructive/5 p-8 text-left">
    <div class="rounded-lg bg-destructive/10 p-2 text-destructive">
      <AlertTriangle class="h-5 w-5" />
    </div>
    <div class="space-y-1">
      <h3 class="text-base font-semibold text-destructive">{{ title }}</h3>
      <p class="max-w-xl text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <Button v-if="actionLabel" variant="outline" size="sm" @click="emit('action')">
      {{ actionLabel }}
    </Button>
    <slot />
  </div>
</template>
