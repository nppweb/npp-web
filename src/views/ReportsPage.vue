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
import { badgeVariant, formatDateTime, formatEnumLabel } from "../lib/format";
import { apolloClient } from "../graphql/apollo";
import type { Report } from "../graphql/types";
import { REPORTS_QUERY } from "../graphql/queries";

const loading = ref(true);
const error = ref("");
const reports = ref<Report[]>([]);

const summary = computed(() => [
  {
    label: "Всего отчётов",
    value: String(reports.value.length),
    hint: "Все аналитические отчёты в системе"
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
  loading.value = true;
  error.value = "";

  try {
    const { data } = await apolloClient.query<{ reports: Report[] }>({
      query: REPORTS_QUERY,
      fetchPolicy: "network-only"
    });

    reports.value = data.reports;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось загрузить отчёты";
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
    title="Отчёты"
    description="Сводка по состоянию аналитических отчётов платформы."
  >
    <template #actions>
      <Button variant="secondary" :disabled="loading" @click="loadReports">
        {{ loading ? "Обновление..." : "Обновить" }}
      </Button>
    </template>
  </PageHeader>

  <div v-if="loading" class="stats-grid">
    <Skeleton v-for="item in 4" :key="item" :lines="3" />
  </div>

  <Card v-else-if="error" class="error-card">
    <ErrorState :description="error" action-label="Повторить" @action="loadReports" />
  </Card>

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

    <Card class="table-card">
      <div class="table-card__header">
        <div>
          <h2>Список отчётов</h2>
          <p class="data-note">Статус, описание и время последнего обновления по каждому отчёту.</p>
        </div>
      </div>

      <EmptyState
        v-if="reports.length === 0"
        title="Отчёты отсутствуют"
        description="Когда сервер начнёт формировать отчёты, они появятся в этом разделе."
      />

      <Table v-else>
        <TableHeader>
          <TableRow>
            <TableHead>Отчёт</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Обновлён</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="report in reports" :key="report.id">
            <TableCell>
              <strong>{{ report.name }}</strong>
            </TableCell>
            <TableCell>
              <Badge :variant="badgeVariant(report.status)">
                {{ formatEnumLabel(report.status) }}
              </Badge>
            </TableCell>
            <TableCell>{{ report.description || "Описание не задано" }}</TableCell>
            <TableCell>{{ formatDateTime(report.updatedAt) }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  </template>
</template>
