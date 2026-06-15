import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Home } from "./index";
import { createI18nMock } from "@/test/homeI18n";

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
  Calendar: () => <div data-testid="calendar" />,
}));

vi.mock("@/lib/api/estimate.functions", () => ({
  getPricingConfig: vi.fn().mockResolvedValue({
    pricingConfig: {
      lowSeasonNight: 61,
      lowSeasonWeek: 400,
      midSeasonNight: 68,
      midSeasonWeek: 460,
      highSeasonNight: 100,
      highSeasonWeek: 700,
      cleaningFee: 60,
      touristTaxPerAdultPerNight: 1.32,
      towelPackPerPerson: 6.5,
      minNightsLowMid: 2,
      minNightsHigh: 4,
    },
    source: "default",
  }),
  getReservationEstimate: vi.fn(),
}));

vi.mock("@/lib/api/airbnb-link.functions", () => ({
  getAirbnbRedirectUrl: vi.fn(),
}));

describe("Home", () => {
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ busyRanges: [] }),
    } as Response);
  });

  it("renders the main home sections", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Une parenthese/)).toBeInTheDocument();
    expect(screen.getAllByText("Le gite").length).toBeGreaterThan(0);
    expect(screen.getByText("Planifier votre sejour")).toBeInTheDocument();
    expect(
      screen.getByText("Une question ? Ecrivez-nous."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Les Portes de Montafilan - Corseul/),
    ).toBeInTheDocument();
    expect(screen.getByTestId("calendar")).toBeInTheDocument();
  });
});
