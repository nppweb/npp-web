<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { apolloClient } from "../services/apollo";
import { PROCUREMENTS_QUERY } from "../services/queries";

type Procurement = {
  id: string;
  externalId: string;
  source: string;
  title: string;
  customer?: string;
  supplier?: string;
  amount?: number;
  currency?: string;
  status: string;
  publishedAt?: string;
};

const router = useRouter();
const loading = ref(false);
const error = ref("");
const search = ref("");
const items = ref<Procurement[]>([]);
const total = ref(0);

async function load() {
  loading.value = true;
  error.value = "";
  try {
    const { data } = await apolloClient.query<{
      procurementItems: { total: number; items: Procurement[] };
    }>({
      query: PROCUREMENTS_QUERY,
      variables: {
        filter: search.value ? { search: search.value } : undefined,
        sort: { field: "PUBLISHED_AT", direction: "DESC" },
        limit: 25,
        offset: 0
      },
      fetchPolicy: "network-only"
    });
    items.value = data.procurementItems.items;
    total.value = data.procurementItems.total;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to load procurements";
  } finally {
    loading.value = false;
  }
}

watch(search, () => {
  void load();
});

onMounted(() => {
  void load();
});
</script>

<template>
  <section class="page-header">
    <div>
      <p class="eyebrow">Catalogue</p>
      <h2>Procurements</h2>
    </div>
    <div class="search-box">
      <input v-model="search" placeholder="Search by title, customer, supplier" />
    </div>
  </section>

  <div v-if="loading" class="card">Loading procurements...</div>
  <div v-else-if="error" class="card error-text">{{ error }}</div>
  <section v-else class="card">
    <div class="section-title">
      <h3>{{ total }} results</h3>
    </div>
    <div v-if="items.length === 0" class="empty-state">No procurements matched your filters.</div>
    <table v-else class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Source</th>
          <th>Customer</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Published</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.id"
          class="clickable-row"
          @click="router.push(`/procurements/${item.id}`)"
        >
          <td>{{ item.title }}</td>
          <td>{{ item.source }}</td>
          <td>{{ item.customer || "n/a" }}</td>
          <td>{{ item.amount ? `${item.amount.toLocaleString()} ${item.currency || ""}` : "n/a" }}</td>
          <td><span class="role-chip">{{ item.status }}</span></td>
          <td>{{ item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "n/a" }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
