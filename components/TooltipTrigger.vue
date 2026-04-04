<script setup lang="ts">
import { TooltipTrigger as TooltipTriggerRoot, type TooltipTriggerProps } from "radix-vue";

const props = defineProps<TooltipTriggerProps>();
</script>

<template>
  <TooltipTriggerRoot v-bind="props">
    <slot />
  </TooltipTriggerRoot>
</template>
