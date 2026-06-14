interface Req {
  method?: string;
  body?: {
    checkIn?: string;
    checkOut?: string;
    adults?: number;
    children?: number;
    infants?: number;
  };
}

interface Res {
  status: (code: number) => Res;
  json: (payload: unknown) => void;
}

const DEFAULT_AIRBNB_BASE_URL = "https://www.airbnb.com";
const MIN_ADULTS = 1;
const MAX_ADULTS = 4;
const MIN_CHILDREN = 0;
const MAX_CHILDREN = 3;
const MAX_GUESTS = 4;
const MIN_INFANTS = 0;
const MAX_INFANTS = 1;

// Construit une URL Airbnb valide a partir des variables d'environnement.
function buildAirbnbRedirectUrl(
  checkIn: string,
  checkOut: string,
  adults: number,
  children: number,
  infants: number,
): string | null {
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
  base.searchParams.set("adults", String(Math.max(1, adults)));
  base.searchParams.set("children", String(Math.max(0, children)));
  base.searchParams.set("infants", String(Math.max(0, infants)));

  return base.toString();
}

// Parse et valide un entier borne, sinon renvoie null pour signaler une erreur.
function parseBoundedInteger(
  value: unknown,
  fallback: number,
  min: number,
  max: number,
): number | null {
  const parsedValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < min ||
    parsedValue > max
  ) {
    return null;
  }

  return parsedValue;
}

// Endpoint serverless qui renvoie l'URL Airbnb pre-remplie.
export default function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const checkIn = req.body?.checkIn;
  const checkOut = req.body?.checkOut;
  const adults = parseBoundedInteger(
    req.body?.adults,
    MIN_ADULTS,
    MIN_ADULTS,
    MAX_ADULTS,
  );
  const children = parseBoundedInteger(
    req.body?.children,
    MIN_CHILDREN,
    MIN_CHILDREN,
    MAX_CHILDREN,
  );
  const infants = parseBoundedInteger(
    req.body?.infants,
    MIN_INFANTS,
    MIN_INFANTS,
    MAX_INFANTS,
  );

  if (!checkIn || !checkOut) {
    res.status(400).json({ error: "Missing stay dates." });
    return;
  }

  if (adults === null) {
    res.status(400).json({
      error: `Adults must be an integer between ${MIN_ADULTS} and ${MAX_ADULTS}.`,
    });
    return;
  }

  if (children === null) {
    res.status(400).json({
      error: `Children must be an integer between ${MIN_CHILDREN} and ${MAX_CHILDREN}.`,
    });
    return;
  }

  if (infants === null) {
    res.status(400).json({
      error: `Infants must be an integer between ${MIN_INFANTS} and ${MAX_INFANTS}.`,
    });
    return;
  }

  if (adults + children > MAX_GUESTS) {
    res.status(400).json({ error: "GUEST_CAPACITY_EXCEEDED" });
    return;
  }

  const redirectUrl = buildAirbnbRedirectUrl(
    checkIn,
    checkOut,
    adults,
    children,
    infants,
  );
  if (!redirectUrl) {
    res.status(400).json({ error: "Airbnb listing is not configured." });
    return;
  }

  res.status(200).json({ redirectUrl });
}
