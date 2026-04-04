<script setup lang="ts">
import { TooltipProvider as TooltipProviderRoot, type TooltipProviderProps } from "radix-vue";

defineProps<TooltipProviderProps>();
</script>

<template>
  <TooltipProviderRoot>
    <slot />
  </TooltipProviderRoot>
</template>
