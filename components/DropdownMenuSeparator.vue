<script setup lang="ts">
import {
  DropdownMenuSeparator as DropdownMenuSeparatorRoot,
  type DropdownMenuSeparatorProps
} from "radix-vue";
import { cn } from "~/utils/cn";

defineProps<DropdownMenuSeparatorProps>();
</script>

<template>
  <DropdownMenuSeparatorRoot :class="cn('-mx-1 my-1 h-px bg-muted', $attrs.class as string)" />
</template>
