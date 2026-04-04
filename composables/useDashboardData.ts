import { DASHBOARD_QUERY } from "~/graphql/documents";
import type { DashboardSummary } from "~/graphql/types";

export function useDashboardData() {
  const apollo = useApollo();
  const loading = ref(true);
  const error = ref("");
  const summary = ref<DashboardSummary | null>(null);

  async function load() {
    loading.value = true;
    error.value = "";

    try {
      const result = await apollo.query<{ dashboardSummary: DashboardSummary }>({
        query: DASHBOARD_QUERY,
        fetchPolicy: "network-only"
      });
      const data = result.data;

      if (!data) {
        throw new Error("Не удалось загрузить дашборд");
      }

      summary.value = data.dashboardSummary;
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : "Не удалось загрузить дашборд";
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    summary,
    load
  };
}
