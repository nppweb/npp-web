<script setup lang="ts">
import { Separator as SeparatorRoot, type SeparatorProps } from "radix-vue";
import { cn } from "~/utils/cn";

withDefaults(defineProps<SeparatorProps>(), {
  orientation: "horizontal",
  decorative: true
});
</script>

<template>
  <SeparatorRoot
    :decorative="decorative"
    :orientation="orientation"
    :class="
      cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        $attrs.class as string
      )
    "
  />
</template>
