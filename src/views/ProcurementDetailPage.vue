<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { apolloClient } from "../services/apollo";
import { PROCUREMENT_QUERY } from "../services/queries";

const route = useRoute();
const loading = ref(true);
const error = ref("");
const item = ref<Record<string, unknown> | null>(null);

onMounted(async () => {
  try {
    const { data } = await apolloClient.query<{ procurementItem: Record<string, unknown> | null }>({
      query: PROCUREMENT_QUERY,
      variables: { id: route.params.id },
      fetchPolicy: "network-only"
    });
    item.value = data.procurementItem;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to load procurement";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="page-header">
    <p class="eyebrow">Record</p>
    <h2>Procurement Detail</h2>
  </section>

  <div v-if="loading" class="card">Loading record...</div>
  <div v-else-if="error" class="card error-text">{{ error }}</div>
  <template v-else-if="item">
    <section class="card detail-grid">
      <div>
        <span class="detail-label">Title</span>
        <strong>{{ item.title }}</strong>
      </div>
      <div>
        <span class="detail-label">Source</span>
        <strong>{{ item.source }}</strong>
      </div>
      <div>
        <span class="detail-label">Customer</span>
        <strong>{{ item.customer || "n/a" }}</strong>
      </div>
      <div>
        <span class="detail-label">Supplier</span>
        <strong>{{ item.supplier || "n/a" }}</strong>
      </div>
      <div>
        <span class="detail-label">Amount</span>
        <strong>{{ item.amount || "n/a" }} {{ item.currency || "" }}</strong>
      </div>
      <div>
        <span class="detail-label">Status</span>
        <strong>{{ item.status }}</strong>
      </div>
      <div>
        <span class="detail-label">Published</span>
        <strong>{{ item.publishedAt ? new Date(String(item.publishedAt)).toLocaleString() : "n/a" }}</strong>
      </div>
      <div>
        <span class="detail-label">Deadline</span>
        <strong>{{ item.deadlineAt ? new Date(String(item.deadlineAt)).toLocaleString() : "n/a" }}</strong>
      </div>
      <div class="detail-block">
        <span class="detail-label">Description</span>
        <p>{{ item.description || "No description" }}</p>
      </div>
      <div class="detail-block">
        <span class="detail-label">Raw payload</span>
        <pre>{{ JSON.stringify(item.rawPayload, null, 2) }}</pre>
      </div>
    </section>
  </template>
</template>
