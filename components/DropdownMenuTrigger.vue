<script setup lang="ts">
import { DropdownMenuTrigger as DropdownMenuTriggerRoot, type DropdownMenuTriggerProps } from "radix-vue";

const props = defineProps<DropdownMenuTriggerProps>();
</script>

<template>
  <DropdownMenuTriggerRoot v-bind="props">
    <slot />
  </DropdownMenuTriggerRoot>
</template>
