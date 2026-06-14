import { createServerFn } from "@tanstack/react-start";

import { parseBusyRangesFromIcs, type BusyRange } from "../../../shared/availability";

const DEFAULT_ICAL_FETCH_TIMEOUT_MS = 6000;

async function fetchBusyRanges(icalUrl: string): Promise<BusyRange[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_ICAL_FETCH_TIMEOUT_MS);

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

// Récupère les indisponibilités Airbnb côté serveur.
export const getAvailabilityRanges = createServerFn({ method: "GET" }).handler(async () => {
  const icalUrl = process.env.AIRBNB_ICAL_URL?.trim();
  if (!icalUrl) {
    throw new Error("Calendrier Airbnb non configuré (AIRBNB_ICAL_URL).");
  }

  const busyRanges = await fetchBusyRanges(icalUrl);
  return {
    busyRanges: busyRanges.sort((a, b) => a.start.localeCompare(b.start)),
  };
});