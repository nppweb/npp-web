<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Avatar from "../ui/avatar/Avatar.vue";
import Badge from "../ui/badge/Badge.vue";
import Button from "../ui/button/Button.vue";
import DropdownMenu from "../ui/dropdown-menu/DropdownMenu.vue";
import { useAuthStore } from "../../stores/auth";
import { formatRoleLabel } from "../../lib/format";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const sectionTitle = computed(() =>
  typeof route.meta.title === "string" ? route.meta.title : "AIMSORA"
);

const sectionDescription = computed(() =>
  typeof route.meta.description === "string" ? route.meta.description : ""
);

async function logout() {
  await authStore.logout();
  await router.push("/login");
}

const menuItems = computed(() => [
  {
    label: authStore.loggingOut ? "Выход выполняется..." : "Выйти",
    hint: "Завершить текущую сессию",
    destructive: true,
    disabled: authStore.loggingOut,
    onSelect: logout
  }
]);
</script>

<template>
  <header class="app-topbar">
    <div class="app-topbar__section">
      <span class="app-topbar__eyebrow">Рабочее пространство</span>
      <strong>{{ sectionTitle }}</strong>
      <p>{{ sectionDescription }}</p>
    </div>

    <div class="app-topbar__user">
      <Avatar :fallback="authStore.user?.fullName || 'AIMSORA'" />
      <div class="app-topbar__user-summary app-topbar__user-copy">
        <strong>{{ authStore.user?.fullName || "Пользователь" }}</strong>
        <span>{{ authStore.user?.email }}</span>
      </div>
      <Badge variant="secondary">{{ formatRoleLabel(authStore.user?.role) }}</Badge>
      <DropdownMenu :items="menuItems" label="Открыть меню пользователя">
        <template #trigger>
          <Button type="button" variant="outline" size="sm">Меню</Button>
        </template>
      </DropdownMenu>
    </div>
  </header>
</template>
