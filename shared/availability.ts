export interface BusyRange {
  start: string;
  end: string;
}

// Transforme une date iCal YYYYMMDD en objet UTC.
function toUtcDateFromYmd(ymd: string): Date | null {
  if (!/^\d{8}$/.test(ymd)) {
    return null;
  }

  const year = Number(ymd.slice(0, 4));
  const monthIndex = Number(ymd.slice(4, 6)) - 1;
  const day = Number(ymd.slice(6, 8));

  const date = new Date(Date.UTC(year, monthIndex, day));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function dateToIsoYmd(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseIcsDateValue(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }

  const token = raw.trim().slice(0, 8);
  const date = toUtcDateFromYmd(token);
  return date ? dateToIsoYmd(date) : null;
}

// Déplie les lignes iCal "folded" sur plusieurs lignes.
function unfoldIcs(ics: string): string {
  return ics.replace(/\r?\n[ \t]/g, '');
}

// Extrait les périodes occupées d'un export iCal Airbnb.
export function parseBusyRangesFromIcs(ics: string): BusyRange[] {
  const unfolded = unfoldIcs(ics);
  const lines = unfolded.split(/\r?\n/);
  const ranges: BusyRange[] = [];

  let inEvent = false;
  let status: string | undefined;
  let startValue: string | undefined;
  let endValue: string | undefined;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      status = undefined;
      startValue = undefined;
      endValue = undefined;
      continue;
    }

    if (line === 'END:VEVENT') {
      if (inEvent && status !== 'CANCELLED') {
        const start = parseIcsDateValue(startValue);
        const end = parseIcsDateValue(endValue);
        if (start && end && start < end) {
          ranges.push({ start, end });
        }
      }

      inEvent = false;
      continue;
    }

    if (!inEvent) {
      continue;
    }

    if (line.startsWith('STATUS:')) {
      status = line.slice('STATUS:'.length).trim().toUpperCase();
      continue;
    }

    if (line.startsWith('DTSTART')) {
      const separator = line.indexOf(':');
      if (separator >= 0) {
        startValue = line.slice(separator + 1);
      }
      continue;
    }

    if (line.startsWith('DTEND')) {
      const separator = line.indexOf(':');
      if (separator >= 0) {
        endValue = line.slice(separator + 1);
      }
    }
  }

  return ranges;
}

function overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && endA > startB;
}

// Cherche la première plage Airbnb en conflit avec le séjour demandé.
export function findConflictRange(ranges: BusyRange[], checkIn: string, checkOut: string): BusyRange | null {
  return ranges.find((range) => overlaps(checkIn, checkOut, range.start, range.end)) ?? null;
}
