<script setup lang="ts">
import {
  DropdownMenuContent as DropdownMenuContentRoot,
  DropdownMenuPortal,
  type DropdownMenuContentProps
} from "radix-vue";
import { cn } from "~/utils/cn";

const props = withDefaults(defineProps<DropdownMenuContentProps>(), {
  sideOffset: 6
});
</script>

<template>
  <DropdownMenuPortal>
    <DropdownMenuContentRoot
      v-bind="props"
      :side-offset="props.sideOffset"
      :class="
        cn(
          'z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          $attrs.class as string
        )
      "
    >
      <slot />
    </DropdownMenuContentRoot>
  </DropdownMenuPortal>
</template>
