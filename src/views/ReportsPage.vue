<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apolloClient } from "../services/apollo";
import { REPORTS_QUERY } from "../services/queries";

const loading = ref(true);
const error = ref("");
const reports = ref<Array<Record<string, unknown>>>([]);

onMounted(async () => {
  try {
    const { data } = await apolloClient.query<{ reports: Array<Record<string, unknown>> }>({
      query: REPORTS_QUERY,
      fetchPolicy: "network-only"
    });
    reports.value = data.reports;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to load reports";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="page-header">
    <p class="eyebrow">Analytics</p>
    <h2>Reports</h2>
  </section>
  <div v-if="loading" class="card">Loading reports...</div>
  <div v-else-if="error" class="card error-text">{{ error }}</div>
  <section v-else class="card cards-grid">
    <article v-for="report in reports" :key="String(report.id)" class="source-card">
      <p class="eyebrow">{{ report.status }}</p>
      <h3>{{ report.name }}</h3>
      <p>{{ report.description || "No description provided." }}</p>
      <small>Updated {{ new Date(String(report.updatedAt)).toLocaleString() }}</small>
    </article>
  </section>
</template>
