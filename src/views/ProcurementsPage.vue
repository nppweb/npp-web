<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import EmptyState from "../components/feedback/EmptyState.vue";
import ErrorState from "../components/feedback/ErrorState.vue";
import PageHeader from "../components/layout/PageHeader.vue";
import Badge from "../components/ui/badge/Badge.vue";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import Input from "../components/ui/input/Input.vue";
import Label from "../components/ui/label/Label.vue";
import Select from "../components/ui/select/Select.vue";
import Skeleton from "../components/ui/skeleton/Skeleton.vue";
import Table from "../components/ui/table/Table.vue";
import TableBody from "../components/ui/table/TableBody.vue";
import TableCell from "../components/ui/table/TableCell.vue";
import TableHead from "../components/ui/table/TableHead.vue";
import TableHeader from "../components/ui/table/TableHeader.vue";
import TableRow from "../components/ui/table/TableRow.vue";
import { badgeVariant, formatCurrency, formatDate, formatEnumLabel } from "../lib/format";
import { apolloClient } from "../graphql/apollo";
import type { Procurement, ProcurementPage, ProcurementStatus, Source } from "../graphql/types";
import { PROCUREMENTS_QUERY, SOURCES_QUERY } from "../graphql/queries";

const router = useRouter();
const loading = ref(false);
const error = ref("");
const filters = reactive<{
  search: string;
  source: string;
  status: ProcurementStatus | "";
}>({
  search: "",
  source: "",
  status: ""
});
const items = ref<Procurement[]>([]);
const total = ref(0);
const sources = ref<Source[]>([]);

async function load() {
  loading.value = true;
  error.value = "";

  try {
    const { data } = await apolloClient.query<{ procurementItems: ProcurementPage }>({
      query: PROCUREMENTS_QUERY,
      variables: {
        filter:
          filters.search || filters.source || filters.status
            ? {
                ...(filters.search ? { search: filters.search } : {}),
                ...(filters.source ? { source: filters.source } : {}),
                ...(filters.status ? { status: filters.status } : {})
              }
            : undefined,
        sort: { field: "PUBLISHED_AT", direction: "DESC" },
        limit: 25,
        offset: 0
      },
      fetchPolicy: "network-only"
    });

    items.value = data.procurementItems.items;
    total.value = data.procurementItems.total;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось загрузить закупки";
  } finally {
    loading.value = false;
  }
}

async function loadSources() {
  try {
    const { data } = await apolloClient.query<{ sources: Source[] }>({
      query: SOURCES_QUERY,
      fetchPolicy: "network-only"
    });

    sources.value = data.sources;
  } catch {
    sources.value = [];
  }
}

function resetFilters() {
  filters.search = "";
  filters.source = "";
  filters.status = "";
  void load();
}

function openDetail(id: string) {
  void router.push(`/procurements/${id}`);
}

const statusOptions = [
  { label: "Все статусы", value: "" },
  { label: "Черновик", value: "DRAFT" },
  { label: "Активна", value: "ACTIVE" },
  { label: "Завершена", value: "CLOSED" },
  { label: "В архиве", value: "ARCHIVED" }
];

onMounted(() => {
  void loadSources();
  void load();
});
</script>

<template>
  <PageHeader
    title="Закупки"
    description="Поиск, фильтрация и переход к детальной карточке закупки."
  >
    <template #actions>
      <Button variant="secondary" :disabled="loading" @click="load">
        {{ loading ? "Обновление..." : "Обновить" }}
      </Button>
    </template>
  </PageHeader>

  <Card class="surface-stack">
    <div class="panel-title">
      <div>
        <h2>Фильтры</h2>
        <p class="data-note">Уточните выборку по тексту, источнику и статусу.</p>
      </div>
      <Badge variant="secondary">Найдено: {{ total }}</Badge>
    </div>

    <form class="filters-grid" @submit.prevent="load">
      <label class="field">
        <Label for="procurement-search">Поиск</Label>
        <Input
          id="procurement-search"
          v-model="filters.search"
          placeholder="Название, заказчик или поставщик"
        />
      </label>

      <label class="field">
        <Label for="procurement-source">Источник</Label>
        <Select
          id="procurement-source"
          v-model="filters.source"
          :options="[
            { label: 'Все источники', value: '' },
            ...sources.map((item) => ({ label: item.name, value: item.code }))
          ]"
        />
      </label>

      <label class="field">
        <Label for="procurement-status">Статус</Label>
        <Select id="procurement-status" v-model="filters.status" :options="statusOptions" />
      </label>

      <div class="inline-actions">
        <Button type="submit" :disabled="loading">{{ loading ? "Применение..." : "Применить" }}</Button>
        <Button type="button" variant="ghost" :disabled="loading" @click="resetFilters">Сбросить</Button>
      </div>
    </form>
  </Card>

  <Card v-if="loading" class="loading-card">
    <Skeleton :lines="7" />
  </Card>

  <Card v-else-if="error" class="error-card">
    <ErrorState :description="error" action-label="Повторить" @action="load" />
  </Card>

  <Card v-else class="table-card">
    <div class="table-card__header">
      <div>
        <h2>Список закупок</h2>
        <p class="data-note">Клик по строке открывает детальную карточку закупки.</p>
      </div>
    </div>

    <EmptyState
      v-if="items.length === 0"
      title="Ничего не найдено"
      description="Измените параметры поиска или сбросьте фильтры."
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
        <TableRow
          v-for="item in items"
          :key="item.id"
          class="clickable-row"
          @click="openDetail(item.id)"
        >
          <TableCell>
            <strong>{{ item.title }}</strong>
            <div class="table-subtitle">{{ item.externalId }}</div>
            <span class="table-link">Открыть карточку</span>
          </TableCell>
          <TableCell>{{ item.source }}</TableCell>
          <TableCell>{{ item.customer || "Не указан" }}</TableCell>
          <TableCell>{{ formatCurrency(item.amount, item.currency) }}</TableCell>
          <TableCell>
            <Badge :variant="badgeVariant(item.status)">
              {{ formatEnumLabel(item.status) }}
            </Badge>
          </TableCell>
          <TableCell>{{ formatDate(item.publishedAt) }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Card>
</template>
