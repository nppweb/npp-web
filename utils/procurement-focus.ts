const NPP_LABEL_PATTERN = /[А-ЯЁA-Z][^,.()]{2,}?атомная станция(?:-\d+)?/i;

const NPP_FOCUS_MATCHERS = [
  {
    canonical: "Балаковская атомная станция",
    variants: ["балаковская атомная станция", "балаковская аэс", "балаковская аэс-авто"]
  },
  {
    canonical: "Белоярская атомная станция",
    variants: ["белоярская атомная станция", "белоярская аэс"]
  },
  {
    canonical: "Билибинская атомная станция",
    variants: ["билибинская атомная станция", "билибинская аэс"]
  },
  {
    canonical: "Калининская атомная станция",
    variants: ["калининская атомная станция", "калининская аэс", "калининская аэс-сервис"]
  },
  {
    canonical: "Кольская атомная станция",
    variants: ["кольская атомная станция", "кольская аэс"]
  },
  {
    canonical: "Курская атомная станция",
    variants: ["курская атомная станция", "курская аэс", "курская аэс-сервис"]
  },
  {
    canonical: "Ленинградская атомная станция",
    variants: ["ленинградская атомная станция", "ленинградская аэс", "ленинградская аэс-авто"]
  },
  {
    canonical: "Нововоронежская атомная станция",
    variants: ["нововоронежская атомная станция", "нововоронежская аэс"]
  },
  {
    canonical: "Ростовская атомная станция",
    variants: ["ростовская атомная станция", "ростовская аэс"]
  },
  {
    canonical: "Смоленская атомная станция",
    variants: ["смоленская атомная станция", "смоленская аэс", "смоленская аэс-сервис"]
  }
] as const;

export const NPP_FOCUS_OPTIONS = NPP_FOCUS_MATCHERS.map((item) => item.canonical) as ReadonlyArray<string>;

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

  const searchHaystack = [matchedQuery, asString(sourceSpecificData?.customerName)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (searchHaystack) {
    return (
      NPP_FOCUS_MATCHERS.find((item) => item.variants.some((variant) => searchHaystack.includes(variant)))
        ?.canonical ?? null
    );
  }

  return null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
