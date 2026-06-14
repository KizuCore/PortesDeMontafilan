import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const DEFAULT_AIRBNB_BASE_URL = "https://www.airbnb.com";
const MIN_ADULTS = 1;
const MAX_ADULTS = 4;
const MIN_CHILDREN = 0;
const MAX_CHILDREN = 3;
const MAX_GUESTS = 4;

const airbnbLinkInput = z.object({
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  adults: z.number().int().min(MIN_ADULTS).max(MAX_ADULTS),
  children: z.number().int().min(MIN_CHILDREN).max(MAX_CHILDREN),
}).refine((data) => data.adults + data.children <= MAX_GUESTS, {
  message: "GUEST_CAPACITY_EXCEEDED",
});

function buildAirbnbRedirectUrl(checkIn: string, checkOut: string, adults: number, children: number): string | null {
  const listingId = process.env.AIRBNB_LISTING_ID?.trim();
  const listingUrl = process.env.AIRBNB_LISTING_URL?.trim();

  let base: URL;
  try {
    if (listingUrl) {
      base = new URL(listingUrl);
    } else if (listingId) {
      base = new URL(`/rooms/${listingId}`, DEFAULT_AIRBNB_BASE_URL);
    } else {
      return null;
    }
  } catch {
    return null;
  }

  if (!base.hostname.includes("airbnb.")) {
    return null;
  }

  base.searchParams.set("check_in", checkIn);
  base.searchParams.set("check_out", checkOut);
  base.searchParams.set("adults", String(adults));
  base.searchParams.set("children", String(children));

  return base.toString();
}

export const getAirbnbRedirectUrl = createServerFn({ method: "POST" })
  .inputValidator(airbnbLinkInput)
  .handler(async ({ data }) => {
    const redirectUrl = buildAirbnbRedirectUrl(data.checkIn, data.checkOut, data.adults, data.children);
    if (!redirectUrl) {
      throw new Error("Airbnb listing is not configured.");
    }

    return { redirectUrl };
  });
