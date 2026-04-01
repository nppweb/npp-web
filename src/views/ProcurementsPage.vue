<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import PageHeader from "../components/layout/PageHeader.vue";
import UiBadge from "../components/ui/UiBadge.vue";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiEmptyState from "../components/ui/UiEmptyState.vue";
import UiErrorState from "../components/ui/UiErrorState.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiSelect from "../components/ui/UiSelect.vue";
import UiSkeleton from "../components/ui/UiSkeleton.vue";
import UiTable from "../components/ui/UiTable.vue";
import {
  badgeTone,
  formatCurrency,
  formatDate,
  formatEnumLabel
} from "../lib/format";
import { apolloClient } from "../services/apollo";
import type {
  Procurement,
  ProcurementPage,
  ProcurementStatus,
  Source
} from "../services/graphql-types";
import { PROCUREMENTS_QUERY, SOURCES_QUERY } from "../services/queries";

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

onMounted(() => {
  void loadSources();
  void load();
});

const statusOptions = [
  { label: "Все статусы", value: "" },
  { label: "Черновик", value: "DRAFT" },
  { label: "Активна", value: "ACTIVE" },
  { label: "Завершена", value: "CLOSED" },
  { label: "В архиве", value: "ARCHIVED" }
];
</script>

<template>
  <PageHeader
    title="Закупки"
    description="Поиск, фильтрация и переход к детальной карточке закупки."
  >
    <template #actions>
      <UiButton variant="secondary" @click="load">Обновить</UiButton>
    </template>
  </PageHeader>

  <UiCard>
    <form class="toolbar-row" @submit.prevent="load">
      <UiInput
        v-model="filters.search"
        label="Поиск"
        placeholder="Название, заказчик или поставщик"
      />
      <UiSelect
        v-model="filters.source"
        label="Источник"
        :options="[
          { label: 'Все источники', value: '' },
          ...sources.map((item) => ({ label: item.name, value: item.code }))
        ]"
      />
      <UiSelect v-model="filters.status" label="Статус" :options="statusOptions" />
      <div class="inline-actions">
        <UiButton type="submit">Применить</UiButton>
        <UiButton type="button" variant="ghost" @click="resetFilters">Сбросить</UiButton>
      </div>
    </form>
  </UiCard>

  <UiCard v-if="loading">
    <UiSkeleton :lines="7" />
  </UiCard>
  <UiCard v-else-if="error">
    <UiErrorState :description="error" action-label="Повторить" @action="load" />
  </UiCard>
  <UiCard v-else>
    <div class="panel-title">
      <div>
        <h2>Результаты</h2>
        <p>Найдено записей: {{ total }}</p>
      </div>
    </div>

    <UiEmptyState
      v-if="items.length === 0"
      title="Ничего не найдено"
      description="Измените параметры поиска или сбросьте фильтры."
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
        <tr
          v-for="item in items"
          :key="item.id"
          class="clickable-row"
          @click="router.push(`/procurements/${item.id}`)"
        >
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
          <td>{{ formatDate(item.publishedAt) }}</td>
        </tr>
      </tbody>
    </UiTable>
  </UiCard>
</template>
