<script setup lang="ts">
import { cn } from "~/utils/cn";

withDefaults(
  defineProps<{
    modelValue?: string;
    invalid?: boolean;
  }>(),
  {
    modelValue: "",
    invalid: false
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <textarea
    :value="modelValue"
    :class="
      cn(
        'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-destructive focus-visible:ring-destructive',
        $attrs.class as string
      )
    "
    @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
