<script setup lang="ts">
import { cn } from "~/utils/cn";

withDefaults(
  defineProps<{
    modelValue?: string | number;
    invalid?: boolean;
    type?: string;
  }>(),
  {
    modelValue: "",
    invalid: false,
    type: "text"
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <input
    :value="modelValue"
    :type="type"
    :class="
      cn(
        'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        invalid && 'border-destructive focus-visible:ring-destructive',
        $attrs.class as string
      )
    "
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
