import { SOURCES_QUERY, SOURCE_RUNS_QUERY } from "~/graphql/documents";
import type { Source, SourceRun } from "~/graphql/types";

export function useJobsData() {
  const apollo = useApollo();
  const loading = ref(true);
  const error = ref("");
  const sourceFilter = ref("");
  const runs = ref<SourceRun[]>([]);
  const sources = ref<Source[]>([]);

  async function loadSources() {
    try {
      const result = await apollo.query<{ sources: Source[] }>({
        query: SOURCES_QUERY,
        fetchPolicy: "network-only"
      });
      const data = result.data;

      if (!data) {
        throw new Error("Не удалось загрузить источники");
      }
      sources.value = data.sources;
    } catch {
      sources.value = [];
    }
  }

  async function load() {
    loading.value = true;
    error.value = "";

    try {
      const result = await apollo.query<{ sourceRuns: SourceRun[] }>({
        query: SOURCE_RUNS_QUERY,
        variables: {
          source: sourceFilter.value || undefined,
          limit: 30
        },
        fetchPolicy: "network-only"
      });
      const data = result.data;

      if (!data) {
        throw new Error("Не удалось загрузить запуски");
      }
      runs.value = data.sourceRuns;
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : "Не удалось загрузить запуски";
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    sourceFilter,
    runs,
    sources,
    loadSources,
    load
  };
}
