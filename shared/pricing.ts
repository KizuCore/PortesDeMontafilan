export type Season = 'low' | 'mid' | 'high';

export interface PricingConfig {
  lowSeasonNight: number;
  lowSeasonWeek: number;
  midSeasonNight: number;
  midSeasonWeek: number;
  highSeasonNight: number;
  highSeasonWeek: number;
  cleaningFee: number;
  touristTaxPerAdultPerNight: number;
  towelPackPerPerson: number;
  minNightsLowMid: number;
  minNightsHigh: number;
}

export interface SchoolHolidayRange {
  start: string;
  end: string;
  label: string;
}

export interface ReservationInput {
  checkIn: string;
  checkOut: string;
  adults: number;
  towelPacks: number;
}

export interface EstimateResult {
  nights: number;
  season: Season;
  minNightsRequired: number;
  rateBreakdown: RateBreakdownItem[];
  stayBasePrice: number;
  cleaningFee: number;
  touristTax: number;
  towelPacksPrice: number;
  totalEstimated: number;
  valid: boolean;
  warning?: string;
}

export interface RateBreakdownItem {
  season: Season;
  nights: number;
  nightlyRate: number;
  subtotal: number;
}

export const defaultPricingConfig: PricingConfig = {
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
};

// Ces plages restent approximatives pour le prototype.
// À brancher ensuite sur une source officielle (ou un agenda admin).
export const defaultSchoolHolidayRanges: SchoolHolidayRange[] = [
  { start: '2026-02-07', end: '2026-03-08', label: 'Vacances hiver' },
  { start: '2026-04-04', end: '2026-05-03', label: 'Vacances printemps' },
  { start: '2026-07-04', end: '2026-08-30', label: 'Vacances été' },
  { start: '2026-10-17', end: '2026-11-01', label: 'Vacances Toussaint' },
  { start: '2026-12-19', end: '2027-01-03', label: 'Vacances Noël' },
];

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function addCalendarDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function isBetween(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

function inSchoolHoliday(date: Date, ranges: SchoolHolidayRange[]): boolean {
  return ranges.some((range) => {
    const start = parseDate(range.start);
    const end = parseDate(range.end);
    return isBetween(date, start, end);
  });
}

export function seasonForDate(
  date: Date,
  ranges: SchoolHolidayRange[] = defaultSchoolHolidayRanges,
): Season {
  const month = date.getMonth() + 1;

  if (month === 7 || month === 8 || inSchoolHoliday(date, ranges)) {
    return 'high';
  }

  if (month >= 5 && month <= 9) {
    return 'mid';
  }

  return 'low';
}

// Détermine la saison tarifaire selon la date d'arrivée.
export function seasonForStayStart(
  checkIn: string,
  ranges: SchoolHolidayRange[] = defaultSchoolHolidayRanges,
): Season {
  return seasonForDate(parseDate(checkIn), ranges);
}

function nightlyRateForSeason(season: Season, pricing: PricingConfig): number {
  if (season === 'high') {
    return pricing.highSeasonNight;
  }

  if (season === 'mid') {
    return pricing.midSeasonNight;
  }

  return pricing.lowSeasonNight;
}

function highestSeason(seasons: Season[]): Season {
  if (seasons.includes('high')) {
    return 'high';
  }

  if (seasons.includes('mid')) {
    return 'mid';
  }

  return 'low';
}

function computeRateBreakdown(
  checkIn: string,
  nights: number,
  pricing: PricingConfig,
  ranges: SchoolHolidayRange[],
): RateBreakdownItem[] {
  const start = parseDate(checkIn);
  const breakdown: RateBreakdownItem[] = [];

  for (let offset = 0; offset < nights; offset += 1) {
    const nightDate = addCalendarDays(start, offset);
    const season = seasonForDate(nightDate, ranges);
    const nightlyRate = nightlyRateForSeason(season, pricing);
    const previous = breakdown[breakdown.length - 1];

    if (previous && previous.season === season && previous.nightlyRate === nightlyRate) {
      previous.nights += 1;
      previous.subtotal = roundToCents(previous.subtotal + nightlyRate);
    } else {
      breakdown.push({
        season,
        nights: 1,
        nightlyRate,
        subtotal: nightlyRate,
      });
    }
  }

  return breakdown;
}

// Calcule l'estimation complète affichée dans le formulaire.
export function estimateReservation(
  input: ReservationInput,
  pricing: PricingConfig = defaultPricingConfig,
  ranges: SchoolHolidayRange[] = defaultSchoolHolidayRanges,
): EstimateResult {
  const start = parseDate(input.checkIn);
  const end = parseDate(input.checkOut);
  const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (!Number.isFinite(nights) || nights <= 0) {
    return {
      nights: 0,
      season: 'low',
      minNightsRequired: pricing.minNightsLowMid,
      rateBreakdown: [],
      stayBasePrice: 0,
      cleaningFee: pricing.cleaningFee,
      touristTax: 0,
      towelPacksPrice: 0,
      totalEstimated: 0,
      valid: false,
      warning: 'Les dates sont invalides.',
    };
  }

  const rateBreakdown = computeRateBreakdown(input.checkIn, nights, pricing, ranges);
  const season = highestSeason(rateBreakdown.map((item) => item.season));
  const minNightsRequired = season === 'high' ? pricing.minNightsHigh : pricing.minNightsLowMid;
  const stayBasePrice = roundToCents(rateBreakdown.reduce((total, item) => total + item.subtotal, 0));
  const touristTax = roundToCents(nights * input.adults * pricing.touristTaxPerAdultPerNight);
  const towelPacksPrice = roundToCents(input.towelPacks * pricing.towelPackPerPerson);

  // Le prix de base correspond aux nuits. Le forfait ménage est ajouté à la réservation.
  const totalEstimated = roundToCents(stayBasePrice + pricing.cleaningFee + touristTax + towelPacksPrice);

  const valid = nights >= minNightsRequired;
  const warning = valid
    ? undefined
    : `Minimum ${minNightsRequired} nuits pour cette période.`;

  return {
    nights,
    season,
    minNightsRequired,
    rateBreakdown,
    stayBasePrice,
    cleaningFee: pricing.cleaningFee,
    touristTax,
    towelPacksPrice,
    totalEstimated,
    valid,
    warning,
  };
}
