import type { BusyRange } from "../../../shared/availability";

export async function getAvailabilityRanges(): Promise<{
  busyRanges: BusyRange[];
}> {
  const response = await fetch("/api/availability");
  const payload = (await response.json().catch(() => null)) as {
    busyRanges?: BusyRange[];
    error?: string;
  } | null;

  if (!response.ok || !Array.isArray(payload?.busyRanges)) {
    throw new Error(payload?.error ?? `HTTP ${response.status}`);
  }

  return { busyRanges: payload.busyRanges };
}
