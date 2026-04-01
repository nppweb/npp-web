const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short"
});

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium"
});

const compactNumberFormatter = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1
});

const wholeNumberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0
});

const enumLabels: Record<string, string> = {
  USER: "Пользователь",
  ANALYST: "Аналитик",
  ADMIN: "Администратор",
  DRAFT: "Черновик",
  ACTIVE: "Активна",
  CLOSED: "Завершена",
  ARCHIVED: "В архиве",
  DEMO: "Демо",
  FIND_TENDER: "FindTender",
  PENDING: "В очереди",
  RUNNING: "Выполняется",
  SUCCESS: "Успешно",
  PARTIAL: "Частично",
  FAILED: "Ошибка",
  READY: "Готов",
  INACTIVE: "Неактивен"
};

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "Нет данных";
  }

  return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Нет данных";
  }

  return dateFormatter.format(new Date(value));
}

export function formatCurrency(amount?: number | null, currency?: string | null) {
  if (amount === null || amount === undefined) {
    return "Нет данных";
  }

  const normalizedCurrency = currency?.trim();
  if (!normalizedCurrency) {
    return wholeNumberFormatter.format(amount);
  }

  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: normalizedCurrency,
      maximumFractionDigits: 0
    }).format(amount);
  } catch {
    return `${wholeNumberFormatter.format(amount)} ${normalizedCurrency}`;
  }
}

export function formatNumber(value?: number | null) {
  if (value === null || value === undefined) {
    return "0";
  }

  return wholeNumberFormatter.format(value);
}

export function formatCompactNumber(value: number) {
  return compactNumberFormatter.format(value);
}

export function formatDuration(startedAt?: string | null, finishedAt?: string | null) {
  if (!startedAt || !finishedAt) {
    return "Нет данных";
  }

  const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    return "Нет данных";
  }

  const minutes = Math.round(durationMs / 60000);
  if (minutes < 1) {
    return "< 1 мин";
  }

  if (minutes < 60) {
    return `${minutes} мин`;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return restMinutes ? `${hours} ч ${restMinutes} мин` : `${hours} ч`;
}

export function formatEnumLabel(value: string) {
  if (enumLabels[value]) {
    return enumLabels[value];
  }

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatRoleLabel(value?: string | null) {
  if (!value) {
    return "Роль не задана";
  }

  return formatEnumLabel(value);
}

export function statusTone(value?: string | null) {
  const normalized = (value ?? "").toUpperCase();

  if (["READY", "SUCCESS", "ACTIVE", "ADMIN"].includes(normalized)) {
    return "is-success";
  }

  if (["PENDING", "RUNNING", "PARTIAL", "ANALYST", "CLOSED"].includes(normalized)) {
    return "is-warning";
  }

  if (["FAILED", "ARCHIVED", "DRAFT", "INACTIVE"].includes(normalized)) {
    return "is-danger";
  }

  return "is-neutral";
}

export function badgeTone(value?: string | null): "neutral" | "success" | "warning" | "danger" {
  return statusTone(value).replace("is-", "") as "neutral" | "success" | "warning" | "danger";
}
