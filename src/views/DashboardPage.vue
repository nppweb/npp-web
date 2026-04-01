<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import SummaryCard from "../components/dashboard/SummaryCard.vue";
import PageHeader from "../components/layout/PageHeader.vue";
import BarChart from "../components/charts/BarChart.vue";
import DonutChart from "../components/charts/DonutChart.vue";
import LineChart from "../components/charts/LineChart.vue";
import UiBadge from "../components/ui/UiBadge.vue";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiEmptyState from "../components/ui/UiEmptyState.vue";
import UiErrorState from "../components/ui/UiErrorState.vue";
import UiSkeleton from "../components/ui/UiSkeleton.vue";
import UiTable from "../components/ui/UiTable.vue";
import {
  badgeTone,
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatEnumLabel,
  formatNumber
} from "../lib/format";
import { apolloClient } from "../services/apollo";
import type {
  DashboardSummary,
  Procurement,
  ProcurementPage,
  Report,
  Source,
  SourceRun
} from "../services/graphql-types";
import {
  DASHBOARD_QUERY,
  PROCUREMENTS_QUERY,
  REPORTS_QUERY,
  SOURCES_QUERY,
  SOURCE_RUNS_QUERY
} from "../services/queries";

const loading = ref(true);
const error = ref("");
const summary = ref<DashboardSummary | null>(null);
const procurements = ref<Procurement[]>([]);
const sources = ref<Source[]>([]);
const runs = ref<SourceRun[]>([]);
const reports = ref<Report[]>([]);

async function loadDashboard() {
  loading.value = true;
  error.value = "";

  try {
    const [
      summaryResult,
      procurementsResult,
      sourcesResult,
      runsResult,
      reportsResult
    ] = await Promise.all([
      apolloClient.query<{ dashboardSummary: DashboardSummary }>({
        query: DASHBOARD_QUERY,
        fetchPolicy: "network-only"
      }),
      apolloClient.query<{ procurementItems: ProcurementPage }>({
        query: PROCUREMENTS_QUERY,
        variables: {
          sort: { field: "PUBLISHED_AT", direction: "DESC" },
          limit: 40,
          offset: 0
        },
        fetchPolicy: "network-only"
      }),
      apolloClient.query<{ sources: Source[] }>({
        query: SOURCES_QUERY,
        fetchPolicy: "network-only"
      }),
      apolloClient.query<{ sourceRuns: SourceRun[] }>({
        query: SOURCE_RUNS_QUERY,
        variables: { limit: 20 },
        fetchPolicy: "network-only"
      }),
      apolloClient.query<{ reports: Report[] }>({
        query: REPORTS_QUERY,
        fetchPolicy: "network-only"
      })
    ]);

    summary.value = summaryResult.data.dashboardSummary;
    procurements.value = procurementsResult.data.procurementItems.items;
    sources.value = sourcesResult.data.sources;
    runs.value = runsResult.data.sourceRuns;
    reports.value = reportsResult.data.reports;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось загрузить дашборд";
  } finally {
    loading.value = false;
  }
}

const summaryCards = computed(() => {
  if (!summary.value) {
    return [];
  }

  return [
    {
      label: "Закупки в базе",
      value: formatCompactNumber(summary.value.totalProcurements),
      hint: "Общий объем опубликованных записей"
    },
    {
      label: "Активные источники",
      value: formatNumber(summary.value.activeSources),
      hint: "Источники, доступные для сбора"
    },
    {
      label: "Запуски за 24 часа",
      value: formatNumber(summary.value.runsLast24h),
      hint: "Последняя суточная активность контура"
    },
    {
      label: "Готовые отчеты",
      value: formatNumber(readyReports.value),
      hint: `Последняя публикация: ${formatDateTime(summary.value.lastPublishedAt)}`
    }
  ];
});

const sourceCoverage = computed(() =>
  (summary.value?.bySource ?? []).slice(0, 6).map((item) => ({
    label: item.source,
    value: item.count,
    hint: `${formatCompactNumber(item.count)} записей`
  }))
);

