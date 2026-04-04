<script setup lang="ts">
import { AlertDialogTrigger, type AlertDialogTriggerProps } from "radix-vue";

defineProps<AlertDialogTriggerProps>();
</script>

<template>
  <AlertDialogTrigger>
    <slot />
  </AlertDialogTrigger>
</template>
