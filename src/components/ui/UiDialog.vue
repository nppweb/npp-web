<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  description?: string;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();
</script>

<template>
  <div v-if="open" class="ui-dialog" @click.self="emit('close')">
    <div class="ui-dialog__panel">
      <div class="ui-dialog__header">
        <div>
          <h3>{{ title }}</h3>
          <p v-if="description">{{ description }}</p>
        </div>
        <button type="button" class="ui-dialog__close" @click="emit('close')">Закрыть</button>
      </div>
      <div class="ui-dialog__body">
        <slot />
      </div>
    </div>
  </div>
</template>
