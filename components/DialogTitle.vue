<script setup lang="ts">
import { DialogTitle as DialogTitleRoot, type DialogTitleProps } from "radix-vue";
import { cn } from "~/utils/cn";

defineProps<DialogTitleProps>();
</script>

<template>
  <DialogTitleRoot :class="cn('text-lg font-semibold leading-none tracking-tight', $attrs.class as string)">
    <slot />
  </DialogTitleRoot>
</template>
