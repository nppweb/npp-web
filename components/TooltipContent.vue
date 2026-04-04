<script setup lang="ts">
import {
  TooltipContent as TooltipContentRoot,
  TooltipPortal,
  type TooltipContentProps
} from "radix-vue";
import { cn } from "~/utils/cn";

const props = withDefaults(defineProps<TooltipContentProps>(), {
  sideOffset: 6
});
</script>

<template>
  <TooltipPortal>
    <TooltipContentRoot
      v-bind="props"
      :side-offset="props.sideOffset"
      :class="
        cn(
          'z-50 overflow-hidden rounded-md border bg-primary px-3 py-1.5 text-xs text-primary-foreground shadow-md',
          $attrs.class as string
        )
      "
    >
      <slot />
    </TooltipContentRoot>
  </TooltipPortal>
</template>
