<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();

const navigation = computed(() =>
  [
    { label: "Дашборд", path: "/dashboard" },
    { label: "Закупки", path: "/procurements" },
    { label: "Источники", path: "/sources" },
    { label: "Запуски", path: "/jobs" },
    { label: "Отчеты", path: "/reports" },
    authStore.isAdmin ? { label: "Пользователи", path: "/users" } : null
  ].filter(Boolean) as Array<{ label: string; path: string }>
);
</script>

<template>
  <aside class="app-sidebar">
    <div class="app-sidebar__brand">
      <span class="app-sidebar__eyebrow">AIMSORA</span>
      <strong>Платформа мониторинга закупок</strong>
      <p>Внутренний контур аналитики, источников и операционных запусков.</p>
    </div>

    <nav class="app-sidebar__nav">
      <RouterLink
        v-for="item in navigation"
        :key="item.path"
        :to="item.path"
        class="app-sidebar__link"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
