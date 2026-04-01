<script setup lang="ts">
import Dialog from "../dialog/Dialog.vue";
import Button from "../button/Button.vue";

withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
  }>(),
  {
    confirmLabel: "Подтвердить",
    cancelLabel: "Отмена",
    loading: false
  }
);

const emit = defineEmits<{
  (event: "confirm"): void;
  (event: "cancel"): void;
  (event: "close"): void;
  (event: "update:open", value: boolean): void;
}>();

function closeDialog() {
  emit("update:open", false);
  emit("cancel");
  emit("close");
}
</script>

<template>
  <Dialog
    :open="open"
    :title="title"
    :description="description"
    close-label="Закрыть"
    @close="closeDialog"
    @update:open="emit('update:open', $event)"
  >
    <template #actions>
      <Button type="button" variant="ghost" @click="closeDialog">
        {{ cancelLabel }}
      </Button>
      <Button type="button" variant="destructive" :disabled="loading" @click="emit('confirm')">
        {{ loading ? "Выполняется..." : confirmLabel }}
      </Button>
    </template>
  </Dialog>
</template>
