<script setup lang="ts">
import { DropdownMenuLabel as DropdownMenuLabelRoot, type DropdownMenuLabelProps } from "radix-vue";
import { cn } from "~/utils/cn";

defineProps<DropdownMenuLabelProps>();
</script>

<template>
  <DropdownMenuLabelRoot :class="cn('px-2 py-1.5 text-sm font-semibold', $attrs.class as string)">
    <slot />
  </DropdownMenuLabelRoot>
</template>
