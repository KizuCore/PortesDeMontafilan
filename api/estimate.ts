import {
  findConflictRange,
  parseBusyRangesFromIcs,
} from "../shared/availability.js";
import { estimateReservation } from "../shared/pricing.js";
import { resolvePricingConfig } from "./_pricingConfig.js";

interface Req {
  method?: string;
  body?: {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    towelPacks?: number;
  };
}

interface Res {
  status: (code: number) => Res;
  json: (payload: unknown) => void;
}

const DEFAULT_ICAL_FETCH_TIMEOUT_MS = 6000;
const MIN_ADULTS = 1;
const MAX_ADULTS = 4;
const MIN_CHILDREN = 0;
const MAX_CHILDREN = 3;
const MAX_GUESTS = 4;
const MIN_TOWEL_PACKS = 0;
const MAX_TOWEL_PACKS = 24;

// Empile les avertissements sans dupliquer le meme message.
function addWarning(
  baseWarning: string | undefined,
  nextWarning: string,
): string {
  if (!baseWarning) {
    return nextWarning;
  }

  if (baseWarning.includes(nextWarning)) {
    return baseWarning;
  }

  return `${baseWarning} ${nextWarning}`;
}

async function fetchBusyRanges(
  icalUrl: string,
): Promise<ReturnType<typeof parseBusyRangesFromIcs>> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    DEFAULT_ICAL_FETCH_TIMEOUT_MS,
  );

  try {
    const response = await fetch(icalUrl, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Calendar HTTP ${response.status}`);
    }

    const icsData = await response.text();
    return parseBusyRangesFromIcs(icsData);
  } finally {
    clearTimeout(timeout);
  }
}

function parseBoundedInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number | null {
  const parsedValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsedValue)) {
    // Absence de champ: on applique le defaut; valeur hors bornes: on refuse plus bas.
    return fallback;
  }

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < min ||
    parsedValue > max
  ) {
    return null;
  }

  return parsedValue;
}

// Route principale d'estimation:
// - calcule le prix avec la config resolue (Sheets ou local)
// - controle ensuite la disponibilite Airbnb via iCal
export default async function handler(req: Req, res: Res) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const { checkIn, checkOut } = req.body ?? {};

    if (!checkIn || !checkOut) {
      res.status(400).json({ error: "Dates required" });
      return;
    }

    const adults = parseBoundedInteger(
      req.body?.adults,
      MIN_ADULTS,
      MIN_ADULTS,
      MAX_ADULTS,
    );
    if (adults === null) {
      res.status(400).json({
        error: `Adults must be an integer between ${MIN_ADULTS} and ${MAX_ADULTS}.`,
      });
      return;
    }

    const children = parseBoundedInteger(
      req.body?.children,
      MIN_CHILDREN,
      MIN_CHILDREN,
      MAX_CHILDREN,
    );
    if (children === null) {
      res.status(400).json({
        error: `Children must be an integer between ${MIN_CHILDREN} and ${MAX_CHILDREN}.`,
      });
      return;
    }

    if (adults + children > MAX_GUESTS) {
      res.status(400).json({ error: "GUEST_CAPACITY_EXCEEDED" });
      return;
    }

    const towelPacks = parseBoundedInteger(
      req.body?.towelPacks,
      MIN_TOWEL_PACKS,
      MIN_TOWEL_PACKS,
      MAX_TOWEL_PACKS,
    );
    if (towelPacks === null) {
      res.status(400).json({
        error: `Towel packs must be an integer between ${MIN_TOWEL_PACKS} and ${MAX_TOWEL_PACKS}.`,
      });
      return;
    }

    // Source de prix unique partagee avec /api/pricing-config.
    const { pricingConfig, warning: pricingWarning } =
      await resolvePricingConfig();

    const estimate = estimateReservation(
      {
        checkIn,
        checkOut,
        adults,
        towelPacks,
      },
      pricingConfig,
    );

    if (pricingWarning) {
      estimate.warning = addWarning(estimate.warning, pricingWarning);
    }

    // Verification de disponibilite: on annule la validite si un conflit iCal est detecte.
    const icalUrl = process.env.AIRBNB_ICAL_URL;
    if (icalUrl) {
      try {
        const busyRanges = await fetchBusyRanges(icalUrl);
        const conflict = findConflictRange(busyRanges, checkIn, checkOut);

        if (conflict) {
          estimate.valid = false;
          estimate.warning = addWarning(
            estimate.warning,
            `Dates indisponibles sur Airbnb: ${conflict.start} -> ${conflict.end}.`,
          );
        }
      } catch {
        estimate.warning = addWarning(
          estimate.warning,
          "Disponibilite Airbnb non verifiee pour le moment.",
        );
      }
    } else {
      estimate.warning = addWarning(
        estimate.warning,
        "Calendrier Airbnb non configure (AIRBNB_ICAL_URL).",
      );
    }

    res.status(200).json({ estimate });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "ESTIMATE_HANDLER_FAILED";
    res.status(500).json({ error: message });
  }
}
