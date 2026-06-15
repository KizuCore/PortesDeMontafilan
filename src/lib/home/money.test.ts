import { describe, expect, it } from "vitest";
import { formatMoney } from "./money";

describe("home money helpers", () => {
  it("formats euro amounts for FR and EN locales", () => {
    expect(formatMoney(1234, "fr-FR")).toBe("1 234 €");
    expect(formatMoney(1234, "en-US")).toBe("€1,234");
  });
});
