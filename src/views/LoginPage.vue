<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import Card from "../components/ui/card/Card.vue";
import Button from "../components/ui/button/Button.vue";
import Input from "../components/ui/input/Input.vue";
import Label from "../components/ui/label/Label.vue";
import Separator from "../components/ui/separator/Separator.vue";
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

function normalizeLoginError(message: string) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("invalid email or password") ||
    normalized.includes("unauthorized")
  ) {
    return "Неверная электронная почта или пароль. Проверьте данные и попробуйте снова.";
  }

  if (normalized.includes("network")) {
    return "Не удалось связаться с сервером. Проверьте доступность API и повторите попытку.";
  }

  return message;
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
    error.value = normalizeLoginError(
      caught instanceof Error ? caught.message : "Не удалось выполнить вход"
    );
  }
}
</script>

<template>
  <div class="login-screen">
    <div class="login-screen__grid">
      <section class="login-screen__column login-aside">
        <span class="login-aside__eyebrow">AIMSORA</span>
        <h1>Платформа мониторинга закупок</h1>
        <p>
          Единая внутренняя система для контроля источников, закупок, запусков и отчетов.
          Спокойный рабочий интерфейс без лишнего шума.
        </p>

        <div class="login-aside__facts">
          <div class="login-aside__fact">
            <strong>Единый вход</strong>
            <p>После авторизации приложение сразу открывает рабочий дашборд.</p>
          </div>
          <div class="login-aside__fact">
            <strong>Защищённый контур</strong>
            <p>Все внутренние разделы доступны только после успешной аутентификации.</p>
          </div>
        </div>
      </section>

      <Card class="login-panel">
        <div class="login-panel__brand">
          <span>Вход</span>
          <strong>AIMSORA</strong>
        </div>

        <div class="login-panel__intro">
          <h2>Авторизация в системе</h2>
          <p>Введите рабочие учетные данные, чтобы перейти в защищенный интерфейс.</p>
        </div>

        <Separator />

        <div v-if="isDemoMode" class="login-demo">
          <div>
            <strong>Тестовый доступ для локальной среды</strong>
            <p>admin@admin.ru / admin</p>
          </div>
          <Button type="button" variant="secondary" size="sm" @click="fillDemoCredentials">
            Подставить
          </Button>
        </div>

        <form class="login-panel__form" @submit.prevent="submit">
          <label class="field">
            <div class="field__copy">
              <Label for="email">Электронная почта</Label>
            </div>
            <Input
              id="email"
              v-model="email"
              type="email"
              autocomplete="username"
              placeholder="name@company.ru"
              :invalid="Boolean(error)"
              required
            />
          </label>

          <label class="field">
            <div class="field__copy">
              <Label for="password">Пароль</Label>
            </div>
            <Input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="Введите пароль"
              :invalid="Boolean(error)"
              required
            />
          </label>

          <div v-if="error" class="login-error" role="alert">
            <strong>Ошибка входа</strong>
            <p>{{ error }}</p>
          </div>

          <Button type="submit" block :disabled="authStore.loading">
            {{ authStore.loading ? "Выполняется вход..." : "Войти" }}
          </Button>
        </form>
      </Card>
    </div>
  </div>
</template>
