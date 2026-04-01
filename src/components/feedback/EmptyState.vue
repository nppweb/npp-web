<script setup lang="ts">
import Button from "../ui/button/Button.vue";

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
  <div class="state-card">
    <div class="state-card__icon" aria-hidden="true">□</div>
    <strong>{{ title }}</strong>
    <p>{{ description }}</p>
    <Button v-if="actionLabel" type="button" variant="secondary" size="sm" @click="emit('action')">
      {{ actionLabel }}
    </Button>
    <slot />
  </div>
</template>

<style scoped>
.state-card {
  padding: 1rem 0;
  display: grid;
  justify-items: start;
  gap: 0.75rem;
}

.state-card strong {
  font-size: 1rem;
}

.state-card p {
  margin: 0;
  color: var(--muted-foreground);
}

.state-card__icon {
  width: 2.5rem;
  height: 2.5rem;
  display: grid;
  place-items: center;
  border: 1px dashed var(--border);
  border-radius: 0.875rem;
  color: var(--muted-foreground);
  background: var(--muted);
}
</style>
