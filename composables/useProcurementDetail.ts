import { PROCUREMENT_QUERY } from "~/graphql/documents";
import type { Procurement } from "~/graphql/types";

export function useProcurementDetail() {
  const apollo = useApollo();
  const loading = ref(true);
  const error = ref("");
  const item = ref<Procurement | null>(null);

  async function load(id: string) {
    loading.value = true;
    error.value = "";

    try {
      const result = await apollo.query<{ procurementItem: Procurement | null }>({
        query: PROCUREMENT_QUERY,
        variables: { id },
        fetchPolicy: "network-only"
      });
      const data = result.data;

      if (!data) {
        throw new Error("Не удалось загрузить закупку");
      }

      item.value = data.procurementItem;
    } catch (caught) {
      error.value = caught instanceof Error ? caught.message : "Не удалось загрузить закупку";
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    item,
    load
  };
}
