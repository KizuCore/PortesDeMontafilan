import { z } from "zod";

const MIN_ADULTS = 1;
const MAX_ADULTS = 4;
const MIN_CHILDREN = 0;
const MAX_CHILDREN = 3;
const MAX_GUESTS = 4;
const MIN_INFANTS = 0;
const MAX_INFANTS = 1;

const airbnbLinkInput = z
  .object({
    checkIn: z.string().min(1),
    checkOut: z.string().min(1),
    adults: z.number().int().min(MIN_ADULTS).max(MAX_ADULTS),
    children: z.number().int().min(MIN_CHILDREN).max(MAX_CHILDREN),
    infants: z.number().int().min(MIN_INFANTS).max(MAX_INFANTS),
  })
  .refine((data) => data.adults + data.children <= MAX_GUESTS, {
    message: "GUEST_CAPACITY_EXCEEDED",
  });

export async function getAirbnbRedirectUrl({
  data,
}: {
  data: z.infer<typeof airbnbLinkInput>;
}): Promise<{
  redirectUrl: string;
}> {
  const input = airbnbLinkInput.parse(data);
  const response = await fetch("/api/airbnb-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as {
    redirectUrl?: string;
    error?: string;
  } | null;
  if (!response.ok || !payload?.redirectUrl) {
    throw new Error(payload?.error ?? `HTTP ${response.status}`);
  }

  return { redirectUrl: payload.redirectUrl };
}
