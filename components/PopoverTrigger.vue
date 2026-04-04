<script setup lang="ts">
import { PopoverTrigger as PopoverTriggerRoot, type PopoverTriggerProps } from "radix-vue";

const props = defineProps<PopoverTriggerProps>();
</script>

<template>
  <PopoverTriggerRoot v-bind="props">
    <slot />
  </PopoverTriggerRoot>
</template>
