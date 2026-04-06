<script setup lang="ts">
definePageMeta({
  title: "Отчёты",
  description: "Оперативные аналитические отчёты платформы",
  roles: ["ANALYST", "DEVELOPER", "ADMIN"]
});

useHead({
  title: "Отчёты"
});

type ReportCategoryId = "overview" | "suppliers" | "stations" | "operations";

const route = useRoute();
const auth = useAuthSession();
const reports = useReportsData();

const reportTypeLabels: Record<string, string> = {
  "daily-overview": "Ежедневный обзор",
  "supplier-risk": "Риски поставщиков",
  "supplier-due-diligence": "Добросовестность поставщиков",
  "npp-station-orders": "Закупки по АЭС",
  "pipeline-incident": "Инциденты пайплайна"
};

const reportTypeDescriptions: Record<string, string> = {
  "daily-overview": "Сводка по закупкам, дедлайнам, публикациям и свежести данных.",
  "supplier-risk": "Сигналы по поставщикам, концентрации и срочным закупкам.",
  "supplier-due-diligence": "Проверка поставщиков по ФНС, Федресурсу, РНП и закупочной активности.",
  "npp-station-orders": "Что заказывала каждая АЭС, когда публиковались закупки и где уже есть договорный след.",
  "pipeline-incident": "Проблемные запуски, качество публикации и слабые места в конвейере."
};

const reportTypeCadences: Record<string, string> = {
  "daily-overview": "Каждые 12 часов",
  "supplier-risk": "Каждые 24 часа",
  "supplier-due-diligence": "Каждые 24 часа",
  "npp-station-orders": "Каждые 12 часов",
  "pipeline-incident": "Каждые 6 часов"
};

const reportTypeCategory: Record<string, ReportCategoryId> = {
  "daily-overview": "overview",
  "supplier-risk": "suppliers",
  "supplier-due-diligence": "suppliers",
  "npp-station-orders": "stations",
  "pipeline-incident": "operations"
};

const categoryMeta: Record<
  ReportCategoryId,
  { label: string; description: string; accent: string; emptyTitle: string; emptyDescription: string }
> = {
  overview: {
    label: "Обзор",
    description: "Главные сводки по объёму, срокам и общему состоянию закупочного контура.",
    accent: "from-sky-500/10 via-background to-background",
    emptyTitle: "Сводные отчёты пока не сформированы",
    emptyDescription: "Когда сервер создаст обзорные сценарии, они появятся в этой полке."
  },
  suppliers: {
    label: "Поставщики",
    description: "Отчёты для проверки рисков, добросовестности и концентрации по поставщикам.",
    accent: "from-amber-500/10 via-background to-background",
    emptyTitle: "Нет отчётов по поставщикам",
    emptyDescription: "Сюда попадут сценарии по рискам, благонадёжности и закупочной активности контрагентов."
  },
  stations: {
    label: "АЭС",
    description: "Срезы по станциям: что закупали, когда публиковали и как выглядит договорный след.",
    accent: "from-emerald-500/10 via-background to-background",
    emptyTitle: "Нет отчётов по АЭС",
    emptyDescription: "После следующей генерации здесь будут собраны станции и их закупочная история."
  },
  operations: {
    label: "Пайплайн",
    description: "Инженерная витрина качества сбора, публикации и стабильности источников.",
    accent: "from-rose-500/10 via-background to-background",
    emptyTitle: "Инженерные отчёты пока не сформированы",
    emptyDescription: "Когда появятся инциденты и операционные срезы, они будут видны в этом разделе."
  }
};

const roleVisibleReportTypes: Record<string, string[]> = {
  ANALYST: ["daily-overview", "supplier-risk", "supplier-due-diligence", "npp-station-orders"],
  DEVELOPER: ["pipeline-incident"],
  ADMIN: Object.keys(reportTypeLabels)
};

const visibleReportTypes = computed(() => roleVisibleReportTypes[auth.user.value?.role ?? ""] ?? []);
const visibleReports = computed(() =>
  reports.reports.value.filter((item) => visibleReportTypes.value.includes(item.reportType))
);
const visibleCategories = computed(() => {
  const categoryOrder: ReportCategoryId[] = ["overview", "suppliers", "stations", "operations"];
  return categoryOrder.filter((categoryId) =>
    visibleReportTypes.value.some((reportType) => reportTypeCategory[reportType] === categoryId)
  );
});
const selectedCategory = computed<ReportCategoryId | null>(() => {
  const rawCategory = route.query.category;
  const category = typeof rawCategory === "string" ? rawCategory : null;

  if (!category) {
    return null;
  }

  if (!visibleCategories.value.includes(category as ReportCategoryId)) {
    return null;
  }

  return category as ReportCategoryId;
});

