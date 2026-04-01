<script setup lang="ts">
import { computed, inject } from "vue";
import { tabsContextKey } from "./context";

const props = defineProps<{
  value: string;
  disabled?: boolean;
}>();

const tabs =
  inject(tabsContextKey) ??
  (() => {
    throw new Error("TabsTrigger должен использоваться внутри Tabs");
  })();

const active = computed(() => tabs.currentValue.value === props.value);

function onClick() {
  if (!props.disabled) {
    tabs.setValue(props.value);
  }
}
</script>

<template>
  <button
    type="button"
    class="tabs-trigger"
    :class="{ 'is-active': active }"
    :disabled="disabled"
    @click="onClick"
  >
    <slot />
  </button>
</template>

<style scoped>
.tabs-trigger {
  min-height: 2.25rem;
  padding: 0 0.875rem;
  border: 0;
  border-radius: calc(var(--radius) - 4px);
  background: transparent;
  color: var(--muted-foreground);
  font-weight: 600;
  cursor: pointer;
}

.tabs-trigger.is-active {
  background: var(--card);
  color: var(--foreground);
  box-shadow: var(--shadow-sm);
}

.tabs-trigger:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
