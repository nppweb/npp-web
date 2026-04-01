<script setup lang="ts">
defineProps<{
  title?: string;
  description: string;
  actionLabel?: string;
}>();

const emit = defineEmits<{
  (event: "action"): void;
}>();
</script>

<template>
  <div class="ui-error-state">
    <strong>{{ title || "Не удалось загрузить данные" }}</strong>
    <p>{{ description }}</p>
    <button
      v-if="actionLabel"
      type="button"
      class="ui-button is-secondary is-sm"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
