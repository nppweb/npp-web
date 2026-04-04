<script setup lang="ts">
import { cn } from "~/utils/cn";

const props = withDefaults(
  defineProps<{
    side?: "left" | "right";
  }>(),
  {
    side: "left"
  }
);

const sidebar = useSidebar();
</script>

<template>
  <div v-if="sidebar.isMobile.value && sidebar.openMobile.value" class="fixed inset-0 z-40 bg-black/40 lg:hidden" @click="sidebar.closeMobileSidebar()" />
  <aside
    :class="
      cn(
        'fixed inset-y-0 z-50 border-r bg-sidebar text-sidebar-foreground transition-all duration-200',
        props.side === 'left' ? 'left-0' : 'right-0 border-l border-r-0',
        sidebar.isMobile.value ? 'flex' : 'hidden lg:flex lg:flex-col',
        sidebar.open.value ? 'w-72' : 'w-[4.5rem]',
        sidebar.isMobile.value
          ? cn('flex w-[18rem]', sidebar.openMobile.value ? 'translate-x-0' : '-translate-x-full')
          : 'translate-x-0',
        $attrs.class as string
      )
    "
  >
    <slot />
  </aside>
</template>
