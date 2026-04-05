const NPP_LABEL_PATTERN = /[А-ЯЁA-Z][^,.()]{2,}?атомная станция(?:-\d+)?/i;

export const NPP_FOCUS_OPTIONS = [
  "Балаковская атомная станция",
  "Белоярская атомная станция",
  "Билибинская атомная станция",
  "Калининская атомная станция",
  "Кольская атомная станция",
  "Курская атомная станция",
  "Ленинградская атомная станция",
  "Нововоронежская атомная станция",
  "Ростовская атомная станция",
  "Смоленская атомная станция"
] as const;

export function getProcurementNppFocus(rawPayload?: Record<string, unknown> | null): string | null {
  if (!rawPayload || typeof rawPayload !== "object") {
    return null;
  }

  const sourceSpecificData = asRecord(rawPayload.sourceSpecificData);
  const explicitStationName = asString(sourceSpecificData?.targetStationName);
  if (explicitStationName) {
    return explicitStationName;
  }

  const matchedQuery = asString(sourceSpecificData?.matchedQuery);
  if (matchedQuery && NPP_LABEL_PATTERN.test(matchedQuery)) {
    return matchedQuery.match(NPP_LABEL_PATTERN)?.[0] ?? matchedQuery;
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
