import { REPORTS_QUERY } from "~/graphql/documents";
import type { Report } from "~/graphql/types";

export function useReportsData() {
  const apollo = useApollo();
  const loading = ref(true);
  const error = ref("");
  const reports = ref<Report[]>([]);

  async function load() {
    loading.value = true;
    error.value = "";

    try {
      const result = await apollo.query<{ reports: Report[] }>({
        query: REPORTS_QUERY,
        fetchPolicy: "network-only"
      });
      const data = result.data;

      if (!data) {
        throw new Error("Не удалось загрузить отчёты");
      }
      reports.value = data.reports;
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : "Не удалось загрузить отчёты";
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    reports,
    load
  };
}
