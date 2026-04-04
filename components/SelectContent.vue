<script setup lang="ts">
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import {
  SelectContent as SelectContentRoot,
  SelectPortal,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectViewport,
  type SelectContentProps
} from "radix-vue";
import { cn } from "~/utils/cn";

const props = withDefaults(defineProps<SelectContentProps>(), {
  position: "popper"
});
</script>

<template>
  <SelectPortal>
    <SelectContentRoot
      v-bind="props"
      :class="
        cn(
          'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out',
          $attrs.class as string
        )
      "
    >
      <SelectScrollUpButton class="flex cursor-default items-center justify-center py-1">
        <ChevronUp class="h-4 w-4" />
      </SelectScrollUpButton>
      <SelectViewport class="p-1">
        <slot />
      </SelectViewport>
      <SelectScrollDownButton class="flex cursor-default items-center justify-center py-1">
        <ChevronDown class="h-4 w-4" />
      </SelectScrollDownButton>
    </SelectContentRoot>
  </SelectPortal>
</template>
