<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PageHeader from "../components/layout/PageHeader.vue";
import SummaryCard from "../components/dashboard/SummaryCard.vue";
import UiBadge from "../components/ui/UiBadge.vue";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiEmptyState from "../components/ui/UiEmptyState.vue";
import UiErrorState from "../components/ui/UiErrorState.vue";
import UiSkeleton from "../components/ui/UiSkeleton.vue";
import UiTable from "../components/ui/UiTable.vue";
import {
  badgeTone,
  formatDateTime,
  formatEnumLabel,
  formatNumber
} from "../lib/format";
import { apolloClient } from "../services/apollo";
import type { Source, SourceRun } from "../services/graphql-types";
import { SOURCES_QUERY, SOURCE_RUNS_QUERY } from "../services/queries";

const loading = ref(true);
const error = ref("");
const items = ref<Source[]>([]);
const runs = ref<SourceRun[]>([]);

const sourceRows = computed(() =>
  items.value.map((item) => ({
    ...item,
    lastRun: runs.value.find((run) => run.sourceCode === item.code)
  }))
);

const summaryCards = computed(() => {
  const activeCount = items.value.filter((item) => item.isActive).length;
  const withFailures = sourceRows.value.filter((item) => item.lastRun?.status === "FAILED").length;

  return [
    {
      label: "Всего источников",
      value: formatNumber(items.value.length),
      hint: "Реестр подключенных источников в платформе"
    },
    {
      label: "Активные",
      value: formatNumber(activeCount),
      hint: "Источники, доступные для регулярного сбора"
    },
    {
      label: "С ошибками",
      value: formatNumber(withFailures),
      hint: "Источники с последним запуском в статусе ошибки"
    }
  ];
});

async function loadSources() {
  try {
    const [sourcesResult, runsResult] = await Promise.all([
      apolloClient.query<{ sources: Source[] }>({
        query: SOURCES_QUERY,
        fetchPolicy: "network-only"
      }),
      apolloClient.query<{ sourceRuns: SourceRun[] }>({
        query: SOURCE_RUNS_QUERY,
        variables: { limit: 20 },
        fetchPolicy: "network-only"
      })
    ]);

    items.value = sourcesResult.data.sources;
    runs.value = runsResult.data.sourceRuns;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось загрузить источники";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadSources();
});
</script>

<template>
  <PageHeader
    title="Источники"
    description="Статус подключенных источников и их последних запусков."
  >
    <template #actions>
      <UiButton variant="secondary" @click="loadSources">Обновить</UiButton>
    </template>
  </PageHeader>

  <div v-if="loading" class="stats-grid">
    <UiCard v-for="item in 3" :key="item"><UiSkeleton :lines="3" /></UiCard>
  </div>
  <UiCard v-else-if="error">
    <UiErrorState :description="error" action-label="Повторить" @action="loadSources" />
  </UiCard>
  <template v-else>
    <div class="stats-grid">
      <SummaryCard
        v-for="card in summaryCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :hint="card.hint"
      />
    </div>

    <section class="cards-grid">
      <article v-for="item in sourceRows" :key="item.id" class="source-card">
        <div class="panel-title">
          <div>
            <p class="section-hint">{{ formatEnumLabel(item.kind) }}</p>
            <h3>{{ item.name }}</h3>
          </div>
          <UiBadge :tone="item.isActive ? 'success' : 'danger'">
            {{ item.isActive ? "Активен" : "Неактивен" }}
          </UiBadge>
        </div>
        <p>{{ item.description || "Описание для источника пока не заполнено." }}</p>
        <div class="table-subtitle">{{ item.code }}</div>
        <div v-if="item.lastRun" class="source-meta">
          <UiBadge :tone="badgeTone(item.lastRun.status)">
            {{ formatEnumLabel(item.lastRun.status) }}
          </UiBadge>
          <span class="muted-text">Запуск: {{ formatDateTime(item.lastRun.startedAt) }}</span>
        </div>
        <a
          v-if="item.baseUrl"
          class="text-link"
          :href="item.baseUrl"
          target="_blank"
          rel="noreferrer"
        >
          Открыть адрес источника
        </a>
      </article>
    </section>

    <UiCard>
      <div class="panel-title">
        <div>
          <h2>Последние запуски по источникам</h2>
          <p>Быстрый срез по публикации и ошибкам для каждого источника.</p>
        </div>
      </div>
      <UiEmptyState
        v-if="sourceRows.length === 0"
        title="Источники не найдены"
        description="После подключения источников здесь появится сводка по их запуску."
      />
      <UiTable v-else>
        <thead>
          <tr>
            <th>Источник</th>
            <th>Последний запуск</th>
            <th>Опубликовано</th>
            <th>Ошибки</th>
            <th>Обновлено</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in sourceRows" :key="item.id">
            <td>{{ item.name }}</td>
            <td>
              <UiBadge
                v-if="item.lastRun"
                :tone="badgeTone(item.lastRun.status)"
              >
                {{ formatEnumLabel(item.lastRun.status) }}
              </UiBadge>
              <span v-else class="muted-text">Запусков пока не было</span>
            </td>
            <td>{{ formatNumber(item.lastRun?.itemsPublished) }}</td>
            <td>{{ formatNumber(item.lastRun?.itemsFailed) }}</td>
            <td>{{ item.lastRun ? formatDateTime(item.lastRun.startedAt) : "Нет данных" }}</td>
          </tr>
        </tbody>
      </UiTable>
    </UiCard>
  </template>
</template>
