<script setup lang="ts">
type SelectOption = {
  label: string;
  value: string;
};

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    options: SelectOption[];
  }>(),
  {
    modelValue: "",
    label: ""
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
  <label class="ui-field">
    <span v-if="label" class="ui-field__label">{{ label }}</span>
    <select
      class="ui-select"
      :value="props.modelValue"
      v-bind="$attrs"
      @change="onChange"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
