<script setup lang="ts">
import AppSidebar from "./layout/AppSidebar.vue";
import AppTopbar from "./layout/AppTopbar.vue";
</script>

<template>
  <div class="app-shell">
    <AppSidebar />
    <main class="app-shell__content">
      <AppTopbar />
      <div class="app-shell__body">
        <slot />
      </div>
    </main>
  </div>
</template>
