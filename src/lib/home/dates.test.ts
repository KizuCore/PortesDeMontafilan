import { describe, expect, it } from "vitest";
import { dateRangeIncludesBusyDate, dateToYmd, formatStayDate } from "./dates";

describe("home date helpers", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(dateToYmd(new Date("2026-07-09T12:30:00"))).toBe("2026-07-09");
  });

  it("formats stay dates for FR and EN locales", () => {
    const date = new Date("2026-07-09T12:30:00");

    expect(formatStayDate(date, "fr-FR")).toBe("09/07/2026");
    expect(formatStayDate(date, "en-US")).toBe("07/09/2026");
  });

  it("detects a range overlapping a busy range", () => {
    expect(
      dateRangeIncludesBusyDate(
        new Date("2026-07-09T00:00:00"),
        new Date("2026-07-12T00:00:00"),
        [{ start: "2026-07-10", end: "2026-07-11" }],
      ),
    ).toBe(true);
  });

  it("returns false when the range does not overlap any busy range", () => {
    expect(
      dateRangeIncludesBusyDate(
        new Date("2026-07-01T00:00:00"),
        new Date("2026-07-03T00:00:00"),
        [{ start: "2026-07-10", end: "2026-07-11" }],
      ),
    ).toBe(false);
  });
});
