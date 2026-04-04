<script setup lang="ts">
import { DialogTrigger as DialogTriggerRoot, type DialogTriggerProps } from "radix-vue";

const props = defineProps<DialogTriggerProps>();
</script>

<template>
  <DialogTriggerRoot v-bind="props">
    <slot />
  </DialogTriggerRoot>
</template>
