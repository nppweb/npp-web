<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { siteMeta } from "../content/siteContent";
import { type ActivityView, fetchLatestPushActivity } from "../lib/githubActivity";

const MOSCOW_TIMEZONE = "Europe/Moscow";
const CACHE_KEY = "aimsora-github-activity-cache-v1";
const CACHE_TTL_MS = 5 * 60 * 1000;

const isLoading = ref(true);
const errorText = ref("");
const activity = ref<ActivityView | null>(null);
const nowMs = ref(Date.now());
let timer: number | undefined;

const absoluteMoscowTime = computed(() => {
  if (!activity.value) {
    return "";
  }

  const date = new Date(activity.value.createdAt);
  return `${new Intl.DateTimeFormat("ru-RU", {
    timeZone: MOSCOW_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)} МСК`;
});

const relativeMoscowTime = computed(() => {
  if (!activity.value) {
    return "";
  }

  return formatRelativeTime(activity.value.createdAt, nowMs.value);
});

async function loadActivity() {
  isLoading.value = true;
  errorText.value = "";

  const cached = readFromCache();
  if (cached) {
    activity.value = cached;
    isLoading.value = false;
    return;
  }

  try {
    const fresh = await fetchLatestPushActivity();
    activity.value = fresh;
    writeToCache(fresh);
  } catch {
    if (!activity.value) {
      errorText.value = "Не удалось загрузить активность GitHub. Попробуйте обновить страницу.";
    }
  } finally {
    isLoading.value = false;
  }
}

function formatRelativeTime(createdAtIso: string, now: number): string {
  const createdAtMs = new Date(createdAtIso).getTime();
  const deltaSeconds = Math.max(0, Math.floor((now - createdAtMs) / 1000));

  if (deltaSeconds < 60) {
    return "только что";
  }

  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (deltaSeconds < hour) {
    const amount = Math.floor(deltaSeconds / minute);
    return `${amount} ${plural(amount, ["минута", "минуты", "минут"])} назад`;
  }

  if (deltaSeconds < day) {
    const amount = Math.floor(deltaSeconds / hour);
    return `${amount} ${plural(amount, ["час", "часа", "часов"])} назад`;
  }

  if (deltaSeconds < month) {
    const amount = Math.floor(deltaSeconds / day);
    return `${amount} ${plural(amount, ["день", "дня", "дней"])} назад`;
  }

  if (deltaSeconds < year) {
    const amount = Math.floor(deltaSeconds / month);
    return `${amount} ${plural(amount, ["месяц", "месяца", "месяцев"])} назад`;
  }

  const amount = Math.floor(deltaSeconds / year);
  return `${amount} ${plural(amount, ["год", "года", "лет"])} назад`;
}

function plural(amount: number, forms: [string, string, string]): string {
  const mod10 = amount % 10;
  const mod100 = amount % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0];
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return forms[1];
  }

  return forms[2];
}

function readFromCache(): ActivityView | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { savedAt?: number; data?: ActivityView };
    if (!parsed.savedAt || !parsed.data) {
      return null;
    }

    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function writeToCache(data: ActivityView) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // ignore storage failures
  }
}

onMounted(() => {
  void loadActivity();

  timer = window.setInterval(() => {
    nowMs.value = Date.now();
  }, 60_000);
});

onBeforeUnmount(() => {
  if (timer) {
    window.clearInterval(timer);
  }
});
</script>

<template>
  <section class="gh-activity reveal">
    <div class="gh-activity-header">
      <h2 class="section-title">Последний коммит организации</h2>
      <a class="gh-link" :href="siteMeta.organizationUrl" target="_blank" rel="noreferrer noopener">
        github.com/aimsora
      </a>
    </div>

    <p v-if="isLoading && !activity" class="gh-muted">Загружаю последний коммит...</p>
    <p v-else-if="errorText" class="gh-error">{{ errorText }}</p>

    <div v-else-if="activity" class="gh-content">
      <h3 class="gh-title">{{ activity.commitMessage }}</h3>
      <p class="gh-meta">
        Репозиторий:
        <a :href="activity.repoUrl" target="_blank" rel="noreferrer noopener">
          {{ activity.repoName }}
        </a>
        · источник: {{ activity.sourceLabel === "org" ? "org events" : "fallback user events" }}
      </p>
      <p class="gh-meta">
        SHA:
        <code>{{ activity.commitSha }}</code>
        ·
        <a :href="activity.commitUrl" target="_blank" rel="noreferrer noopener">
          открыть на GitHub
        </a>
      </p>
      <p class="gh-description">{{ activity.projectDescription }}</p>
      <p class="gh-time">{{ relativeMoscowTime }} · {{ absoluteMoscowTime }}</p>
    </div>
  </section>
</template>
