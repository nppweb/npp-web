<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../../lib/utils/cn";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    invalid?: boolean;
    resize?: "vertical" | "none";
  }>(),
  {
    modelValue: "",
    invalid: false,
    resize: "vertical"
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const classes = computed(() =>
  cn("textarea", props.invalid && "textarea--invalid", `textarea--${props.resize}`)
);

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLTextAreaElement).value);
}
</script>

<template>
  <textarea :class="classes" :value="props.modelValue" v-bind="$attrs" @input="onInput" />
</template>

<style scoped>
.textarea {
  width: 100%;
  min-height: 6.5rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid var(--input);
  border-radius: calc(var(--radius) - 2px);
  background: var(--background-elevated);
  color: var(--foreground);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.textarea:hover {
  background: var(--card);
}

.textarea:focus-visible {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--ring);
}

.textarea--none {
  resize: none;
}

.textarea--vertical {
  resize: vertical;
}

.textarea--invalid {
  border-color: color-mix(in srgb, var(--destructive) 52%, white);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--destructive) 10%, transparent);
}
</style>