const pageDescription = computed(() => {
  if (auth.isDeveloper.value) {
    return "Инженерный контур отчётности: состояние пайплайна, инциденты парсеров и качество доставки данных.";
  }

  if (auth.isAdmin.value) {
    return "Полный реестр отчётов, разложенный по категориям: обзор, поставщики, АЭС и операционный контур.";
  }

  return "Отчёты разложены по задачам: обзорная аналитика, поставщики и закупки по АЭС.";
});

const summaryCards = computed(() => [
  {
    label: "Всего отчётов",
    value: formatNumber(visibleReports.value.length),
    hint: auth.isDeveloper.value ? "Доступные инженерные отчёты" : "Все доступные версии в системе"
  },
  {
    label: auth.isDeveloper.value ? "Стабильные инженерные срезы" : "Готовы к чтению",
    value: formatNumber(visibleReports.value.filter((item) => item.status === "READY").length),
    hint: "Можно открывать и использовать в работе"
  },
  {
    label: "Проблемные",
    value: formatNumber(visibleReports.value.filter((item) => item.status === "FAILED").length),
    hint: "Требуют внимания или перегенерации"
  },
  {
    label: "Категорий",
    value: formatNumber(selectedCategory.value ? 1 : visibleCategories.value.length),
    hint: selectedCategory.value
      ? `Фильтр: ${categoryMeta[selectedCategory.value].label}`
      : "Полки отчётности, доступные в текущей роли"
  }
]);

const categorySections = computed(() =>
  visibleCategories.value
    .filter((categoryId) => !selectedCategory.value || categoryId === selectedCategory.value)
    .map((categoryId) => {
    const categoryReportTypes = visibleReportTypes.value.filter(
      (reportType) => reportTypeCategory[reportType] === categoryId
    );
    const categoryReports = visibleReports.value.filter((item) => reportTypeCategory[item.reportType] === categoryId);
    const cards = categoryReportTypes.map((reportType) => {
      const items = categoryReports.filter((item) => item.reportType === reportType);
      const latest = items[0] ?? null;
      return {
        reportType,
        label: reportTypeLabel(reportType),
        description: reportTypeDescription(reportType),
        cadence: reportTypeCadence(reportType),
        latest,
        historyCount: items.length
      };
    });

    return {
      id: categoryId,
      ...categoryMeta[categoryId],
      reports: categoryReports,
      cards
    };
  })
);

function reportTypeLabel(reportType?: string | null) {
  return reportTypeLabels[reportType ?? ""] ?? "Оперативный отчёт";
}

function reportTypeDescription(reportType?: string | null) {
  return reportTypeDescriptions[reportType ?? ""] ?? "Структурированный аналитический сценарий.";
}

function reportTypeCadence(reportType?: string | null) {
  return reportTypeCadences[reportType ?? ""] ?? "По расписанию";
}

function categoryCount(categoryId: ReportCategoryId) {
  return visibleReports.value.filter((item) => reportTypeCategory[item.reportType] === categoryId).length;
}

function categoryLink(categoryId: ReportCategoryId | null) {
  if (!categoryId) {
    return { path: "/reports" };
  }

  return {
    path: "/reports",
    query: {
      category: categoryId
    }
  };
}

function openReport(reportId: string) {
  return navigateTo(`/reports/${reportId}`);
}

function generateByType(reportType: string) {
  return reports.refreshReports([reportType]);
}

onMounted(() => {
  void reports.load();
});
</script>

