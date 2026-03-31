<script setup lang="ts">
import { onMounted, ref } from "vue";
import { apolloClient } from "../services/apollo";
import { SOURCES_QUERY } from "../services/queries";

const loading = ref(true);
const error = ref("");
const items = ref<Array<Record<string, unknown>>>([]);

onMounted(async () => {
  try {
    const { data } = await apolloClient.query<{ sources: Array<Record<string, unknown>> }>({
      query: SOURCES_QUERY,
      fetchPolicy: "network-only"
    });
    items.value = data.sources;
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : "Unable to load sources";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="page-header">
    <p class="eyebrow">Collection</p>
    <h2>Sources</h2>
  </section>
  <div v-if="loading" class="card">Loading sources...</div>
  <div v-else-if="error" class="card error-text">{{ error }}</div>
  <section v-else class="card cards-grid">
    <article v-for="item in items" :key="String(item.id)" class="source-card">
      <p class="eyebrow">{{ item.kind }}</p>
      <h3>{{ item.name }}</h3>
      <p>{{ item.description || "No description provided." }}</p>
      <a :href="String(item.baseUrl || '#')" target="_blank" rel="noreferrer">
        {{ item.code }}
      </a>
    </article>
  </section>
</template>
