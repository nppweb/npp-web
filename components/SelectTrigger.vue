<script setup lang="ts">
import { ChevronDown } from "lucide-vue-next";
import { SelectTrigger as SelectTriggerRoot, SelectIcon, type SelectTriggerProps } from "radix-vue";
import { cn } from "~/utils/cn";

withDefaults(defineProps<SelectTriggerProps>(), {
  as: "button"
});
</script>

<template>
  <SelectTriggerRoot
    :as="as"
    :as-child="asChild"
    :class="
      cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        $attrs.class as string
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="h-4 w-4 opacity-50" />
    </SelectIcon>
  </SelectTriggerRoot>
</template>
