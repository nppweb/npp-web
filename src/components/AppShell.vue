<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();

const navigation = computed(() =>
  [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Procurements", path: "/procurements" },
    { name: "Sources", path: "/sources" },
    { name: "Jobs", path: "/jobs" },
    { name: "Reports", path: "/reports" },
    authStore.isAdmin ? { name: "Users", path: "/users" } : null
  ].filter(Boolean) as Array<{ name: string; path: string }>
);

function logout() {
  authStore.logout();
  void router.push("/login");
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <p class="eyebrow">AIMSORA</p>
        <h1>Control Room</h1>
        <p class="caption">Open-source procurement intelligence</p>
      </div>

      <nav class="nav">
        <RouterLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          class="nav-link"
        >
          {{ item.name }}
        </RouterLink>
      </nav>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <p class="eyebrow">Signed in</p>
          <strong>{{ authStore.user?.fullName }}</strong>
          <span class="role-chip">{{ authStore.user?.role }}</span>
        </div>
        <button class="secondary-button" @click="logout">Log out</button>
      </header>

      <div class="page-body">
        <slot />
      </div>
    </main>
  </div>
</template>
