import { SOURCES_QUERY, SOURCE_RUNS_QUERY } from "~/graphql/documents";
import type { Source, SourceRun } from "~/graphql/types";

export function useSourcesData() {
  const apollo = useApollo();
  const loading = ref(true);
  const error = ref("");
  const sources = ref<Source[]>([]);
  const runs = ref<SourceRun[]>([]);

  async function load() {
    loading.value = true;
    error.value = "";

    try {
      const [sourcesResult, runsResult] = await Promise.all([
        apollo.query<{ sources: Source[] }>({
          query: SOURCES_QUERY,
          fetchPolicy: "network-only"
        }),
        apollo.query<{ sourceRuns: SourceRun[] }>({
          query: SOURCE_RUNS_QUERY,
          variables: { limit: 20 },
          fetchPolicy: "network-only"
        })
      ]);

      if (!sourcesResult.data || !runsResult.data) {
        throw new Error("Не удалось загрузить источники");
      }

      sources.value = sourcesResult.data.sources;
      runs.value = runsResult.data.sourceRuns;
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : "Не удалось загрузить источники";
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    sources,
    runs,
    load
  };
}
