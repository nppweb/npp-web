<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apolloClient } from "../services/apollo";
import { SOURCE_RUNS_QUERY } from "../services/queries";

const loading = ref(true);
const error = ref("");
const runs = ref<Array<Record<string, unknown>>>([]);

onMounted(async () => {
  try {
    const { data } = await apolloClient.query<{ sourceRuns: Array<Record<string, unknown>> }>({
      query: SOURCE_RUNS_QUERY,
      variables: { limit: 30 },
      fetchPolicy: "network-only"
    });
    runs.value = data.sourceRuns;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to load jobs";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="page-header">
    <p class="eyebrow">Pipeline</p>
    <h2>Collection Jobs</h2>
  </section>
  <div v-if="loading" class="card">Loading jobs...</div>
  <div v-else-if="error" class="card error-text">{{ error }}</div>
  <section v-else class="card">
    <table class="table">
      <thead>
        <tr>
          <th>Run key</th>
          <th>Source</th>
          <th>Status</th>
          <th>Started</th>
          <th>Published</th>
          <th>Failed</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="run in runs" :key="String(run.id)">
          <td>{{ run.runKey }}</td>
          <td>{{ run.sourceCode }}</td>
          <td>{{ run.status }}</td>
          <td>{{ run.startedAt ? new Date(String(run.startedAt)).toLocaleString() : "n/a" }}</td>
          <td>{{ run.itemsPublished }}</td>
          <td>{{ run.itemsFailed }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
