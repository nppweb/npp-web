<script setup lang="ts">
const sidebar = useSidebar();

onMounted(() => {
  sidebar.syncViewport();
  window.addEventListener("resize", sidebar.syncViewport);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", sidebar.syncViewport);
});
</script>

<template>
  <div class="group/sidebar-wrapper flex min-h-screen w-full bg-transparent">
    <slot />
  </div>
</template>
