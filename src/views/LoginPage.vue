<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiErrorState from "../components/ui/UiErrorState.vue";
import UiInput from "../components/ui/UiInput.vue";
import { useAuthStore } from "../stores/auth";

const email = ref("");
const password = ref("");
const error = ref("");
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const isDemoMode = computed(
  () =>
    import.meta.env.DEV ||
    ["localhost", "127.0.0.1"].includes(window.location.hostname)
);

function fillDemoCredentials() {
  email.value = "admin@admin.ru";
  password.value = "admin";
}

async function submit() {
  error.value = "";
  try {
    await authStore.login(email.value, password.value);
    const redirect =
      typeof route.query.redirect === "string" && route.query.redirect.length > 0
        ? route.query.redirect
        : "/dashboard";
    await router.push(redirect);
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось выполнить вход";
  }
}
</script>

<template>
  <div class="login-page">
    <UiCard class="login-panel">
      <div class="login-panel__brand">
        <span>AIMSORA</span>
        <strong>Платформа мониторинга закупок</strong>
      </div>
      <h1>Вход в платформу</h1>
      <p class="login-panel__lead">
        Войдите под своей учетной записью, чтобы открыть дашборд, закупки, источники,
        запуски и административные разделы.
      </p>

      <div v-if="isDemoMode" class="login-panel__dev-hint">
        <div>
          <strong>Демо-учетные данные для локальной среды</strong>
          <p>admin@admin.ru / admin</p>
        </div>
        <UiButton type="button" variant="secondary" size="sm" @click="fillDemoCredentials">
          Подставить
        </UiButton>
      </div>

      <form class="form-grid" @submit.prevent="submit">
        <UiInput
          v-model="email"
          label="Email"
          type="email"
          autocomplete="username"
          placeholder="name@company.ru"
          required
        />
        <UiInput
          v-model="password"
          label="Пароль"
          type="password"
          autocomplete="current-password"
          placeholder="Введите пароль"
          required
        />
        <UiErrorState v-if="error" title="Ошибка входа" :description="error" />
        <UiButton type="submit" block :disabled="authStore.loading">
          {{ authStore.loading ? "Выполняется вход..." : "Войти" }}
        </UiButton>
      </form>
    </UiCard>
  </div>
</template>
