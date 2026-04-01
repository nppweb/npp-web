<script setup lang="ts">
import { dismissToast, useToastState } from "../../../lib/utils/toast";

const state = useToastState();
</script>

<template>
  <div class="toaster" aria-live="polite" aria-atomic="true">
    <article
      v-for="item in state.items"
      :key="item.id"
      class="toast"
      :class="`toast--${item.variant}`"
    >
      <div class="toast__copy">
        <strong>{{ item.title }}</strong>
        <p v-if="item.description">{{ item.description }}</p>
      </div>
      <button type="button" class="toast__close" @click="dismissToast(item.id)">Закрыть</button>
    </article>
  </div>
</template>

<style scoped>
.toaster {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 80;
  display: grid;
  gap: 0.75rem;
}

.toast {
  width: min(24rem, calc(100vw - 2.5rem));
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card);
  box-shadow: var(--shadow-md);
}

.toast--success {
  border-color: color-mix(in srgb, var(--success) 24%, white);
}

.toast--warning {
  border-color: color-mix(in srgb, var(--warning) 24%, white);
}

.toast--destructive {
  border-color: color-mix(in srgb, var(--destructive) 24%, white);
}

.toast__copy {
  display: grid;
  gap: 0.35rem;
}

.toast__copy strong,
.toast__copy p {
  margin: 0;
}

.toast__copy p {
  color: var(--muted-foreground);
}

.toast__close {
  border: 0;
  background: transparent;
  color: var(--muted-foreground);
  cursor: pointer;
}
</style>
