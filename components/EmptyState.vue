<script setup lang="ts">
import { Inbox } from "lucide-vue-next";

withDefaults(
  defineProps<{
    title: string;
    description: string;
    actionLabel?: string;
  }>(),
  {
    actionLabel: ""
  }
);

const emit = defineEmits<{
  (event: "action"): void;
}>();
</script>

<template>
  <div class="flex flex-col items-start gap-4 rounded-xl border border-dashed bg-muted/30 p-8 text-left">
    <div class="rounded-lg border bg-background p-2 text-muted-foreground">
      <Inbox class="h-5 w-5" />
    </div>
    <div class="space-y-1">
      <h3 class="text-base font-semibold">{{ title }}</h3>
      <p class="max-w-xl text-sm text-muted-foreground">{{ description }}</p>
    </div>
    <Button v-if="actionLabel" variant="secondary" size="sm" @click="emit('action')">
      {{ actionLabel }}
    </Button>
    <slot />
  </div>
</template>
