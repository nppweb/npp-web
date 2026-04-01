<template>
  <label class="label" v-bind="$attrs">
    <slot />
  </label>
</template>

<style scoped>
.label {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--foreground);
  font-size: 0.875rem;
  font-weight: 600;
}
</style>
