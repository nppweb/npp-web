<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    label?: string;
    hint?: string;
    type?: string;
    placeholder?: string;
    autocomplete?: string;
  }>(),
  {
    modelValue: "",
    label: "",
    hint: "",
    type: "text",
    placeholder: "",
    autocomplete: ""
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

function onInput(event: Event) {
  emit("update:modelValue", (event.target as HTMLInputElement).value);
}
</script>

<template>
  <label class="ui-field">
    <span v-if="label" class="ui-field__label">{{ label }}</span>
    <input
      class="ui-input"
      :value="props.modelValue"
      :type="type"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      v-bind="$attrs"
      @input="onInput"
    />
    <span v-if="hint" class="ui-field__hint">{{ hint }}</span>
  </label>
</template>
