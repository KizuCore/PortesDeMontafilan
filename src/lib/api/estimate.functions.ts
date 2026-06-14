import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { estimateReservation } from "../../../shared/pricing";

const MIN_ADULTS = 1;
const MAX_ADULTS = 4;
const MIN_CHILDREN = 0;
const MAX_CHILDREN = 3;
const MAX_GUESTS = 4;

const estimateInput = z.object({
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  adults: z.number().int().min(MIN_ADULTS).max(MAX_ADULTS),
  children: z.number().int().min(MIN_CHILDREN).max(MAX_CHILDREN),
}).refine((data) => data.adults + data.children <= MAX_GUESTS, {
  message: "GUEST_CAPACITY_EXCEEDED",
});

export const getReservationEstimate = createServerFn({ method: "POST" })
  .validator(estimateInput)
  .handler(async ({ data }) => {
    const { resolvePricingConfig } = await import("../../../api/_pricingConfig");
    const { pricingConfig, source, warning } = await resolvePricingConfig();
    const estimate = estimateReservation(
      {
        checkIn: data.checkIn,
        checkOut: data.checkOut,
        adults: data.adults,
        towelPacks: 0,
      },
      pricingConfig,
    );

    return { estimate, source, warning };
  });

export const getPricingConfig = createServerFn({ method: "GET" })
  .handler(async () => {
    const { resolvePricingConfig } = await import("../../../api/_pricingConfig");
    const { pricingConfig, source, warning } = await resolvePricingConfig();
    return { pricingConfig, source, warning };
  });
