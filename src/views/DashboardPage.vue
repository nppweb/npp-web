<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apolloClient } from "../services/apollo";
import { DASHBOARD_QUERY } from "../services/queries";

type DashboardSummary = {
  totalProcurements: number;
  activeSources: number;
  runsLast24h: number;
  lastPublishedAt?: string;
  bySource: Array<{ source: string; count: number }>;
};

const loading = ref(true);
const error = ref("");
const summary = ref<DashboardSummary | null>(null);

onMounted(async () => {
  try {
    const { data } = await apolloClient.query<{ dashboardSummary: DashboardSummary }>({
      query: DASHBOARD_QUERY,
      fetchPolicy: "network-only"
    });
    summary.value = data.dashboardSummary;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to load dashboard";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="page-header">
    <p class="eyebrow">Operations</p>
    <h2>Dashboard</h2>
  </section>

  <div v-if="loading" class="card">Loading dashboard...</div>
  <div v-else-if="error" class="card error-text">{{ error }}</div>
  <template v-else-if="summary">
    <div class="stats-grid">
      <article class="stat-card">
        <span>Total procurements</span>
        <strong>{{ summary.totalProcurements }}</strong>
      </article>
      <article class="stat-card">
        <span>Active sources</span>
        <strong>{{ summary.activeSources }}</strong>
      </article>
      <article class="stat-card">
        <span>Runs in last 24h</span>
        <strong>{{ summary.runsLast24h }}</strong>
      </article>
      <article class="stat-card">
        <span>Last published</span>
        <strong>{{ summary.lastPublishedAt ? new Date(summary.lastPublishedAt).toLocaleString() : "n/a" }}</strong>
      </article>
    </div>

    <section class="card">
      <div class="section-title">
        <h3>Coverage by source</h3>
      </div>
      <div class="bar-list">
        <div v-for="item in summary.bySource" :key="item.source" class="bar-row">
          <div class="bar-label">
            <strong>{{ item.source }}</strong>
            <span>{{ item.count }}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: `${Math.min(item.count * 10, 100)}%` }"></div>
          </div>
        </div>
      </div>
    </section>
  </template>
</template>
