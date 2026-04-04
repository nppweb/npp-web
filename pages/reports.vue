<script setup lang="ts">
definePageMeta({
  title: "Отчёты",
  description: "Состояние аналитических отчётов платформы"
});

useHead({
  title: "Отчёты"
});

const reports = useReportsData();

const summaryCards = computed(() => [
  {
    label: "Всего отчётов",
    value: formatNumber(reports.reports.value.length),
    hint: "Все аналитические отчёты в системе"
  },
  {
    label: "Готовы",
    value: formatNumber(reports.reports.value.filter((item) => item.status === "READY").length),
    hint: "Можно использовать без доработки"
  },
  {
    label: "В очереди",
    value: formatNumber(reports.reports.value.filter((item) => item.status === "PENDING").length),
    hint: "Ожидают генерации или обновления"
  },
  {
    label: "С ошибкой",
    value: formatNumber(reports.reports.value.filter((item) => item.status === "FAILED").length),
    hint: "Требуют внимания команды"
  }
]);

onMounted(() => {
  void reports.load();
});
</script>

<template>
  <PageHeader
    title="Отчёты"
    description="Сводка по состоянию аналитических отчётов платформы."
  >
    <template #actions>
      <Button variant="secondary" :disabled="reports.loading.value" @click="reports.load()">
        {{ reports.loading.value ? "Обновление..." : "Обновить" }}
      </Button>
    </template>
  </PageHeader>

  <div v-if="reports.loading.value" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Skeleton v-for="item in 4" :key="item" class="h-32 rounded-xl" />
  </div>

  <ErrorState
    v-else-if="reports.error.value"
    :description="reports.error.value"
    action-label="Повторить"
    @action="reports.load()"
  />

  <template v-else>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        v-for="card in summaryCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :hint="card.hint"
      />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>Список отчётов</CardTitle>
        <CardDescription>Статус, описание и время последнего обновления по каждому отчёту.</CardDescription>
      </CardHeader>
      <CardContent v-if="reports.reports.value.length === 0">
        <EmptyState
          title="Отчёты отсутствуют"
          description="Когда сервер начнёт формировать отчёты, они появятся в этом разделе."
        />
      </CardContent>
      <CardContent v-else class="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Отчёт</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Обновлён</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="report in reports.reports.value" :key="report.id">
              <TableCell class="font-medium">{{ report.name }}</TableCell>
              <TableCell>
                <Badge :variant="badgeVariant(report.status)">{{ formatEnumLabel(report.status) }}</Badge>
              </TableCell>
              <TableCell>{{ report.description || "Описание не задано" }}</TableCell>
              <TableCell>{{ formatDateTime(report.updatedAt) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </template>
</template>
