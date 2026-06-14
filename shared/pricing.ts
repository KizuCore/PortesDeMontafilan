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
  stayBasePrice: number;
  cleaningFee: number;
  touristTax: number;
  towelPacksPrice: number;
  totalEstimated: number;
  valid: boolean;
  warning?: string;
}

export const defaultPricingConfig: PricingConfig = {
  lowSeasonNight: 61,
  lowSeasonWeek: 400,
  midSeasonNight: 68,
  midSeasonWeek: 460,
  highSeasonNight: 75,
  highSeasonWeek: 560,
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

// Détermine la saison tarifaire selon la date d'arrivée.
export function seasonForStayStart(
  checkIn: string,
  ranges: SchoolHolidayRange[] = defaultSchoolHolidayRanges,
): Season {
  const date = parseDate(checkIn);
  const month = date.getMonth() + 1;

  if (month === 7 || month === 8 || inSchoolHoliday(date, ranges)) {
    return 'high';
  }

  if (month >= 5 && month <= 9) {
    return 'mid';
  }

  return 'low';
}

function computeStayPrice(nights: number, nightlyRate: number, weeklyRate: number): number {
  const fullWeeks = Math.floor(nights / 7);
  const remainingNights = nights % 7;
  return fullWeeks * weeklyRate + remainingNights * nightlyRate;
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
      stayBasePrice: 0,
      cleaningFee: pricing.cleaningFee,
      touristTax: 0,
      towelPacksPrice: 0,
      totalEstimated: 0,
      valid: false,
      warning: 'Les dates sont invalides.',
    };
  }

  const season = seasonForStayStart(input.checkIn, ranges);
  const minNightsRequired = season === 'high' ? pricing.minNightsHigh : pricing.minNightsLowMid;

  const rates =
    season === 'high'
      ? { night: pricing.highSeasonNight, week: pricing.highSeasonWeek }
      : season === 'mid'
        ? { night: pricing.midSeasonNight, week: pricing.midSeasonWeek }
        : { night: pricing.lowSeasonNight, week: pricing.lowSeasonWeek };

  const stayBasePrice = computeStayPrice(nights, rates.night, rates.week);
  const touristTax = roundToCents(nights * input.adults * pricing.touristTaxPerAdultPerNight);
  const towelPacksPrice = roundToCents(input.towelPacks * pricing.towelPackPerPerson);

  // Le ménage est inclus dans le tarif affiché, mais on garde le détail pour la transparence.
  const totalEstimated = roundToCents(stayBasePrice + touristTax + towelPacksPrice);

  const valid = nights >= minNightsRequired;
  const warning = valid
    ? undefined
    : `Minimum ${minNightsRequired} nuits pour cette période.`;

  return {
    nights,
    season,
    minNightsRequired,
    stayBasePrice,
    cleaningFee: pricing.cleaningFee,
    touristTax,
    towelPacksPrice,
    totalEstimated,
    valid,
    warning,
  };
}
