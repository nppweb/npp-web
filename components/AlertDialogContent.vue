<script setup lang="ts">
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle } from "radix-vue";
import { cn } from "~/utils/cn";

withDefaults(
  defineProps<{
    title: string;
    description: string;
    cancelLabel?: string;
    actionLabel?: string;
  }>(),
  {
    cancelLabel: "Отмена",
    actionLabel: "Подтвердить"
  }
);

const emit = defineEmits<{
  (event: "action"): void;
}>();
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay class="fixed inset-0 z-50 bg-black/55" />
    <AlertDialogContent
      :class="
        cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border bg-background p-6 shadow-lg',
          $attrs.class as string
        )
      "
    >
      <div class="flex flex-col space-y-2 text-center sm:text-left">
        <AlertDialogTitle class="text-lg font-semibold">{{ title }}</AlertDialogTitle>
        <AlertDialogDescription class="text-sm text-muted-foreground">
          {{ description }}
        </AlertDialogDescription>
      </div>
      <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <AlertDialogCancel as-child>
          <Button variant="outline">{{ cancelLabel }}</Button>
        </AlertDialogCancel>
        <AlertDialogAction as-child>
          <Button variant="destructive" @click="emit('action')">{{ actionLabel }}</Button>
        </AlertDialogAction>
      </div>
    </AlertDialogContent>
  </AlertDialogPortal>
</template>
