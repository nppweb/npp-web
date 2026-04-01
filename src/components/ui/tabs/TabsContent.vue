<script setup lang="ts">
import { computed, inject } from "vue";
import { tabsContextKey } from "./context";

const props = defineProps<{
  value: string;
}>();

const tabs =
  inject(tabsContextKey) ??
  (() => {
    throw new Error("TabsContent должен использоваться внутри Tabs");
  })();

const active = computed(() => tabs.currentValue.value === props.value);
</script>

<template>
  <div v-show="active" class="tabs-content">
    <slot />
  </div>
</template>

<style scoped>
.tabs-content {
  padding-top: 1rem;
}
</style>