<template>
  <div id="top" />

  <PageHeader
    title="Отчёты"
    :description="pageDescription"
  >
    <template #actions>
      <div class="flex gap-2">
        <Button
          v-if="auth.can('reports.generate')"
          :disabled="reports.refreshLoading.value"
          @click="reports.refreshReports()"
        >
          {{ reports.refreshLoading.value ? "Формирование..." : "Сформировать отчёты" }}
        </Button>
        <Button variant="secondary" :disabled="reports.loading.value" @click="reports.load()">
          {{ reports.loading.value ? "Обновление..." : "Обновить" }}
        </Button>
      </div>
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

    <Card class="border-border/70">
      <CardHeader>
        <CardTitle>Навигация по категориям</CardTitle>
        <CardDescription>
          Отчёты разложены по смысловым полкам, а фильтр сохраняется прямо в URL.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="flex flex-wrap gap-2">
          <NuxtLink
            :to="categoryLink(null)"
            class="inline-flex items-center rounded-full border px-3 py-2 text-sm transition"
            :class="
              !selectedCategory
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/40'
            "
          >
            Все категории
          </NuxtLink>
          <NuxtLink
            v-for="categoryId in visibleCategories"
            :key="`filter-${categoryId}`"
            :to="categoryLink(categoryId)"
            class="inline-flex items-center rounded-full border px-3 py-2 text-sm transition"
            :class="
              selectedCategory === categoryId
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/40'
            "
          >
            {{ categoryMeta[categoryId].label }}
          </NuxtLink>
        </div>

        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <NuxtLink
          v-for="categoryId in visibleCategories"
          :key="categoryId"
          :to="categoryLink(categoryId)"
          class="rounded-2xl border bg-muted/20 p-4 transition hover:border-primary/40 hover:bg-muted/30"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
              <Badge variant="secondary">{{ categoryMeta[categoryId].label }}</Badge>
              <span class="text-sm text-muted-foreground">{{ formatNumber(categoryCount(categoryId)) }}</span>
            </div>
            <p class="text-sm text-muted-foreground">{{ categoryMeta[categoryId].description }}</p>
          </div>
          </NuxtLink>
        </div>
      </CardContent>
    </Card>

    <Card v-if="visibleReports.length === 0">
      <CardContent class="pt-6">
        <EmptyState
          title="Отчёты отсутствуют"
          description="Когда сервер сформирует аналитические сценарии, они появятся в этом разделе."
        />
      </CardContent>
    </Card>

    <template v-else>
      <section
        v-for="section in categorySections"
        :id="`category-${section.id}`"
        :key="section.id"
        class="space-y-4 scroll-mt-24"
      >
        <Card :class="`border-border/70 bg-gradient-to-br ${section.accent}`">
          <CardHeader class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div class="space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{{ section.label }}</Badge>
                <Badge variant="outline">{{ formatNumber(section.reports.length) }} версий</Badge>
              </div>
              <div class="space-y-1">
                <CardTitle>{{ section.label }}</CardTitle>
                <CardDescription>{{ section.description }}</CardDescription>
              </div>
            </div>
            <Button variant="secondary" as-child>
              <a href="#top">Наверх</a>
            </Button>
          </CardHeader>
        </Card>

        <div class="grid gap-4 xl:grid-cols-3">
          <Card
            v-for="card in section.cards"
            :key="card.reportType"
            class="border-border/70 bg-gradient-to-br from-background via-background to-muted/20"
          >
            <CardHeader class="space-y-3">
              <div class="flex items-start justify-between gap-3">
                <Badge variant="secondary">{{ card.label }}</Badge>
                <Badge variant="outline">{{ card.cadence }}</Badge>
              </div>
              <div class="space-y-1">
                <CardTitle class="text-base">Сценарий</CardTitle>
                <CardDescription>{{ card.description }}</CardDescription>
              </div>
            </CardHeader>
            <CardContent class="space-y-4 text-sm text-muted-foreground">
              <p>Версий в истории: {{ formatNumber(card.historyCount) }}</p>
              <p v-if="card.latest">
                Последняя генерация: {{ formatDateTime(card.latest.updatedAt) }}
              </p>
              <p v-else>Пока нет ни одной готовой версии этого сценария.</p>
              <div class="flex flex-col gap-2 pt-1">
                <Button
                  v-if="card.latest"
                  variant="secondary"
                  @click="openReport(card.latest.id)"
                >
                  Открыть последнюю версию
                </Button>
                <Button
                  v-if="auth.can('reports.generate')"
                  type="button"
                  variant="outline"
                  :disabled="reports.refreshLoading.value"
                  @click="generateByType(card.reportType)"
                >
                  Сформировать сейчас
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>История по категории</CardTitle>
            <CardDescription>
              Отдельный реестр версий только для категории «{{ section.label.toLowerCase() }}».
            </CardDescription>
          </CardHeader>
          <CardContent v-if="section.reports.length === 0" class="pt-0">
            <EmptyState
              :title="section.emptyTitle"
              :description="section.emptyDescription"
            />
          </CardContent>
          <CardContent v-else class="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Отчёт</TableHead>
                  <TableHead>Сценарий</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Обновлён</TableHead>
                  <TableHead class="text-right">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="report in section.reports" :key="report.id">
                  <TableCell>
                    <div class="space-y-1">
                      <button
                        type="button"
                        class="font-medium text-primary hover:underline"
                        @click="openReport(report.id)"
                      >
                        {{ report.name }}
                      </button>
                      <p class="text-sm text-muted-foreground">
                        {{ report.description || reportTypeDescription(report.reportType) }}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{{ reportTypeLabel(report.reportType) }}</TableCell>
                  <TableCell>
                    <Badge :variant="badgeVariant(report.status)">{{ formatEnumLabel(report.status) }}</Badge>
                  </TableCell>
                  <TableCell>{{ formatDateTime(report.updatedAt) }}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" @click="openReport(report.id)">
                        Открыть
                      </Button>
                      <Button
                        v-if="auth.can('reports.archive')"
                        size="sm"
                        variant="outline"
                        :disabled="reports.archiveLoadingId.value === report.id"
                        @click="reports.archiveReport(report.id)"
                      >
                        Архивировать
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </template>
  </template>
</template>
