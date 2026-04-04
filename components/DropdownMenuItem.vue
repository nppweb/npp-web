<script setup lang="ts">
import { DropdownMenuItem as DropdownMenuItemRoot, type DropdownMenuItemProps } from "radix-vue";
import { cn } from "~/utils/cn";

const props = withDefaults(
  defineProps<
    DropdownMenuItemProps & {
      destructive?: boolean;
    }
  >(),
  {
    destructive: false
  }
);

const forwarded = computed(() => {
  const { destructive, ...rest } = props;
  return rest;
});
</script>

<template>
  <DropdownMenuItemRoot
    v-bind="forwarded"
    :class="
      cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.destructive && 'text-destructive focus:text-destructive',
        $attrs.class as string
      )
    "
  >
    <slot />
  </DropdownMenuItemRoot>
</template>
