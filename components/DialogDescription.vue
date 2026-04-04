<script setup lang="ts">
import { DialogDescription as DialogDescriptionRoot, type DialogDescriptionProps } from "radix-vue";
import { cn } from "~/utils/cn";

defineProps<DialogDescriptionProps>();
</script>

<template>
  <DialogDescriptionRoot :class="cn('text-sm text-muted-foreground', $attrs.class as string)">
    <slot />
  </DialogDescriptionRoot>
</template>
