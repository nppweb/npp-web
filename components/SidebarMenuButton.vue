<script setup lang="ts">
import { Primitive, type PrimitiveProps } from "radix-vue";
import { cn } from "~/utils/cn";

const props = withDefaults(
  defineProps<
    PrimitiveProps & {
      isActive?: boolean;
    }
  >(),
  {
    as: "button",
    isActive: false
  }
);

const sidebar = useSidebar();
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    :class="
      cn(
        'group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        props.isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
        !sidebar.open.value && !sidebar.isMobile.value && 'justify-center px-0',
        $attrs.class as string
      )
    "
  >
    <slot :collapsed="!sidebar.open.value && !sidebar.isMobile.value" />
  </Primitive>
</template>
