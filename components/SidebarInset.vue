<script setup lang="ts">
const sidebar = useSidebar();
</script>

<template>
  <div
    :class="[
      'flex min-h-screen flex-1 flex-col transition-[padding-left] duration-200',
      sidebar.isMobile.value ? 'pl-0' : sidebar.open.value ? 'lg:pl-72' : 'lg:pl-[4.5rem]'
    ]"
  >
    <slot />
  </div>
</template>
