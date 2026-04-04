export type ToastVariant = "default" | "success" | "warning" | "destructive";

export type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
};

let nextToastId = 1;

export function useToastState() {
  return useState<ToastItem[]>("toast.items", () => []);
}

function dismissToast(id: number) {
  const items = useToastState();
  items.value = items.value.filter((item) => item.id !== id);
}

function pushToast(input: {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}) {
  const items = useToastState();
  const toast: ToastItem = {
    id: nextToastId++,
    title: input.title,
    description: input.description,
    variant: input.variant ?? "default",
    duration: input.duration ?? 4000
  };

  items.value = [...items.value, toast];

  if (import.meta.client) {
    window.setTimeout(() => dismissToast(toast.id), toast.duration);
  }

  return toast.id;
}

export function useToast() {
  return {
    dismiss: dismissToast,
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
}
