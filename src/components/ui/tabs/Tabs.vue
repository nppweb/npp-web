<script setup lang="ts">
import { provide, ref, watch } from "vue";
import { tabsContextKey } from "./context";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    defaultValue?: string;
  }>(),
  {
    modelValue: undefined,
    defaultValue: ""
  }
);

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const currentValue = ref(props.modelValue ?? props.defaultValue);

watch(
  () => props.modelValue,
  (value) => {
    if (value !== undefined) {
      currentValue.value = value;
    }
  }
);

function setValue(value: string) {
  currentValue.value = value;
  emit("update:modelValue", value);
}

provide(tabsContextKey, {
  currentValue,
  setValue
});
</script>

<template>
  <div class="tabs">
    <slot />
  </div>
</template>
