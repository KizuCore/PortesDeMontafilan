import { addDays } from "date-fns";
import type { BusyRange } from "../../../shared/availability";

export function dateToYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatStayDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function dateRangeIncludesBusyDate(
  from: Date,
  to: Date,
  busyRanges: BusyRange[],
) {
  let cursor = dateToYmd(from);
  const end = dateToYmd(to);

  // Airbnb expose les periodes occupees avec une date de fin exclusive: on teste chaque nuit, pas le jour de depart.
  while (cursor < end) {
    if (
      busyRanges.some((range) => cursor >= range.start && cursor < range.end)
    ) {
      return true;
    }

    cursor = dateToYmd(addDays(new Date(`${cursor}T00:00:00`), 1));
  }

  return false;
}
