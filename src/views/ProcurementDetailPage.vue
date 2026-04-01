<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import EmptyState from "../components/feedback/EmptyState.vue";
import ErrorState from "../components/feedback/ErrorState.vue";
import PageHeader from "../components/layout/PageHeader.vue";
import Badge from "../components/ui/badge/Badge.vue";
import Button from "../components/ui/button/Button.vue";
import Card from "../components/ui/card/Card.vue";
import Skeleton from "../components/ui/skeleton/Skeleton.vue";
import {
  badgeVariant,
  formatCurrency,
  formatDateTime,
  formatEnumLabel
} from "../lib/format";
import { apolloClient } from "../graphql/apollo";
import type { Procurement } from "../graphql/types";
import { PROCUREMENT_QUERY } from "../graphql/queries";

const route = useRoute();
const loading = ref(true);
const error = ref("");
const item = ref<Procurement | null>(null);

async function loadProcurement() {
  loading.value = true;
  error.value = "";

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

const headerTitle = computed(() => item.value?.title || "Карточка закупки");
const headerDescription = computed(
  () => item.value?.externalId || "Детальная структурированная информация по выбранной закупке."
);

const payloadJson = computed(() => JSON.stringify(item.value?.rawPayload ?? {}, null, 2));

onMounted(() => {
  void loadProcurement();
});
</script>

<template>
  <PageHeader :title="headerTitle" :description="headerDescription">
    <template #actions>
      <div class="page-meta-row">
        <Badge v-if="item" :variant="badgeVariant(item.status)">
          {{ formatEnumLabel(item.status) }}
        </Badge>
        <RouterLink to="/procurements">
          <Button type="button" variant="secondary">К списку</Button>
        </RouterLink>
      </div>
    </template>
  </PageHeader>

  <Card v-if="loading" class="loading-card">
    <Skeleton :lines="9" />
  </Card>

  <Card v-else-if="error" class="error-card">
    <ErrorState :description="error" action-label="Повторить" @action="loadProcurement" />
  </Card>

  <template v-else-if="item">
    <Card class="detail-hero">
      <div class="detail-hero__header">
        <div class="detail-hero__meta">
          <span class="section-hint">{{ item.externalId }}</span>
          <h2>{{ item.title }}</h2>
          <p class="data-note">
            {{ item.description || "Для этой закупки пока не добавлено текстовое описание." }}
          </p>
        </div>
        <Badge :variant="badgeVariant(item.status)">
          {{ formatEnumLabel(item.status) }}
        </Badge>
      </div>

      <div class="detail-card__actions">
        <Badge variant="secondary">{{ item.source }}</Badge>
        <span class="muted-text">Обновлена {{ formatDateTime(item.updatedAt) }}</span>
        <a
          v-if="item.sourceUrl"
          class="table-link"
          :href="item.sourceUrl"
          target="_blank"
          rel="noreferrer"
        >
          Открыть первоисточник
        </a>
      </div>
    </Card>

    <div class="detail-grid">
      <Card class="detail-card">
        <div class="detail-card__header">
          <h3>Основная информация</h3>
        </div>
        <div class="info-list">
          <div class="info-list__row">
            <strong>Идентификатор</strong>
            <span>{{ item.externalId }}</span>
          </div>
          <div class="info-list__row">
            <strong>Статус</strong>
            <span>{{ formatEnumLabel(item.status) }}</span>
          </div>
          <div class="info-list__row">
            <strong>Дата обновления</strong>
            <span>{{ formatDateTime(item.updatedAt) }}</span>
          </div>
        </div>
      </Card>

      <Card class="detail-card">
        <div class="detail-card__header">
          <h3>Источник</h3>
        </div>
        <div class="info-list">
          <div class="info-list__row">
            <strong>Код источника</strong>
            <span>{{ item.source }}</span>
          </div>
          <div class="info-list__row">
            <strong>Ссылка на публикацию</strong>
            <a
              v-if="item.sourceUrl"
              class="text-link"
              :href="item.sourceUrl"
              target="_blank"
              rel="noreferrer"
            >
              Перейти к первоисточнику
            </a>
            <span v-else>Ссылка отсутствует</span>
          </div>
        </div>
      </Card>

      <Card class="detail-card">
        <div class="detail-card__header">
          <h3>Контрагенты</h3>
        </div>
        <div class="info-list">
          <div class="info-list__row">
            <strong>Заказчик</strong>
            <span>{{ item.customer || "Не указан" }}</span>
          </div>
          <div class="info-list__row">
            <strong>Поставщик</strong>
            <span>{{ item.supplier || "Не указан" }}</span>
          </div>
        </div>
      </Card>

      <Card class="detail-card">
        <div class="detail-card__header">
          <h3>Сумма и сроки</h3>
        </div>
        <div class="info-list">
          <div class="info-list__row">
            <strong>Сумма</strong>
            <span>{{ formatCurrency(item.amount, item.currency) }}</span>
          </div>
          <div class="info-list__row">
            <strong>Опубликована</strong>
            <span>{{ formatDateTime(item.publishedAt) }}</span>
          </div>
          <div class="info-list__row">
            <strong>Срок подачи</strong>
            <span>{{ formatDateTime(item.deadlineAt) }}</span>
          </div>
        </div>
      </Card>

      <Card class="detail-card">
        <div class="detail-card__header">
          <h3>Описание</h3>
        </div>
        <p class="detail-description">
          {{ item.description || "Описание отсутствует. Используйте первоисточник для проверки деталей." }}
        </p>
      </Card>
    </div>

    <Card class="payload-card">
      <div class="table-card__header">
        <div>
          <h2>Технические данные</h2>
          <p class="data-note">
            Технические данные доступны в сворачиваемом блоке и не перегружают основной экран.
          </p>
        </div>
      </div>

      <details>
        <summary>Показать технические данные</summary>
        <div class="payload-card__content">
          <pre>{{ payloadJson }}</pre>
        </div>
      </details>
    </Card>
  </template>

  <Card v-else class="empty-card">
    <EmptyState
      title="Закупка не найдена"
      description="Запись отсутствует или больше недоступна. Вернитесь к общему списку и выберите другую закупку."
    />
  </Card>
</template>
