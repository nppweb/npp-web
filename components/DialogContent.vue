<script setup lang="ts">
import { X } from "lucide-vue-next";
import {
  DialogClose,
  DialogContent as DialogContentRoot,
  DialogOverlay,
  DialogPortal,
  type DialogContentProps
} from "radix-vue";
import { cn } from "~/utils/cn";

const props = defineProps<DialogContentProps>();
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-50 bg-black/55 data-[state=open]:animate-in data-[state=closed]:animate-out" />
    <DialogContentRoot
      v-bind="props"
      :class="
        cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
          $attrs.class as string
        )
      "
    >
      <slot />
      <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <X class="h-4 w-4" />
        <span class="sr-only">Закрыть</span>
      </DialogClose>
    </DialogContentRoot>
  </DialogPortal>
</template>
