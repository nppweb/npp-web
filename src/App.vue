<script setup lang="ts">
import SiteFooter from "./components/SiteFooter.vue";
import SiteHeader from "./components/SiteHeader.vue";
import HomePage from "./pages/HomePage.vue";
</script>

<template>
  <div class="app-shell">
    <SiteHeader />

    <main class="main-content">
      <HomePage />
    </main>

    <SiteFooter />
  </div>
</template>
