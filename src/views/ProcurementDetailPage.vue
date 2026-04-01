<script setup lang="ts">
import { onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import PageHeader from "../components/layout/PageHeader.vue";
import UiBadge from "../components/ui/UiBadge.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiErrorState from "../components/ui/UiErrorState.vue";
import UiSkeleton from "../components/ui/UiSkeleton.vue";
import {
  badgeTone,
  formatCurrency,
  formatDateTime,
  formatEnumLabel
} from "../lib/format";
import { apolloClient } from "../services/apollo";
import type { Procurement } from "../services/graphql-types";
import { PROCUREMENT_QUERY } from "../services/queries";

const route = useRoute();
const loading = ref(true);
const error = ref("");
const item = ref<Procurement | null>(null);

async function loadProcurement() {
  try {
    const { data } = await apolloClient.query<{ procurementItem: Procurement | null }>({
      query: PROCUREMENT_QUERY,
      variables: { id: route.params.id },
      fetchPolicy: "network-only"
    });

    item.value = data.procurementItem;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Не удалось загрузить закупку";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadProcurement();
});
</script>

<template>
  <PageHeader
    title="Карточка закупки"
    description="Основные поля, контрагенты, сроки и исходные данные записи."
  >
    <template #actions>
      <RouterLink class="text-link" to="/procurements">Вернуться к списку</RouterLink>
    </template>
  </PageHeader>

  <UiCard v-if="loading">
    <UiSkeleton :lines="8" />
  </UiCard>
  <UiCard v-else-if="error">
    <UiErrorState :description="error" action-label="Повторить" @action="loadProcurement" />
  </UiCard>
  <template v-else-if="item">
    <div class="detail-grid">
      <UiCard class="detail-card">
        <div class="panel-title">
          <div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.externalId }}</p>
          </div>
          <UiBadge :tone="badgeTone(item.status)">
            {{ formatEnumLabel(item.status) }}
          </UiBadge>
        </div>
        <div class="detail-card__row">
          <strong>Описание</strong>
          <span>{{ item.description || "Описание не заполнено" }}</span>
        </div>
      </UiCard>

      <UiCard class="detail-card">
        <h3>Основные данные</h3>
        <div class="detail-card__row">
          <strong>Источник</strong>
          <span>{{ item.source }}</span>
        </div>
        <div class="detail-card__row">
          <strong>Сумма</strong>
          <span>{{ formatCurrency(item.amount, item.currency) }}</span>
        </div>
        <div class="detail-card__row">
          <strong>Ссылка на источник</strong>
          <a
            v-if="item.sourceUrl"
            class="text-link"
            :href="item.sourceUrl"
            target="_blank"
            rel="noreferrer"
          >
            Открыть первоисточник
          </a>
          <span v-else>Нет ссылки</span>
        </div>
      </UiCard>

      <UiCard class="detail-card">
        <h3>Контрагенты</h3>
        <div class="detail-card__row">
          <strong>Заказчик</strong>
          <span>{{ item.customer || "Не указан" }}</span>
        </div>
        <div class="detail-card__row">
          <strong>Поставщик</strong>
          <span>{{ item.supplier || "Не указан" }}</span>
        </div>
      </UiCard>

      <UiCard class="detail-card">
        <h3>Даты</h3>
        <div class="detail-card__row">
          <strong>Опубликована</strong>
          <span>{{ formatDateTime(item.publishedAt) }}</span>
        </div>
        <div class="detail-card__row">
          <strong>Срок подачи</strong>
          <span>{{ formatDateTime(item.deadlineAt) }}</span>
        </div>
        <div class="detail-card__row">
          <strong>Обновлена</strong>
          <span>{{ formatDateTime(item.updatedAt) }}</span>
        </div>
      </UiCard>

      <UiCard class="detail-card">
        <h3>Сырой payload</h3>
        <div class="detail-card__row">
          <pre>{{ JSON.stringify(item.rawPayload, null, 2) }}</pre>
        </div>
      </UiCard>
    </div>
  </template>
</template>
