import { describe, expect, it } from "vitest";
import { defaultPricingConfig, estimateReservation } from "../../../shared/pricing";

describe("pricing", () => {
  it("adds the configured cleaning fee to the reservation estimate", () => {
    const estimate = estimateReservation(
      {
        checkIn: "2026-05-04",
        checkOut: "2026-05-06",
        adults: 2,
        towelPacks: 0,
      },
      {
        ...defaultPricingConfig,
        midSeasonNight: 70,
        cleaningFee: 80,
        touristTaxPerAdultPerNight: 1,
      },
      [],
    );

    expect(estimate.stayBasePrice).toBe(140);
    expect(estimate.cleaningFee).toBe(80);
    expect(estimate.touristTax).toBe(4);
    expect(estimate.totalEstimated).toBe(224);
  });
});
