<script setup lang="ts">
const items = useToastState();
const toast = useToast();
</script>

<template>
  <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
    <div
      v-for="item in items"
      :key="item.id"
      class="pointer-events-auto rounded-xl border bg-background p-4 shadow-lg"
      :class="{
        'border-success/30': item.variant === 'success',
        'border-warning/30': item.variant === 'warning',
        'border-destructive/30': item.variant === 'destructive'
      }"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="space-y-1">
          <p class="text-sm font-semibold">{{ item.title }}</p>
          <p v-if="item.description" class="text-sm text-muted-foreground">
            {{ item.description }}
          </p>
        </div>
        <button class="text-xs text-muted-foreground" @click="toast.dismiss(item.id)">
          Закрыть
        </button>
      </div>
    </div>
  </div>
</template>
