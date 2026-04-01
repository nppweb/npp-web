<script setup lang="ts">
withDefaults(
  defineProps<{
    lines?: number;
    dense?: boolean;
  }>(),
  {
    lines: 1,
    dense: false
  }
);
</script>

<template>
  <div class="skeleton" :class="{ 'skeleton--dense': dense }">
    <span v-for="line in lines" :key="line" class="skeleton__line" />
  </div>
</template>

<style scoped>
.skeleton {
  display: grid;
  gap: 0.75rem;
}

.skeleton__line {
  height: 0.875rem;
  border-radius: 999px;
  background: linear-gradient(90deg, #eef2f6 20%, #f8fafb 50%, #eef2f6 80%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.45s linear infinite;
}

.skeleton__line:last-child {
  width: 72%;
}

.skeleton--dense {
  gap: 0.5rem;
}

.skeleton--dense .skeleton__line {
  height: 0.625rem;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
