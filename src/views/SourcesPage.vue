<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import SummaryCard from "../components/dashboard/SummaryCard.vue";
import EmptyState from "../components/feedback/EmptyState.vue";
import ErrorState from "../components/feedback/ErrorState.vue";
import PageHeader from "../components/layout/PageHeader.vue";
import Badge from "../components/ui/badge/Badge.vue";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import Skeleton from "../components/ui/skeleton/Skeleton.vue";
import Table from "../components/ui/table/Table.vue";
import TableBody from "../components/ui/table/TableBody.vue";
import TableCell from "../components/ui/table/TableCell.vue";
import TableHead from "../components/ui/table/TableHead.vue";
import TableHeader from "../components/ui/table/TableHeader.vue";
import TableRow from "../components/ui/table/TableRow.vue";
import {
  badgeVariant,
  formatDateTime,
  formatEnumLabel,
  formatNumber
} from "../lib/format";
import { apolloClient } from "../graphql/apollo";
import type { Source, SourceRun } from "../graphql/types";
import { SOURCES_QUERY, SOURCE_RUNS_QUERY } from "../graphql/queries";

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
      hint: "Подключённые каналы, доступные системе"
    },
    {
      label: "Активные",
      value: formatNumber(activeCount),
      hint: "Источники, участвующие в регулярном сборе"
    },
    {
      label: "С ошибками",
      value: formatNumber(withFailures),
      hint: "Источники с последним запуском в ошибочном статусе"
    }
  ];
});

async function loadSources() {
  loading.value = true;
  error.value = "";

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
    description="Статус подключённых источников и состояние их последних запусков."
  >
    <template #actions>
      <Button variant="secondary" :disabled="loading" @click="loadSources">
        {{ loading ? "Обновление..." : "Обновить" }}
      </Button>
    </template>
  </PageHeader>

  <div v-if="loading" class="stats-grid">
    <Skeleton v-for="item in 3" :key="item" :lines="3" />
  </div>

  <Card v-else-if="error" class="error-card">
    <ErrorState :description="error" action-label="Повторить" @action="loadSources" />
  </Card>

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
      <Card v-for="item in sourceRows" :key="item.id" class="source-overview-card">
        <div class="source-card__header">
          <div class="source-card__meta">
            <span class="section-hint">{{ formatEnumLabel(item.kind) }}</span>
            <h3>{{ item.name }}</h3>
            <p class="data-note">{{ item.description || "Описание для источника пока не заполнено." }}</p>
          </div>
          <Badge :variant="item.isActive ? 'success' : 'destructive'">
            {{ item.isActive ? "Активен" : "Неактивен" }}
          </Badge>
        </div>

        <div class="source-status-row">
          <Badge variant="secondary">{{ item.code }}</Badge>
          <Badge v-if="item.lastRun" :variant="badgeVariant(item.lastRun.status)">
            {{ formatEnumLabel(item.lastRun.status) }}
          </Badge>
          <span v-else class="muted-text">Запусков пока не было</span>
        </div>

        <div class="meta-list">
          <div class="meta-list__row">
            <strong>Последний запуск</strong>
            <span>{{ item.lastRun ? formatDateTime(item.lastRun.startedAt) : "Нет данных" }}</span>
          </div>
          <div class="meta-list__row">
            <strong>Опубликовано записей</strong>
            <span>{{ formatNumber(item.lastRun?.itemsPublished) }}</span>
          </div>
        </div>

        <a
          v-if="item.baseUrl"
          class="table-link"
          :href="item.baseUrl"
          target="_blank"
          rel="noreferrer"
        >
          Открыть адрес источника
        </a>
      </Card>
    </section>

    <Card class="table-card">
      <div class="table-card__header">
        <div>
          <h2>Последние запуски по источникам</h2>
          <p class="data-note">Оперативный срез по публикациям и ошибкам для каждого источника.</p>
        </div>
      </div>

      <EmptyState
        v-if="sourceRows.length === 0"
        title="Источники не найдены"
        description="После подключения источников здесь появится таблица со статусами."
      />

      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Источник</TableHead>
            <TableHead>Последний запуск</TableHead>
            <TableHead>Опубликовано</TableHead>
            <TableHead>Ошибки</TableHead>
            <TableHead>Обновлено</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in sourceRows" :key="item.id">
            <TableCell>
              <strong>{{ item.name }}</strong>
              <div class="table-subtitle">{{ item.code }}</div>
            </TableCell>
            <TableCell>
              <Badge v-if="item.lastRun" :variant="badgeVariant(item.lastRun.status)">
                {{ formatEnumLabel(item.lastRun.status) }}
              </Badge>
              <span v-else class="muted-text">Запусков пока не было</span>
            </TableCell>
            <TableCell>{{ formatNumber(item.lastRun?.itemsPublished) }}</TableCell>
            <TableCell>{{ formatNumber(item.lastRun?.itemsFailed) }}</TableCell>
            <TableCell>{{ item.lastRun ? formatDateTime(item.lastRun.startedAt) : "Нет данных" }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </template>
</template>
