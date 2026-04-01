<template>
  <div class="table-wrap">
    <table class="table">
      <slot />
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.table {
  width: 100%;
  min-width: 720px;
  border-collapse: collapse;
}

.table :deep(th),
.table :deep(td) {
  padding: 0.875rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
  vertical-align: top;
}

.table :deep(th) {
  color: var(--muted-foreground);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.table :deep(tbody tr:hover) {
  background: var(--accent);
}
</style>
