<script setup lang="ts">
import { Label as LabelRoot, type LabelProps } from "radix-vue";
import { cn } from "~/utils/cn";

withDefaults(defineProps<LabelProps>(), {
  as: "label"
});
</script>

<template>
  <LabelRoot
    :as="as"
    :as-child="asChild"
    :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', $attrs.class as string)"
  >
    <slot />
  </LabelRoot>
</template>
