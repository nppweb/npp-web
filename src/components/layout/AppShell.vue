<script setup lang="ts">
import AppSidebar from "./AppSidebar.vue";
import AppTopbar from "./AppTopbar.vue";
</script>

<template>
  <div class="shell-root">
    <div class="app-shell">
      <AppSidebar />
      <main class="app-shell__content">
        <AppTopbar />
        <div class="app-shell__body">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
