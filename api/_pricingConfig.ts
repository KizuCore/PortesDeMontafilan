import { defaultPricingConfig } from "../shared/pricing.js";
import type { PricingConfig } from "../shared/pricing.js";

// Delais de securite: on evite de bloquer la requete trop longtemps sur Google Sheets.
const DEFAULT_SHEETS_FETCH_TIMEOUT_MS = 6000;
const DEFAULT_SHEETS_CACHE_TTL_MS = 5 * 60 * 1000;

const PRICING_KEYS = Object.keys(defaultPricingConfig) as Array<
  keyof PricingConfig
>;

// Cache en memoire du dernier fichier CSV valide, partage entre requetes.
let cachedGoogleSheetPricingConfig: PricingConfig | null = null;
let cachedGoogleSheetPricingExpiresAt = 0;

// Verifie qu'une cle CSV correspond bien a une cle de PricingConfig.
function isPricingConfigKey(value: string): value is keyof PricingConfig {
  return PRICING_KEYS.includes(value as keyof PricingConfig);
}

// Parseur CSV minimal: gere les virgules en dehors des guillemets.
function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const isEscapedQuote = inQuotes && line[index + 1] === '"';
      if (isEscapedQuote) {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

// Convertit les nombres FR/EN (virgule ou point) en nombre JS.
function parseNumberValue(raw: string): number | null {
  const normalized = raw
    .replace(/\s+/g, "")
    .replace(/[^0-9,.-]/g, "")
    .replace(",", ".");
  if (!normalized) {
    return null;
  }
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

// Construit une config de prix complete en partant des valeurs locales par defaut.
// Si une ligne est invalide, on ignore la ligne sans casser le reste.
function parsePricingConfigFromCsv(csvData: string): PricingConfig {
  const nextPricingConfig: PricingConfig = { ...defaultPricingConfig };
  const lines = csvData
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("#")) {
      continue;
    }

    const [rawKey = "", rawValue = ""] = parseCsvLine(line);
    const key = rawKey.trim();
    const lowerKey = key.toLowerCase();

    if (lowerKey === "key" || lowerKey === "cle" || lowerKey === "clé") {
      continue;
    }

    if (!isPricingConfigKey(key)) {
      continue;
    }

    const parsedValue = parseNumberValue(rawValue);
    if (parsedValue === null) {
      continue;
    }

    nextPricingConfig[key] = parsedValue;
  }

  return nextPricingConfig;
}

// Telecharge la feuille Google Sheets au format CSV puis la transforme en config utilisable.
async function fetchGoogleSheetPricingConfig(
  csvUrl: string,
): Promise<PricingConfig> {
  const controller = new AbortController();
  // AbortController evite qu'une feuille Google lente bloque toute la reponse serverless.
  const timeout = setTimeout(
    () => controller.abort(),
    DEFAULT_SHEETS_FETCH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(csvUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Google Sheets HTTP ${response.status}`);
    }

    const csvData = await response.text();
    return parsePricingConfigFromCsv(csvData);
  } finally {
    clearTimeout(timeout);
  }
}

// Point d'entree unique pour les tarifs:
// 1) Google Sheets si configure et disponible
// 2) fallback local par defaut sinon
export async function resolvePricingConfig(): Promise<{
  pricingConfig: PricingConfig;
  warning?: string;
  source: "google-sheets" | "default";
}> {
  const csvUrl = process.env.GOOGLE_SHEETS_PRICING_CSV_URL?.trim();
  if (!csvUrl) {
    return { pricingConfig: defaultPricingConfig, source: "default" };
  }

  const now = Date.now();
  if (
    cachedGoogleSheetPricingConfig &&
    now < cachedGoogleSheetPricingExpiresAt
  ) {
    // Le cache garde la derniere config valide pour reduire les appels Sheets et lisser les erreurs temporaires.
    return {
      pricingConfig: cachedGoogleSheetPricingConfig,
      source: "google-sheets",
    };
  }

  try {
    const pricingConfig = await fetchGoogleSheetPricingConfig(csvUrl);
    cachedGoogleSheetPricingConfig = pricingConfig;
    cachedGoogleSheetPricingExpiresAt = now + DEFAULT_SHEETS_CACHE_TTL_MS;
    return { pricingConfig, source: "google-sheets" };
  } catch {
    return {
      pricingConfig: defaultPricingConfig,
      warning:
        "Tarifs Google Sheets indisponibles, estimation locale appliquee.",
      source: "default",
    };
  }
}
