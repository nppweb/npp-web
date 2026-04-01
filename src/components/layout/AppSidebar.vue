<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";
import Badge from "../ui/badge/Badge.vue";
import ScrollArea from "../ui/scroll-area/ScrollArea.vue";
import Separator from "../ui/separator/Separator.vue";
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();

const navigation = computed(() =>
  [
    { label: "Дашборд", path: "/dashboard" },
    { label: "Закупки", path: "/procurements" },
    { label: "Источники", path: "/sources" },
    { label: "Запуски", path: "/jobs" },
    { label: "Отчёты", path: "/reports" },
    authStore.isAdmin ? { label: "Пользователи", path: "/users" } : null
  ].filter(Boolean) as Array<{ label: string; path: string }>
);
</script>

<template>
  <aside class="app-sidebar">
    <div class="app-sidebar__brand">
      <span class="app-sidebar__eyebrow">AIMSORA</span>
      <strong>Система мониторинга закупок</strong>
      <p>Внутренний B2B-интерфейс для аналитики, источников, запусков и отчетности.</p>
    </div>

    <Separator />

    <ScrollArea direction="y">
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
    </ScrollArea>

    <div class="app-sidebar__footer">
      <Badge variant="outline">Внутренний контур</Badge>
      <p>Основной сценарий начинается с авторизации и ведёт сразу в рабочее пространство.</p>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar__footer {
  display: grid;
  gap: 0.75rem;
  padding: 0.5rem;
}

.app-sidebar__footer p {
  margin: 0;
  color: var(--muted-foreground);
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
