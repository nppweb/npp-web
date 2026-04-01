<template>
  <caption class="table-caption">
    <slot />
  </caption>
</template>

<style scoped>
.table-caption {
  padding-top: 0.75rem;
  color: var(--muted-foreground);
  caption-side: bottom;
}
</style>
