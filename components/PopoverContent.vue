<script setup lang="ts">
import {
  PopoverContent as PopoverContentRoot,
  PopoverPortal,
  type PopoverContentProps
} from "radix-vue";
import { cn } from "~/utils/cn";

const props = withDefaults(defineProps<PopoverContentProps>(), {
  sideOffset: 8,
  align: "center"
});
</script>

<template>
  <PopoverPortal>
    <PopoverContentRoot
      v-bind="props"
      :side-offset="props.sideOffset"
      :align="props.align"
      :class="
        cn(
          'z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          $attrs.class as string
        )
      "
    >
      <slot />
    </PopoverContentRoot>
  </PopoverPortal>
</template>
