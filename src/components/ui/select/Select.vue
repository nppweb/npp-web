<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    options: Array<{
      label: string;
      value: string;
      disabled?: boolean;
    }>;
    placeholder?: string;
    invalid?: boolean;
  }>(),
  {
    modelValue: "",
    placeholder: "",
    invalid: false
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

function onChange(event: Event) {
  emit("update:modelValue", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="select-wrap" :class="{ 'select-wrap--invalid': invalid }">
    <select :value="props.modelValue" class="select" v-bind="$attrs" @change="onChange">
      <option v-if="placeholder" value="" disabled hidden>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
    <span class="select-wrap__icon" aria-hidden="true">▾</span>
  </div>
</template>

<style scoped>
.select-wrap {
  position: relative;
}

.select-wrap__icon {
  position: absolute;
  top: 50%;
  right: 0.875rem;
  transform: translateY(-50%);
  color: var(--muted-foreground);
  pointer-events: none;
}

.select {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.75rem 2.25rem 0.75rem 0.875rem;
  border: 1px solid var(--input);
  border-radius: calc(var(--radius) - 2px);
  background: var(--background-elevated);
  color: var(--foreground);
  appearance: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.select:hover {
  background: var(--card);
}

.select:focus-visible {
  outline: none;
  border-color: var(--primary);
  box-shadow: var(--ring);
}

.select-wrap--invalid .select {
  border-color: color-mix(in srgb, var(--destructive) 52%, white);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--destructive) 10%, transparent);
}
</style>
