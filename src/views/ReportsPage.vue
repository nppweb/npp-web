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
import { badgeTone, formatDateTime, formatEnumLabel } from "../lib/format";
import { apolloClient } from "../services/apollo";
import type { Report } from "../services/graphql-types";
import { REPORTS_QUERY } from "../services/queries";

const loading = ref(true);
const error = ref("");
const reports = ref<Report[]>([]);

const summary = computed(() => [
  {
    label: "Всего отчетов",
    value: String(reports.value.length),
    hint: "Все аналитические отчеты в системе"
  },
  {
    label: "Готовы",
    value: String(reports.value.filter((item) => item.status === "READY").length),
    hint: "Можно использовать без дополнительной обработки"
  },
  {
    label: "В очереди",
    value: String(reports.value.filter((item) => item.status === "PENDING").length),
    hint: "Ожидают генерации или обновления"
  },
  {
    label: "С ошибкой",
    value: String(reports.value.filter((item) => item.status === "FAILED").length),
    hint: "Требуют внимания команды"
  }
]);

async function loadReports() {
  try {
    const { data } = await apolloClient.query<{ reports: Report[] }>({
      query: REPORTS_QUERY,
      fetchPolicy: "network-only"
    });

    reports.value = data.reports;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось загрузить отчеты";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadReports();
});
</script>

<template>
  <PageHeader
    title="Отчеты"
    description="Сводка по состоянию аналитических отчетов платформы."
  >
    <template #actions>
      <UiButton variant="secondary" @click="loadReports">Обновить</UiButton>
    </template>
  </PageHeader>

  <div v-if="loading" class="stats-grid">
    <UiCard v-for="item in 4" :key="item"><UiSkeleton :lines="3" /></UiCard>
  </div>
  <UiCard v-else-if="error">
    <UiErrorState :description="error" action-label="Повторить" @action="loadReports" />
  </UiCard>
  <template v-else>
    <div class="stats-grid">
      <SummaryCard
        v-for="card in summary"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :hint="card.hint"
      />
    </div>

    <UiCard>
      <UiEmptyState
        v-if="reports.length === 0"
        title="Отчеты отсутствуют"
        description="Когда backend начнет формировать отчеты, они появятся в этом разделе."
      />
      <UiTable v-else>
        <thead>
          <tr>
            <th>Отчет</th>
            <th>Статус</th>
            <th>Описание</th>
            <th>Обновлен</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="report in reports" :key="report.id">
            <td>
              <strong>{{ report.name }}</strong>
            </td>
            <td>
              <UiBadge :tone="badgeTone(report.status)">
                {{ formatEnumLabel(report.status) }}
              </UiBadge>
            </td>
            <td>{{ report.description || "Описание не задано" }}</td>
            <td>{{ formatDateTime(report.updatedAt) }}</td>
          </tr>
        </tbody>
      </UiTable>
    </UiCard>
  </template>
</template>
