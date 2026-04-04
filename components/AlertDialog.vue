<script setup lang="ts">
import { AlertDialogRoot, type AlertDialogEmits, type AlertDialogProps, useForwardPropsEmits } from "radix-vue";

defineOptions({ inheritAttrs: false });

const props = defineProps<AlertDialogProps>();
const emit = defineEmits<AlertDialogEmits>();
const forwarded = useForwardPropsEmits(props, emit);
</script>

<template>
  <AlertDialogRoot v-bind="forwarded">
    <slot />
  </AlertDialogRoot>
</template>
