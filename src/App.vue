<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppShell from "./components/layout/AppShell.vue";
import Toaster from "./components/ui/toast/Toaster.vue";

const route = useRoute();
const isPublicRoute = computed(() => route.meta.public === true);
</script>

<template>
  <router-view v-if="isPublicRoute" />
  <AppShell v-else>
    <router-view />
  </AppShell>
  <Toaster />
</template>
