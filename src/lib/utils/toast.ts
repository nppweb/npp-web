import { reactive } from "vue";

export type ToastVariant = "default" | "success" | "warning" | "destructive";

export type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
};

const state = reactive({
  items: [] as ToastItem[]
});

let nextId = 1;

function pushToast(input: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}) {
  const item: ToastItem = {
    id: nextId++,
    title: input.title,
    description: input.description,
    variant: input.variant ?? "default",
    duration: input.duration ?? 4000
  };

  state.items.push(item);

  window.setTimeout(() => {
    dismissToast(item.id);
  }, item.duration);

  return item.id;
}

export function dismissToast(id: number) {
  const index = state.items.findIndex((item) => item.id === id);
  if (index >= 0) {
    state.items.splice(index, 1);
  }
}

export function useToastState() {
  return state;
}

export const toast = {
  show: pushToast,
  success(title: string, description?: string) {
    return pushToast({ title, description, variant: "success" });
  },
  warning(title: string, description?: string) {
    return pushToast({ title, description, variant: "warning" });
  },
  error(title: string, description?: string) {
    return pushToast({ title, description, variant: "destructive" });
  }
};
