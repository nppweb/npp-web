<script setup lang="ts">
import { computed } from "vue";
import { cn } from "../../../lib/utils/cn";

const props = withDefaults(
  defineProps<{
    src?: string;
    alt?: string;
    fallback?: string;
    size?: "sm" | "md" | "lg";
  }>(),
  {
    src: "",
    alt: "",
    fallback: "",
    size: "md"
  }
);

const initials = computed(() =>
  (props.fallback || props.alt || "A")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
);

const classes = computed(() => cn("avatar", `avatar--${props.size}`));
</script>

<template>
  <div :class="classes">
    <img v-if="src" :src="src" :alt="alt" class="avatar__image" />
    <span v-else class="avatar__fallback">{{ initials }}</span>
  </div>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 999px;
  background: color-mix(in srgb, var(--primary) 12%, white);
  color: var(--primary);
  font-weight: 700;
}

.avatar--sm {
  width: 2rem;
  height: 2rem;
  font-size: 0.75rem;
}

.avatar--md {
  width: 2.5rem;
  height: 2.5rem;
  font-size: 0.875rem;
}

.avatar--lg {
  width: 3rem;
  height: 3rem;
  font-size: 1rem;
}

.avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
