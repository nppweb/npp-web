<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import SummaryCard from "../components/dashboard/SummaryCard.vue";
import EmptyState from "../components/feedback/EmptyState.vue";
import ErrorState from "../components/feedback/ErrorState.vue";
import PageHeader from "../components/layout/PageHeader.vue";
import Badge from "../components/ui/badge/Badge.vue";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import Label from "../components/ui/label/Label.vue";
import Select from "../components/ui/select/Select.vue";
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
  formatDuration,
  formatEnumLabel,
  formatNumber
} from "../lib/format";
import { apolloClient } from "../graphql/apollo";
import type { Source, SourceRun } from "../graphql/types";
import { SOURCES_QUERY, SOURCE_RUNS_QUERY } from "../graphql/queries";

const loading = ref(true);
const error = ref("");
const sourceFilter = ref("");
const runs = ref<SourceRun[]>([]);
const sources = ref<Source[]>([]);

const summaryCards = computed(() => [
  {
    label: "Всего запусков",
    value: formatNumber(runs.value.length),
    hint: "Количество запусков в текущей выборке"
  },
  {
    label: "Успешные",
    value: formatNumber(runs.value.filter((run) => run.status === "SUCCESS").length),
    hint: "Запуски, завершившиеся без ошибок"
  },
  {
    label: "С ошибками",
    value: formatNumber(
      runs.value.filter((run) => run.status === "FAILED" || run.status === "PARTIAL").length
    ),
    hint: "Запуски, требующие внимания команды"
  }
]);

async function loadRuns() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await apolloClient.query<{ sourceRuns: SourceRun[] }>({
      query: SOURCE_RUNS_QUERY,
      variables: {
        source: sourceFilter.value || undefined,
        limit: 30
      },
      fetchPolicy: "network-only"
    });

    runs.value = data.sourceRuns;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось загрузить запуски";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    const { data } = await apolloClient.query<{ sources: Source[] }>({
      query: SOURCES_QUERY,
      fetchPolicy: "network-only"
    });

    sources.value = data.sources;
  } catch {
    sources.value = [];
  }

  await loadRuns();
});
</script>

<template>
  <PageHeader
    title="Запуски"
    description="Журнал запусков по сбору и публикации данных с фильтром по источнику."
  >
    <template #actions>
      <div class="inline-actions">
        <label class="field">
          <Label for="jobs-source">Источник</Label>
          <Select
            id="jobs-source"
            v-model="sourceFilter"
            :options="[
              { label: 'Все источники', value: '' },
              ...sources.map((item) => ({ label: item.name, value: item.code }))
            ]"
          />
        </label>
        <Button variant="secondary" :disabled="loading" @click="loadRuns">
          {{ loading ? "Загрузка..." : "Показать" }}
        </Button>
      </div>
    </template>
  </PageHeader>

  <div v-if="loading" class="stats-grid">
    <Skeleton v-for="item in 3" :key="item" :lines="3" />
  </div>

  <Card v-else-if="error" class="error-card">
    <ErrorState :description="error" action-label="Повторить" @action="loadRuns" />
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

    <Card class="table-card">
      <div class="table-card__header">
        <div>
          <h2>Журнал запусков</h2>
          <p class="data-note">
            По каждому запуску видно источник, статус, длительность и операционные метрики.
          </p>
        </div>
      </div>

      <EmptyState
        v-if="runs.length === 0"
        title="Запуски не найдены"
        description="Измените фильтр по источнику или дождитесь новых запусков."
      />

      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Ключ запуска</TableHead>
            <TableHead>Источник</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Старт</TableHead>
            <TableHead>Длительность</TableHead>
            <TableHead>Найдено</TableHead>
            <TableHead>Опубликовано</TableHead>
            <TableHead>Ошибок</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="run in runs" :key="run.id">
            <TableCell>
              <strong>{{ run.runKey }}</strong>
              <div class="table-subtitle">{{ run.errorMessage || "Без ошибок" }}</div>
            </TableCell>
            <TableCell>{{ run.sourceCode }}</TableCell>
            <TableCell>
              <Badge :variant="badgeVariant(run.status)">
                {{ formatEnumLabel(run.status) }}
              </Badge>
            </TableCell>
            <TableCell>{{ formatDateTime(run.startedAt) }}</TableCell>
            <TableCell>{{ formatDuration(run.startedAt, run.finishedAt) }}</TableCell>
            <TableCell>{{ formatNumber(run.itemsDiscovered) }}</TableCell>
            <TableCell>{{ formatNumber(run.itemsPublished) }}</TableCell>
            <TableCell>{{ formatNumber(run.itemsFailed) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </template>
</template>
