import { SOURCES_QUERY, SOURCE_RUNS_PAGE_QUERY } from "~/graphql/documents";
import type { Source, SourceRun, SourceRunPage } from "~/graphql/types";

export function useParserRunsData() {
  const apollo = useApollo();
  const { loading, error, begin, fail, finish } = useRequestState(true);
  const sourceFilter = ref("");
  const runs = ref<SourceRun[]>([]);
  const total = ref(0);
  const sources = ref<Source[]>([]);
  const page = ref(1);
  const pageSize = 12;

  async function loadSources() {
    try {
      const result = await apollo.query<{ sources: Source[] }>({
        query: SOURCES_QUERY,
        fetchPolicy: "network-only"
      });
      const data = requireRequestData(result.data, "Не удалось загрузить источники");
      sources.value = data.sources;
    } catch {
      sources.value = [];
    }
  }

  async function load() {
    begin();

    try {
      const result = await apollo.query<{ sourceRunsPage: SourceRunPage }>({
        query: SOURCE_RUNS_PAGE_QUERY,
        variables: {
          source: sourceFilter.value || undefined,
          limit: pageSize,
          offset: (page.value - 1) * pageSize
        },
        fetchPolicy: "network-only"
      });
      const data = requireRequestData(result.data, "Не удалось загрузить историю прогонов");
      runs.value = data.sourceRunsPage.items;
      total.value = data.sourceRunsPage.total;
    } catch (caught) {
      fail(caught, "Не удалось загрузить историю прогонов");
    } finally {
      finish();
    }
  }

  async function setPage(value: number) {
    page.value = value;
    await load();
  }

  async function applySourceFilter(value: string) {
    sourceFilter.value = value;
    page.value = 1;
    await load();
  }

  return {
    loading,
    error,
    sourceFilter,
    runs,
    total,
    sources,
    page,
    pageSize,
    loadSources,
    load,
    setPage,
    applySourceFilter
  };
}
