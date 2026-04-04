<script setup lang="ts">
import { AvatarFallback, AvatarImage, AvatarRoot } from "radix-vue";
import { cn } from "~/utils/cn";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    fallback?: string;
    size?: "sm" | "default" | "lg";
  }>(),
  {
    src: "",
    alt: "",
    fallback: "",
    size: "default"
  }
);

const sizeClasses = {
  sm: "h-8 w-8",
  default: "h-10 w-10",
  lg: "h-12 w-12"
};

const initials = computed(() =>
  props.fallback
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
);
</script>

<template>
  <AvatarRoot
    :class="
      cn(
        'relative flex shrink-0 overflow-hidden rounded-full',
        sizeClasses[props.size],
        $attrs.class as string
      )
    "
  >
    <AvatarImage
      v-if="props.src"
      :src="props.src"
      :alt="props.alt"
      class="aspect-square h-full w-full object-cover"
    />
    <AvatarFallback class="flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
      {{ initials || "AI" }}
    </AvatarFallback>
  </AvatarRoot>
</template>
