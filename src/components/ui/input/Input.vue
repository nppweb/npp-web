<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../../lib/utils/cn";

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    type?: string;
    invalid?: boolean;
  }>(),
  {
    modelValue: "",
    type: "text",
    invalid: false
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const classes = computed(() => cn("input", props.invalid && "input--invalid"));

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
}
</script>

<template>
  <input
    :class="classes"
    :value="props.modelValue"
    :type="type"
    v-bind="$attrs"
    @input="onInput"
  />
</template>

<style scoped>
.input {
  width: 100%;
  min-height: 2.75rem;
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

.input::placeholder {
  color: var(--muted-foreground);
}

.input:hover {
  background: var(--card);
}

.input:focus-visible {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--ring);
}

.input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.input--invalid {
  border-color: color-mix(in srgb, var(--destructive) 52%, white);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--destructive) 10%, transparent);
}
</style>
