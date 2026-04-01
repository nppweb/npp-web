<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import UiBadge from "../ui/UiBadge.vue";
import UiButton from "../ui/UiButton.vue";
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
</script>

<template>
  <header class="app-topbar">
    <div class="app-topbar__section">
      <span class="app-topbar__eyebrow">Рабочее пространство</span>
      <strong>{{ sectionTitle }}</strong>
      <p>{{ sectionDescription }}</p>
    </div>

    <div class="app-topbar__user">
      <div class="app-topbar__user-copy">
        <strong>{{ authStore.user?.fullName }}</strong>
        <span>{{ authStore.user?.email }}</span>
      </div>
      <UiBadge tone="neutral">{{ formatRoleLabel(authStore.user?.role) }}</UiBadge>
      <UiButton
        variant="secondary"
        size="sm"
        :disabled="authStore.loggingOut"
        @click="logout"
      >
        {{ authStore.loggingOut ? "Выход..." : "Выйти" }}
      </UiButton>
    </div>
  </header>
</template>
