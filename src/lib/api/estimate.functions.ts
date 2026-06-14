import { z } from "zod";

import type { EstimateResult, PricingConfig } from "../../../shared/pricing";

const MIN_ADULTS = 1;
const MAX_ADULTS = 4;
const MIN_CHILDREN = 0;
const MAX_CHILDREN = 3;
const MAX_GUESTS = 4;

const estimateInput = z
  .object({
    checkIn: z.string().min(1),
    checkOut: z.string().min(1),
    adults: z.number().int().min(MIN_ADULTS).max(MAX_ADULTS),
    children: z.number().int().min(MIN_CHILDREN).max(MAX_CHILDREN),
  })
  .refine((data) => data.adults + data.children <= MAX_GUESTS, {
    message: "GUEST_CAPACITY_EXCEEDED",
  });

export async function getReservationEstimate({
  data,
}: {
  data: z.infer<typeof estimateInput>;
}): Promise<{
  estimate: EstimateResult;
  warning?: string;
}> {
  const input = estimateInput.parse(data);
  const response = await fetch("/api/estimate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, towelPacks: 0 }),
  });

  const payload = (await response.json().catch(() => null)) as {
    estimate?: EstimateResult;
    error?: string;
  } | null;
  if (!response.ok || !payload?.estimate) {
    throw new Error(payload?.error ?? `HTTP ${response.status}`);
  }

  return { estimate: payload.estimate, warning: payload.estimate.warning };
}

export async function getPricingConfig(): Promise<{
  pricingConfig: PricingConfig;
  source: "google-sheets" | "default";
  warning?: string;
}> {
  const response = await fetch("/api/pricing-config");
  const payload = (await response.json().catch(() => null)) as {
    pricingConfig?: PricingConfig;
    source?: "google-sheets" | "default";
    warning?: string;
    error?: string;
  } | null;

  if (!response.ok || !payload?.pricingConfig) {
    throw new Error(payload?.error ?? `HTTP ${response.status}`);
  }

  return {
    pricingConfig: payload.pricingConfig,
    source: payload.source ?? "default",
    warning: payload.warning,
  };
}
