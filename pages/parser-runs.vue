<script setup lang="ts">
definePageMeta({
  title: "Журнал запусков",
  description: "История прогонов сборщиков, статусы, длительность и технические детали",
  roles: ["DEVELOPER", "ADMIN"]
});

useHead({
  title: "Журнал запусков"
});

const jobs = useJobsData();
const allSourcesValue = "__ALL_SOURCES__";

const selectedSource = computed({
  get: () => jobs.sourceFilter.value || allSourcesValue,
  set: (value: string) => {
    jobs.sourceFilter.value = value === allSourcesValue ? "" : value;
  }
});

const runCards = computed(() => [
  {
    label: "Запусков в выборке",
    value: formatNumber(jobs.runs.value.length),
    hint: "Количество прогонов с учётом текущего фильтра"
  },
  {
    label: "Успешные",
    value: formatNumber(jobs.runs.value.filter((item) => item.status === "SUCCESS").length),
    hint: "Прогоны без ошибок и потерь"
  },
  {
    label: "С проблемами",
    value: formatNumber(
      jobs.runs.value.filter((item) => item.status === "FAILED" || item.status === "PARTIAL").length
    ),
    hint: "Прогоны, требующие инженерного внимания"
  },
  {
    label: "Источников в журнале",
    value: formatNumber(new Set(jobs.runs.value.map((item) => item.sourceCode)).size),
    hint: "Сколько разных сборщиков попало в текущее окно"
  }
]);

async function reload() {
  await Promise.all([jobs.loadSources(), jobs.load()]);
}

watch(
  () => jobs.sourceFilter.value,
  () => {
    void jobs.load();
  }
);

onMounted(() => {
  void reload();
});
</script>

<template>
  <PageHeader
    title="Журнал запусков"
    description="Отдельный экран с историей прогонов сборщиков, статусами, длительностью и техническими деталями по каждому запуску."
  >
    <template #actions>
      <Button as-child variant="outline">
        <NuxtLink to="/jobs">К операциям парсеров</NuxtLink>
      </Button>
      <Button variant="secondary" :disabled="jobs.loading.value" @click="reload()">
        {{ jobs.loading.value ? "Загрузка..." : "Обновить" }}
      </Button>
    </template>
  </PageHeader>

  <Card>
    <CardHeader>
      <CardTitle>Фильтр журнала</CardTitle>
      <CardDescription>
        Можно быстро сузить историю прогонов до конкретного источника и сразу увидеть техническую картину по нему.
      </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
      <div class="space-y-2">
        <Label for="parser-runs-source">Источник</Label>
        <Select v-model="selectedSource">
          <SelectTrigger id="parser-runs-source">
            <SelectValue placeholder="Все источники" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem :value="allSourcesValue">Все источники</SelectItem>
            <SelectItem v-for="source in jobs.sources.value" :key="source.id" :value="source.code">
              {{ source.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-end">
        <Button
          v-if="jobs.sourceFilter.value"
          variant="ghost"
          @click="selectedSource = allSourcesValue"
        >
          Сбросить фильтр
        </Button>
      </div>
    </CardContent>
  </Card>

  <div v-if="jobs.loading.value" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Skeleton v-for="item in 4" :key="item" class="h-32 rounded-xl" />
  </div>

  <ErrorState
    v-else-if="jobs.error.value"
    :description="jobs.error.value"
    action-label="Повторить"
    @action="reload()"
  />

  <template v-else>
    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        v-for="card in runCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :hint="card.hint"
      />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>История прогонов</CardTitle>
        <CardDescription>
          По каждому запуску видны источник, статус, длительность и технические детали инцидентов.
        </CardDescription>
      </CardHeader>
      <CardContent v-if="jobs.runs.value.length === 0">
        <EmptyState
          title="Запуски не найдены"
          description="Измените фильтр по источнику или дождитесь новых запусков."
        />
      </CardContent>
      <CardContent v-else class="px-0">
        <Table>
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
            <TableRow v-for="run in jobs.runs.value" :key="run.id">
              <TableCell>
                <div class="space-y-1">
                  <p class="font-medium">{{ run.runKey }}</p>
                  <p class="text-sm text-muted-foreground">{{ run.errorMessage || "Без ошибок" }}</p>
                </div>
              </TableCell>
              <TableCell>{{ run.sourceCode }}</TableCell>
              <TableCell>
                <Badge :variant="badgeVariant(run.status)">{{ formatEnumLabel(run.status) }}</Badge>
              </TableCell>
              <TableCell>{{ formatDateTime(run.startedAt) }}</TableCell>
              <TableCell>{{ formatDuration(run.startedAt, run.finishedAt) }}</TableCell>
              <TableCell>{{ formatNumber(run.itemsDiscovered) }}</TableCell>
              <TableCell>{{ formatNumber(run.itemsPublished) }}</TableCell>
              <TableCell>{{ formatNumber(run.itemsFailed) }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </template>
</template>
