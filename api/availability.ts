import { parseBusyRangesFromIcs } from '../shared/availability.js';

interface Req {
  method?: string;
}

interface Res {
  status: (code: number) => Res;
  json: (payload: unknown) => void;
}

const DEFAULT_ICAL_FETCH_TIMEOUT_MS = 6000;

// Récupère et parse le flux iCal Airbnb.
async function fetchBusyRanges(icalUrl: string): Promise<ReturnType<typeof parseBusyRangesFromIcs>> {
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

export default async function handler(req: Req, res: Res) {
  try {
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method Not Allowed' });
      return;
    }

    const icalUrl = process.env.AIRBNB_ICAL_URL;
    if (!icalUrl) {
      res.status(503).json({ error: 'Calendrier Airbnb non configuré (AIRBNB_ICAL_URL).' });
      return;
    }

    const busyRanges = await fetchBusyRanges(icalUrl);
    const sortedRanges = busyRanges.sort((a, b) => a.start.localeCompare(b.start));

    res.status(200).json({
      busyRanges: sortedRanges,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'AVAILABILITY_HANDLER_FAILED';
    console.error('[api/availability] failed', error);
    res.status(502).json({ error: `Calendrier Airbnb indisponible pour le moment. (${message})` });
  }
}
