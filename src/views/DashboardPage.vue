<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import SummaryCard from "../components/dashboard/SummaryCard.vue";
import BarChart from "../components/charts/BarChart.vue";
import DonutChart from "../components/charts/DonutChart.vue";
import LineChart from "../components/charts/LineChart.vue";
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
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
  formatEnumLabel,
  formatNumber
} from "../lib/format";
import { apolloClient } from "../graphql/apollo";
import type {
  DashboardSummary,
  Procurement,
  ProcurementPage,
  Report,
  Source,
  SourceRun
} from "../graphql/types";
import {
  DASHBOARD_QUERY,
  PROCUREMENTS_QUERY,
  REPORTS_QUERY,
  SOURCES_QUERY,
  SOURCE_RUNS_QUERY
} from "../graphql/queries";

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

const readyReports = computed(
  () => reports.value.filter((report) => report.status === "READY").length
);

const summaryCards = computed(() => {
  if (!summary.value) {
    return [];
  }

  return [
    {
      label: "Закупки в базе",
      value: formatCompactNumber(summary.value.totalProcurements),
      hint: "Общий объём опубликованных записей"
    },
    {
      label: "Активные источники",
      value: formatNumber(summary.value.activeSources),
      hint: "Источники, доступные для регулярного сбора"
    },
    {
      label: "Запуски за 24 часа",
      value: formatNumber(summary.value.runsLast24h),
      hint: "Последняя суточная активность системы"
    },
    {
      label: "Готовые отчёты",
      value: formatNumber(readyReports.value),
      hint: `Последнее обновление: ${formatDateTime(summary.value.lastPublishedAt)}`
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
    SUCCESS: "var(--success)",
    RUNNING: "var(--primary)",
    PARTIAL: "var(--warning)",
    FAILED: "var(--destructive)",
    PENDING: "var(--muted-foreground)"
  };

  const counts = new Map<string, number>();

  for (const run of runs.value) {
    counts.set(run.status, (counts.get(run.status) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([status, value]) => ({
    label: formatEnumLabel(status),
    value,
    color: colors[status] ?? "var(--muted-foreground)"
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
      text: `Обновлён ${formatDateTime(report.updatedAt)}`
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
    description="Единая рабочая панель по закупкам, источникам, запускам и отчётам."
  >
    <template #actions>
      <Button variant="secondary" :disabled="loading" @click="loadDashboard">
        {{ loading ? "Обновление..." : "Обновить" }}
      </Button>
    </template>
  </PageHeader>

  <div v-if="loading" class="surface-stack">
    <div class="stats-grid">
      <Skeleton v-for="item in 4" :key="item" :lines="3" />
    </div>
    <Card class="loading-card"><Skeleton :lines="8" /></Card>
  </div>

  <Card v-else-if="error" class="error-card">
    <ErrorState :description="error" action-label="Повторить" @action="loadDashboard" />
  </Card>

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
      <Card class="chart-card">
        <div class="panel-title">
          <div>
            <h2>Покрытие по источникам</h2>
            <p>Какой объём закупок приходит из каждого подключённого канала.</p>
          </div>
        </div>
        <BarChart :items="sourceCoverage" empty-label="По источникам пока нет данных." />
      </Card>

      <Card class="chart-card">
        <div class="panel-title">
          <div>
            <h2>Статусы запусков</h2>
            <p>Распределение текущей выборки запусков по итоговому статусу.</p>
          </div>
        </div>
        <DonutChart :segments="runStatusSegments" empty-label="Запуски ещё отсутствуют." />
      </Card>

      <Card class="chart-card dashboard-panel-wide">
        <div class="panel-title">
          <div>
            <h2>Динамика публикаций</h2>
            <p>Публикации закупок за последние семь дней.</p>
          </div>
        </div>
        <LineChart :points="procurementTrend" empty-label="Недостаточно данных для тренда." />
      </Card>

      <Card class="chart-card">
        <div class="panel-title">
          <div>
            <h2>Сигналы и предупреждения</h2>
            <p>События, которые требуют внимания команды в первую очередь.</p>
          </div>
        </div>
        <EmptyState
          v-if="recentAlerts.length === 0"
          title="Критичных сигналов нет"
          description="Последние запуски и отчёты выглядят стабильно."
        />
        <div v-else class="alert-list">
          <article v-for="alert in recentAlerts" :key="alert.id" class="alert-card">
            <strong>{{ alert.title }}</strong>
            <p class="data-note">{{ alert.text }}</p>
          </article>
        </div>
      </Card>
    </div>

    <Card class="table-card">
      <div class="table-card__header">
        <div>
          <h2>Последние закупки</h2>
          <p class="data-note">Свежие публикации, доступные для проверки и перехода в карточку.</p>
        </div>
      </div>

      <EmptyState
        v-if="recentProcurements.length === 0"
        title="Закупки не найдены"
        description="После публикации первых записей они появятся в этом разделе."
      />

      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Закупка</TableHead>
            <TableHead>Источник</TableHead>
            <TableHead>Заказчик</TableHead>
            <TableHead>Сумма</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Опубликована</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in recentProcurements" :key="item.id">
            <TableCell>
              <strong>{{ item.title }}</strong>
              <div class="table-subtitle">{{ item.externalId }}</div>
              <RouterLink class="table-link" :to="`/procurements/${item.id}`">
                Открыть карточку
              </RouterLink>
            </TableCell>
            <TableCell>{{ item.source }}</TableCell>
            <TableCell>{{ item.customer || "Не указан" }}</TableCell>
            <TableCell>{{ formatCurrency(item.amount, item.currency) }}</TableCell>
            <TableCell>
              <Badge :variant="badgeVariant(item.status)">
                {{ formatEnumLabel(item.status) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDateTime(item.publishedAt) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <div class="dashboard-split">
      <Card class="table-card">
        <div class="table-card__header">
          <div>
            <h2>Состояние источников</h2>
            <p class="data-note">Сводка по активности источников и их последним запускам.</p>
          </div>
        </div>

        <EmptyState
          v-if="sourceHealth.length === 0"
          title="Источники ещё не зарегистрированы"
          description="После подключения появится статусная таблица по каждому источнику."
        />

        <Table v-else>
          <TableHeader>
            <TableRow>
              <TableHead>Источник</TableHead>
              <TableHead>Состояние</TableHead>
              <TableHead>Последний запуск</TableHead>
              <TableHead>Опубликовано</TableHead>
              <TableHead>Записей</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in sourceHealth" :key="item.source.id">
              <TableCell>
                <strong>{{ item.source.name }}</strong>
                <div class="table-subtitle">{{ item.source.code }}</div>
              </TableCell>
              <TableCell>
                <Badge :variant="item.source.isActive ? 'success' : 'destructive'">
                  {{ item.source.isActive ? "Активен" : "Неактивен" }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge v-if="item.latestRun" :variant="badgeVariant(item.latestRun.status)">
                  {{ formatEnumLabel(item.latestRun.status) }}
                </Badge>
                <span v-else class="muted-text">Запусков не было</span>
              </TableCell>
              <TableCell>{{ formatNumber(item.latestRun?.itemsPublished) }}</TableCell>
              <TableCell>{{ formatCompactNumber(item.totalProcurements) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <Card class="table-card">
        <div class="table-card__header">
          <div>
            <h2>Свежие отчёты</h2>
            <p class="data-note">Последние изменения и текущие статусы аналитических отчётов.</p>
          </div>
        </div>

        <EmptyState
          v-if="reports.length === 0"
          title="Отчёты отсутствуют"
          description="После генерации первых отчётов они появятся в этом разделе."
        />

        <div v-else class="report-list">
          <article v-for="report in reports.slice(0, 6)" :key="report.id" class="report-card">
            <div class="report-card-head">
              <strong>{{ report.name }}</strong>
              <Badge :variant="badgeVariant(report.status)">
                {{ formatEnumLabel(report.status) }}
              </Badge>
            </div>
            <div class="report-card__meta">
              <p>{{ report.description || "Описание пока не заполнено." }}</p>
              <span class="muted-text">Обновлён {{ formatDateTime(report.updatedAt) }}</span>
            </div>
          </article>
        </div>
      </Card>
    </div>
  </template>
</template>