const runStatusSegments = computed(() => {
  const colors: Record<string, string> = {
    SUCCESS: "#15803d",
    RUNNING: "#1d4ed8",
    PARTIAL: "#b45309",
    FAILED: "#b42318",
    PENDING: "#64748b"
  };

  const counts = new Map<string, number>();

  for (const run of runs.value) {
    counts.set(run.status, (counts.get(run.status) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([status, value]) => ({
    label: formatEnumLabel(status),
    value,
    color: colors[status] ?? "#8aa0ae"
  }));
});

const procurementTrend = computed(() => {
  const buckets = new Map<string, number>();
  const today = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }

  for (const item of procurements.value) {
    if (!item.publishedAt) {
      continue;
    }

    const key = item.publishedAt.slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([key, value]) => ({
    label: key.slice(5),
    value
  }));
});

const readyReports = computed(
  () => reports.value.filter((report) => report.status === "READY").length
);

const recentProcurements = computed(() => procurements.value.slice(0, 8));

const recentAlerts = computed(() => {
  const runAlerts = runs.value
    .filter((run) => run.status === "FAILED" || run.status === "PARTIAL")
    .slice(0, 3)
    .map((run) => ({
      id: run.id,
      title: `${run.sourceCode} · ${formatEnumLabel(run.status)}`,
      text:
        run.errorMessage ||
        `Опубликовано ${formatNumber(run.itemsPublished)}, ошибок ${formatNumber(run.itemsFailed)}`
    }));

  const reportAlerts = reports.value
    .filter((report) => report.status !== "READY")
    .slice(0, 2)
    .map((report) => ({
      id: report.id,
      title: `${report.name} · ${formatEnumLabel(report.status)}`,
      text: `Обновлен ${formatDateTime(report.updatedAt)}`
    }));

  return [...runAlerts, ...reportAlerts];
});

const sourceHealth = computed(() => {
  const latestRuns = new Map<string, SourceRun>();

  for (const run of runs.value) {
    if (!latestRuns.has(run.sourceCode)) {
      latestRuns.set(run.sourceCode, run);
    }
  }

  return sources.value.map((source) => {
    const latestRun = latestRuns.get(source.code);
    const totalProcurements =
      summary.value?.bySource.find((item) => item.source === source.code)?.count ?? 0;

    return {
      source,
      latestRun,
      totalProcurements
    };
  });
});

onMounted(() => {
  void loadDashboard();
});
</script>

<template>
  <PageHeader
    title="Дашборд"
    description="Единая оперативная панель по закупкам, источникам, запускам и отчетам."
  >
    <template #actions>
      <UiButton variant="secondary" @click="loadDashboard">Обновить</UiButton>
    </template>
  </PageHeader>

  <div v-if="loading" class="section-grid">
    <div class="stats-grid">
      <UiCard v-for="item in 4" :key="item"><UiSkeleton :lines="3" /></UiCard>
    </div>
    <UiCard><UiSkeleton :lines="8" /></UiCard>
  </div>
  <UiCard v-else-if="error">
    <UiErrorState :description="error" action-label="Повторить" @action="loadDashboard" />
  </UiCard>
  <template v-else-if="summary">
    <div class="stats-grid">
      <SummaryCard
        v-for="card in summaryCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :hint="card.hint"
      />
    </div>

    <div class="dashboard-grid">
      <UiCard>
        <div class="panel-title">
          <div>
            <h2>Покрытие по источникам</h2>
            <p>Какой объем закупок приходит из каждого канала.</p>
          </div>
        </div>
        <BarChart :items="sourceCoverage" empty-label="По источникам пока нет данных." />
      </UiCard>

      <UiCard>
        <div class="panel-title">
          <div>
            <h2>Статусы запусков</h2>
            <p>Распределение текущей выборки запусков по итоговому статусу.</p>
          </div>
        </div>
        <DonutChart :segments="runStatusSegments" empty-label="Запуски источников пока отсутствуют." />
      </UiCard>

      <UiCard class="dashboard-panel-wide">
        <div class="panel-title">
          <div>
            <h2>Динамика публикаций</h2>
            <p>Закупки, опубликованные в системе за последние 7 дней.</p>
          </div>
        </div>
        <LineChart :points="procurementTrend" empty-label="Недостаточно публикаций для построения тренда." />
      </UiCard>

      <UiCard>
        <div class="panel-title">
          <div>
            <h2>Сигналы и риски</h2>
            <p>События, которым стоит уделить внимание в первую очередь.</p>
          </div>
        </div>
        <UiEmptyState
          v-if="recentAlerts.length === 0"
          title="Сигналы отсутствуют"
          description="Последние запуски и отчеты выглядят стабильно."
        />
        <div v-else class="alert-list">
          <article v-for="alert in recentAlerts" :key="alert.id" class="alert-card">
            <strong>{{ alert.title }}</strong>
            <p>{{ alert.text }}</p>
          </article>
        </div>
      </UiCard>
    </div>

    <UiCard>
      <div class="panel-title">
        <div>
          <h2>Последние закупки</h2>
          <p>Свежие публикации, доступные для проверки и перехода в карточку.</p>
        </div>
      </div>
      <UiEmptyState
        v-if="procurements.length === 0"
        title="Закупки не найдены"
        description="После публикации первых записей они появятся в этом разделе."
      />
      <UiTable v-else>
        <thead>
          <tr>
            <th>Закупка</th>
            <th>Источник</th>
            <th>Заказчик</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Опубликована</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in recentProcurements" :key="item.id">
            <td>
              <strong>{{ item.title }}</strong>
              <div class="table-subtitle">{{ item.externalId }}</div>
              <RouterLink class="text-link" :to="`/procurements/${item.id}`">
                Открыть карточку
              </RouterLink>
            </td>
            <td>{{ item.source }}</td>
            <td>{{ item.customer || "Не указан" }}</td>
            <td>{{ formatCurrency(item.amount, item.currency) }}</td>
            <td>
              <UiBadge :tone="badgeTone(item.status)">
                {{ formatEnumLabel(item.status) }}
              </UiBadge>
            </td>
            <td>{{ formatDateTime(item.publishedAt) }}</td>
          </tr>
        </tbody>
      </UiTable>
    </UiCard>

    <div class="dashboard-split">
      <UiCard>
        <div class="panel-title">
          <div>
            <h2>Состояние источников</h2>
            <p>Сводка по активности источников и их последним запускам.</p>
          </div>
        </div>
        <UiEmptyState
          v-if="sourceHealth.length === 0"
          title="Источники еще не зарегистрированы"
          description="После подключения источников появится статусная таблица."
        />
        <UiTable v-else>
          <thead>
            <tr>
              <th>Источник</th>
              <th>Состояние</th>
              <th>Последний запуск</th>
              <th>Опубликовано</th>
              <th>Записей</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in sourceHealth" :key="item.source.id">
              <td>
                <strong>{{ item.source.name }}</strong>
                <div class="table-subtitle">{{ item.source.code }}</div>
              </td>
              <td>
                <UiBadge :tone="item.source.isActive ? 'success' : 'danger'">
                  {{ item.source.isActive ? "Активен" : "Неактивен" }}
                </UiBadge>
              </td>
              <td>
                <UiBadge
                  v-if="item.latestRun"
                  :tone="badgeTone(item.latestRun.status)"
                >
                  {{ formatEnumLabel(item.latestRun.status) }}
                </UiBadge>
                <span v-else class="muted-text">Запусков не было</span>
              </td>
              <td>{{ formatNumber(item.latestRun?.itemsPublished) }}</td>
              <td>{{ formatCompactNumber(item.totalProcurements) }}</td>
            </tr>
          </tbody>
        </UiTable>
      </UiCard>

      <UiCard>
        <div class="panel-title">
          <div>
            <h2>Последние отчеты</h2>
            <p>Состояние отчетов и последние изменения по ним.</p>
          </div>
        </div>
        <UiEmptyState
          v-if="reports.length === 0"
          title="Отчеты отсутствуют"
          description="После генерации первых отчетов они появятся здесь."
        />
        <div v-else class="report-list">
          <article v-for="report in reports.slice(0, 6)" :key="report.id" class="report-card">
            <div class="report-card-head">
              <strong>{{ report.name }}</strong>
              <UiBadge :tone="badgeTone(report.status)">
                {{ formatEnumLabel(report.status) }}
              </UiBadge>
            </div>
            <p>{{ report.description || "Описание не заполнено." }}</p>
            <span class="muted-text">Обновлен {{ formatDateTime(report.updatedAt) }}</span>
          </article>
        </div>
      </UiCard>
    </div>
  </template>
</template>
