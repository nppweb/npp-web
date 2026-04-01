<template>
  <div class="tabs-list">
    <slot />
  </div>
</template>

<style scoped>
.tabs-list {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 2px);
}
</style>
