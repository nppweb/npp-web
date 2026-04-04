<script setup lang="ts">
import { X } from "lucide-vue-next";
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, type DialogContentProps } from "radix-vue";
import { cn } from "~/utils/cn";

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      side?: "left" | "right";
    }
  >(),
  {
    side: "left"
  }
);

const forwarded = computed(() => {
  const { side, ...rest } = props;
  return rest;
});
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-black/50" />
    <DialogContent
      v-bind="forwarded"
      :class="
        cn(
          'fixed z-50 h-full w-[88%] max-w-sm gap-4 border bg-background p-6 shadow-lg',
          props.side === 'left' ? 'left-0 top-0 border-r' : 'right-0 top-0 border-l',
          $attrs.class as string
        )
      "
    >
      <slot />
      <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100">
        <X class="h-4 w-4" />
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
