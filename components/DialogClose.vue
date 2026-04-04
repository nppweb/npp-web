<script setup lang="ts">
import { DialogClose as DialogCloseRoot, type DialogCloseProps } from "radix-vue";

const props = defineProps<DialogCloseProps>();
</script>

<template>
  <DialogCloseRoot v-bind="props">
    <slot />
  </DialogCloseRoot>
</template>
