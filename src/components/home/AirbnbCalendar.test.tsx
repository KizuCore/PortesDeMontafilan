import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AirbnbCalendar } from "./AirbnbCalendar";
import { createI18nMock } from "@/test/homeI18n";
import { defaultPricingConfig } from "../../../shared/pricing";

const getReservationEstimateMock = vi.fn();
const getPricingConfigMock = vi.fn();
const getAirbnbRedirectUrlMock = vi.fn();

vi.mock("@/lib/i18n", () => ({
  useI18n: () => createI18nMock(),
}));

vi.mock("@/components/AnimatedSection", () => ({
  AnimatedSection: ({
    children,
    className,
  }: {
    children: ReactNode;
    className?: string;
  }) => <div className={className}>{children}</div>,
}));

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: { onSelect: (range: unknown) => void }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onSelect({
            from: new Date("2026-07-01T00:00:00"),
            to: new Date("2026-07-03T00:00:00"),
          })
        }
      >
        Select available dates
      </button>
      <button
        type="button"
        onClick={() =>
          onSelect({
            from: new Date("2026-07-10T00:00:00"),
            to: new Date("2026-07-12T00:00:00"),
          })
        }
      >
        Select busy dates
      </button>
    </div>
  ),
}));

vi.mock("@/lib/api/estimate.functions", () => ({
  getPricingConfig: (...args: unknown[]) => getPricingConfigMock(...args),
  getReservationEstimate: (...args: unknown[]) =>
    getReservationEstimateMock(...args),
}));

vi.mock("@/lib/api/airbnb-link.functions", () => ({
  getAirbnbRedirectUrl: (...args: unknown[]) =>
    getAirbnbRedirectUrlMock(...args),
}));

function mockAvailability(
  busyRanges = [{ start: "2026-07-10", end: "2026-07-11" }],
) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    json: async () => ({ busyRanges }),
  } as Response);
}

describe("AirbnbCalendar", () => {
  beforeEach(() => {
    getPricingConfigMock.mockReset();
    getReservationEstimateMock.mockReset();
    getAirbnbRedirectUrlMock.mockReset();

    getPricingConfigMock.mockResolvedValue({
      pricingConfig: defaultPricingConfig,
      source: "default",
    });
    getReservationEstimateMock.mockResolvedValue({
      estimate: {
        nights: 2,
        season: "mid",
        minNightsRequired: 2,
        rateBreakdown: [
          { season: "mid", nights: 2, nightlyRate: 60, subtotal: 120 },
        ],
        stayBasePrice: 120,
        cleaningFee: 60,
        touristTax: 3,
        towelPacksPrice: 0,
        totalEstimated: 123,
        valid: true,
      },
    });
    getAirbnbRedirectUrlMock.mockResolvedValue({
      redirectUrl: "https://airbnb.example/reserve",
    });
    mockAvailability();
  });

  it("disables reservation requests when no dates are selected", async () => {
    render(<AirbnbCalendar />);

    expect(
      screen.getByRole("button", { name: "Demander ces dates" }),
    ).toBeDisabled();
  });

  it("prevents selecting a range containing a busy range", async () => {
    const user = userEvent.setup();
    render(<AirbnbCalendar />);

    await waitFor(() =>
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/availability"),
    );
    await user.click(screen.getByRole("button", { name: "Select busy dates" }));

    expect(
      await screen.findByText("Cette periode contient une date indisponible."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Demander ces dates" }),
    ).toBeDisabled();
  });

  it("shows a valid estimate returned by the API", async () => {
    const user = userEvent.setup();
    render(<AirbnbCalendar />);

    await user.click(
      screen.getByRole("button", { name: "Select available dates" }),
    );

    await waitFor(() => expect(getReservationEstimateMock).toHaveBeenCalled());
    expect(
      screen.getByText((text) => text.includes("123")),
    ).toBeInTheDocument();
    expect(
      screen.getByText((text) => text.includes("Taxe incluse")),
    ).toBeInTheDocument();
  });

  it("shows an estimate error when the estimate API fails", async () => {
    const user = userEvent.setup();
    getReservationEstimateMock.mockRejectedValue(new Error("ESTIMATE_DOWN"));

    render(<AirbnbCalendar />);
    await user.click(
      screen.getByRole("button", { name: "Select available dates" }),
    );

    expect(await screen.findByText("ESTIMATE_DOWN")).toBeInTheDocument();
  });
});
