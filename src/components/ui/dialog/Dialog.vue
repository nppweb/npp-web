<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import Button from "../button/Button.vue";

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    description?: string;
    closeLabel?: string;
  }>(),
  {
    description: "",
    closeLabel: "Закрыть"
  }
);

const emit = defineEmits<{
  (event: "close"): void;
  (event: "update:open", value: boolean): void;
}>();

function setBodyLock(locked: boolean) {
  document.body.style.overflow = locked ? "hidden" : "";
}

function closeDialog() {
  emit("update:open", false);
  emit("close");
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && props.open) {
    closeDialog();
  }
}

watch(
  () => props.open,
  (open) => {
    setBodyLock(open);

    if (open) {
      window.addEventListener("keydown", onKeydown);
      return;
    }

    window.removeEventListener("keydown", onKeydown);
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  setBodyLock(false);
  window.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="dialog" @click.self="closeDialog">
      <div class="dialog__panel" role="dialog" aria-modal="true" :aria-label="title">
        <div class="dialog__header">
          <div class="dialog__copy">
            <h3>{{ title }}</h3>
            <p v-if="description">{{ description }}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="dialog__close"
            @click="closeDialog"
          >
            {{ closeLabel }}
          </Button>
        </div>
        <div class="dialog__body">
          <slot />
        </div>
        <div v-if="$slots.actions" class="dialog__footer">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(4px);
}

.dialog__panel {
  width: min(34rem, 100%);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.dialog__header,
.dialog__body,
.dialog__footer {
  padding: 1.25rem;
}

.dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid var(--border-subtle);
}

.dialog__body {
  display: grid;
  gap: 1rem;
}

.dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.dialog__copy {
  display: grid;
  gap: 0.5rem;
}

.dialog__copy h3 {
  margin: 0;
  font-size: 1.2rem;
}

.dialog__copy p {
  margin: 0;
  color: var(--muted-foreground);
}
</style>
