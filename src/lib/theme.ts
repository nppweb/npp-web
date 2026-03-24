interface ThemePalette {
  accent: string;
  accent2: string;
  accentGlow: string;
  accent2Glow: string;
  bgGlowA: string;
  bgGlowB: string;
}

const PALETTES: ThemePalette[] = [
  {
    accent: "#0b2f7a",
    accent2: "#17c6d6",
    accentGlow: "rgba(11, 47, 122, 0.5)",
    accent2Glow: "rgba(23, 198, 214, 0.36)",
    bgGlowA: "rgba(11, 47, 122, 0.19)",
    bgGlowB: "rgba(23, 198, 214, 0.16)"
  },
  {
    accent: "#073f95",
    accent2: "#1eaec9",
    accentGlow: "rgba(7, 63, 149, 0.48)",
    accent2Glow: "rgba(30, 174, 201, 0.35)",
    bgGlowA: "rgba(7, 63, 149, 0.18)",
    bgGlowB: "rgba(30, 174, 201, 0.15)"
  },
  {
    accent: "#0b1f67",
    accent2: "#26d3db",
    accentGlow: "rgba(11, 31, 103, 0.5)",
    accent2Glow: "rgba(38, 211, 219, 0.34)",
    bgGlowA: "rgba(11, 31, 103, 0.18)",
    bgGlowB: "rgba(38, 211, 219, 0.14)"
  }
];

const STORAGE_KEY = "aimsora_palette_index";

const readPreviousIndex = (): number | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) {
      return null;
    }

    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
      return null;
    }

    if (parsed < 0 || parsed >= PALETTES.length) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const storeIndex = (index: number): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(index));
  } catch {
    // ignore storage errors in private mode
  }
};

const pickPaletteIndex = (): number => {
  if (PALETTES.length === 1) {
    return 0;
  }

  const previous = readPreviousIndex();
  if (previous === null) {
    return Math.floor(Math.random() * PALETTES.length);
  }

  const candidates = PALETTES.map((_, index) => index).filter((index) => index !== previous);
  return candidates[Math.floor(Math.random() * candidates.length)];
};

export const applyRandomPalette = (): void => {
  const root = document.documentElement;
  const index = pickPaletteIndex();
  const palette = PALETTES[index];

  root.style.setProperty("--accent", palette.accent);
  root.style.setProperty("--accent-2", palette.accent2);
  root.style.setProperty("--accent-glow", palette.accentGlow);
  root.style.setProperty("--accent-2-glow", palette.accent2Glow);
  root.style.setProperty("--bg-glow-a", palette.bgGlowA);
  root.style.setProperty("--bg-glow-b", palette.bgGlowB);

  storeIndex(index);
};
