<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import PageHeader from "../components/layout/PageHeader.vue";
import SummaryCard from "../components/dashboard/SummaryCard.vue";
import UiBadge from "../components/ui/UiBadge.vue";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiEmptyState from "../components/ui/UiEmptyState.vue";
import UiErrorState from "../components/ui/UiErrorState.vue";
import UiSelect from "../components/ui/UiSelect.vue";
import UiSkeleton from "../components/ui/UiSkeleton.vue";
import UiTable from "../components/ui/UiTable.vue";
import {
  badgeTone,
  formatDateTime,
  formatDuration,
  formatEnumLabel,
  formatNumber
} from "../lib/format";
import { apolloClient } from "../services/apollo";
import type { Source, SourceRun } from "../services/graphql-types";
import { SOURCES_QUERY, SOURCE_RUNS_QUERY } from "../services/queries";

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
    description="Журнал job-запусков по сбору и публикации данных."
  >
    <template #actions>
      <div class="toolbar-row">
        <UiSelect
          v-model="sourceFilter"
          label="Источник"
          :options="[
            { label: 'Все источники', value: '' },
            ...sources.map((item) => ({ label: item.name, value: item.code }))
          ]"
        />
        <UiButton variant="secondary" @click="loadRuns">Показать</UiButton>
      </div>
    </template>
  </PageHeader>

  <div v-if="loading" class="stats-grid">
    <UiCard v-for="item in 3" :key="item"><UiSkeleton :lines="3" /></UiCard>
  </div>
  <UiCard v-else-if="error">
    <UiErrorState :description="error" action-label="Повторить" @action="loadRuns" />
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

    <UiCard>
      <UiEmptyState
        v-if="runs.length === 0"
        title="Запуски не найдены"
        description="Измените фильтр по источнику или дождитесь новых запусков."
      />
      <UiTable v-else>
        <thead>
          <tr>
            <th>Ключ запуска</th>
            <th>Источник</th>
            <th>Статус</th>
            <th>Старт</th>
            <th>Длительность</th>
            <th>Найдено</th>
            <th>Опубликовано</th>
            <th>Ошибки</th>
            <th>Сообщение</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="run in runs" :key="run.id">
            <td>{{ run.runKey }}</td>
            <td>{{ run.sourceCode }}</td>
            <td>
              <UiBadge :tone="badgeTone(run.status)">
                {{ formatEnumLabel(run.status) }}
              </UiBadge>
            </td>
            <td>{{ formatDateTime(run.startedAt) }}</td>
            <td>{{ formatDuration(run.startedAt, run.finishedAt) }}</td>
            <td>{{ formatNumber(run.itemsDiscovered) }}</td>
            <td>{{ formatNumber(run.itemsPublished) }}</td>
            <td>{{ formatNumber(run.itemsFailed) }}</td>
            <td>{{ run.errorMessage || "Без ошибок" }}</td>
          </tr>
        </tbody>
      </UiTable>
    </UiCard>
  </template>
</template>
