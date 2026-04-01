<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import Button from "../button/Button.vue";

type DropdownItem = {
  label: string;
  hint?: string;
  disabled?: boolean;
  destructive?: boolean;
  onSelect?: () => void | Promise<void>;
};

const props = withDefaults(
  defineProps<{
    items: DropdownItem[];
    align?: "start" | "end";
    label?: string;
  }>(),
  {
    align: "end",
    label: "Открыть меню"
  }
);

const root = ref<HTMLElement | null>(null);
const open = ref(false);

const contentClasses = computed(() => ["dropdown-menu__content", `is-${props.align}`]);

function closeMenu() {
  open.value = false;
}

function toggleMenu() {
  open.value = !open.value;
}

async function selectItem(item: DropdownItem) {
  if (item.disabled) {
    return;
  }

  await item.onSelect?.();
  closeMenu();
}

function handleClickOutside(event: MouseEvent) {
  if (!root.value?.contains(event.target as Node)) {
    closeMenu();
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

onMounted(() => {
  window.addEventListener("click", handleClickOutside);
  window.addEventListener("keydown", handleKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("click", handleClickOutside);
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div ref="root" class="dropdown-menu">
    <div class="dropdown-menu__trigger" @click.stop="toggleMenu">
      <slot name="trigger" :open="open">
        <Button type="button" variant="outline" size="sm" :aria-label="label">Меню</Button>
      </slot>
    </div>

    <div v-if="open" :class="contentClasses">
      <button
        v-for="item in items"
        :key="item.label"
        type="button"
        class="dropdown-menu__item"
        :class="{ 'is-destructive': item.destructive }"
        :disabled="item.disabled"
        @click="selectItem(item)"
      >
        <span>{{ item.label }}</span>
        <small v-if="item.hint">{{ item.hint }}</small>
      </button>
    </div>
  </div>
</template>

<style scoped>
.dropdown-menu {
  position: relative;
}

.dropdown-menu__content {
  position: absolute;
  top: calc(100% + 0.5rem);
  z-index: 40;
  min-width: 14rem;
  padding: 0.5rem;
  display: grid;
  gap: 0.25rem;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: calc(var(--radius) + 2px);
  box-shadow: var(--shadow-md);
}

.dropdown-menu__content.is-start {
  left: 0;
}

.dropdown-menu__content.is-end {
  right: 0;
}

.dropdown-menu__item {
  width: 100%;
  padding: 0.75rem;
  display: grid;
  gap: 0.25rem;
  justify-items: start;
  border: 0;
  border-radius: calc(var(--radius) - 4px);
  background: transparent;
  color: var(--foreground);
  text-align: left;
  cursor: pointer;
}

.dropdown-menu__item:hover:not(:disabled),
.dropdown-menu__item:focus-visible {
  outline: none;
  background: var(--accent);
}

.dropdown-menu__item small {
  color: var(--muted-foreground);
}

.dropdown-menu__item.is-destructive {
  color: var(--destructive);
}

.dropdown-menu__item:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
