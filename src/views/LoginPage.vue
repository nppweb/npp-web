<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const email = ref("admin@aimsora.local");
const password = ref("");
const error = ref("");
const router = useRouter();
const authStore = useAuthStore();

async function submit() {
  error.value = "";
  try {
    await authStore.login(email.value, password.value);
    await router.push("/dashboard");
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to authenticate";
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-panel">
      <p class="eyebrow">AIMSORA</p>
      <h1>Monitoring operations for procurement teams</h1>
      <p class="lead">
        Search procurements, inspect ingest jobs, validate source health and keep
        analysts aligned on a single operational view.
      </p>

      <form class="login-form" @submit.prevent="submit">
        <label>
          Email
          <input v-model="email" type="email" autocomplete="username" />
        </label>
        <label>
          Password
          <input v-model="password" type="password" autocomplete="current-password" />
        </label>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button class="primary-button" :disabled="authStore.loading">
          {{ authStore.loading ? "Signing in..." : "Sign in" }}
        </button>
      </form>
    </div>
  </div>
</template>
