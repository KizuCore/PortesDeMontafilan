import { useEffect, useMemo, useState } from "react";
import { addDays, differenceInCalendarDays } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getAirbnbRedirectUrl } from "@/lib/api/airbnb-link.functions";
import {
  getPricingConfig,
  getReservationEstimate,
} from "@/lib/api/estimate.functions";
import {
  GOOGLE_MAPS_URL,
  MAX_GUESTS,
  MAX_INFANTS,
  MIN_ADULTS,
  MIN_CHILDREN,
  MIN_INFANTS,
} from "@/constants/home";
import {
  dateRangeIncludesBusyDate,
  dateToYmd,
  formatStayDate,
} from "@/lib/home/dates";
import { formatMoney } from "@/lib/home/money";
import type { BusyRange } from "../../../shared/availability";
import {
  defaultPricingConfig,
  type EstimateResult,
  type PricingConfig,
} from "../../../shared/pricing";

export function AirbnbCalendar() {
  const { lang, t, tm } = useI18n();
  const [range, setRange] = useState<DateRange | undefined>();
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [busyRanges, setBusyRanges] = useState<BusyRange[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [airbnbLoading, setAirbnbLoading] = useState(false);
  const [airbnbError, setAirbnbError] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);
  const [estimateWarning, setEstimateWarning] = useState<string | null>(null);
  const [pricingConfig, setPricingConfig] =
    useState<PricingConfig>(defaultPricingConfig);
  const [pricingWarning, setPricingWarning] = useState<string | null>(null);
  const rateLabels = tm("home.rates");
  const practical = tm("home.practical");
  // Adultes et enfants partagent la capacite totale du gite; les bornes se recalculent donc ensemble.
  const maxAdults = Math.max(MIN_ADULTS, MAX_GUESTS - children);
  const maxChildren = Math.max(MIN_CHILDREN, MAX_GUESTS - adults);
  const displayedRates = [
    {
      ...rateLabels[0],
      price: formatMoney(
        pricingConfig.lowSeasonNight,
        lang === "fr" ? "fr-FR" : "en-US",
      ),
    },
    {
      ...rateLabels[1],
      price: formatMoney(
        pricingConfig.midSeasonNight,
        lang === "fr" ? "fr-FR" : "en-US",
      ),
    },
    {
      ...rateLabels[2],
      price: formatMoney(
        pricingConfig.highSeasonNight,
        lang === "fr" ? "fr-FR" : "en-US",
      ),
    },
  ];

  function clampNumber(value: number, min: number, max: number) {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, Math.trunc(value)));
  }

  function handleAdultsChange(value: string) {
    setAdults(clampNumber(Number(value), MIN_ADULTS, maxAdults));
  }

  function handleChildrenChange(value: string) {
    setChildren(clampNumber(Number(value), MIN_CHILDREN, maxChildren));
  }

  function handleInfantsChange(value: string) {
    setInfants(clampNumber(Number(value), MIN_INFANTS, MAX_INFANTS));
  }

  function handleRangeSelect(nextRange: DateRange | undefined) {
    if (
      nextRange?.from &&
      nextRange?.to &&
      dateRangeIncludesBusyDate(nextRange.from, nextRange.to, busyRanges)
    ) {
      // Si la selection traverse une date occupee, on conserve seulement le debut pour relancer un choix propre.
      setRange({ from: nextRange.from });
      setAirbnbError(t("home.booking.unavailableRange"));
      return;
    }

    setAirbnbError(null);
    setRange(nextRange);
  }

  async function handleRequestDates() {
    if (!range?.from || !range?.to) {
      setAirbnbError(t("home.booking.missingDates"));
      return;
    }

    if (dateRangeIncludesBusyDate(range.from, range.to, busyRanges)) {
      setAirbnbError(t("home.booking.unavailableRange"));
      return;
    }

    if (estimate && !estimate.valid) {
      setAirbnbError(estimate.warning ?? t("home.booking.estimateError"));
      return;
    }

    setAirbnbLoading(true);
    setAirbnbError(null);

    try {
      const result = await getAirbnbRedirectUrl({
        data: {
          checkIn: dateToYmd(range.from),
          checkOut: dateToYmd(range.to),
          adults,
          children,
          infants,
        },
      });

      window.location.assign(result.redirectUrl);
    } catch (error: unknown) {
      setAirbnbError(
        error instanceof Error ? error.message : t("home.booking.airbnbError"),
      );
    } finally {
      setAirbnbLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function loadPricingConfig() {
      try {
        const result = await getPricingConfig();

        if (!cancelled) {
          setPricingConfig(result.pricingConfig);
          setPricingWarning(result.warning ?? null);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setPricingConfig(defaultPricingConfig);
          setPricingWarning(
            error instanceof Error
              ? error.message
              : t("home.booking.estimateError"),
          );
        }
      }
    }

    void loadPricingConfig();

    return () => {
      // Evite de mettre a jour l'etat si le composant disparait avant la fin de la requete.
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      try {
        const response = await fetch("/api/availability");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = (await response.json()) as { busyRanges?: BusyRange[] };

        if (!cancelled) {
          setBusyRanges(Array.isArray(data.busyRanges) ? data.busyRanges : []);
          setAvailabilityError(null);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setBusyRanges([]);
          setAvailabilityError(
            error instanceof Error ? error.message : "AVAILABILITY_FAILED",
          );
        }
      } finally {
        if (!cancelled) {
          setAvailabilityLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadEstimate() {
      if (
        !range?.from ||
        !range?.to ||
        dateRangeIncludesBusyDate(range.from, range.to, busyRanges)
      ) {
        setEstimate(null);
        setEstimateError(null);
        setEstimateWarning(null);
        return;
      }

      setEstimateLoading(true);
      setEstimateError(null);

      try {
        const result = await getReservationEstimate({
          data: {
            checkIn: dateToYmd(range.from),
            checkOut: dateToYmd(range.to),
            adults,
            children,
          },
        });

        if (!cancelled) {
          setEstimate(result.estimate);
          setEstimateWarning(result.warning ?? result.estimate.warning ?? null);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setEstimate(null);
          setEstimateWarning(null);
          setEstimateError(
            error instanceof Error
              ? error.message
              : t("home.booking.estimateError"),
          );
        }
      } finally {
        if (!cancelled) {
          setEstimateLoading(false);
        }
      }
    }

    void loadEstimate();

    return () => {
      cancelled = true;
    };
  }, [adults, busyRanges, children, range, t]);

  const disabledRanges = useMemo(
    () =>
      busyRanges.map((rangeItem) => ({
        from: new Date(`${rangeItem.start}T00:00:00`),
        // Les plages iCal finissent le matin du depart; react-day-picker attend une borne inclusive.
        to: addDays(new Date(`${rangeItem.end}T00:00:00`), -1),
      })),
    [busyRanges],
  );

  const nights = useMemo(() => {
    if (!range?.from || !range?.to) return 0;
    return Math.max(0, differenceInCalendarDays(range.to, range.from));
  }, [range]);

  const selectedRangeUnavailable = useMemo(() => {
    if (!range?.from || !range?.to) return false;
    return dateRangeIncludesBusyDate(range.from, range.to, busyRanges);
  }, [busyRanges, range]);

  const selectedLabel =
    range?.from && range?.to
      ? `${range.from.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")} → ${range.to.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}`
      : t("home.booking.emptySelection");

  const locale = lang === "fr" ? "fr-FR" : "en-US";
  function formatDetailedMoney(amount: number) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  const rateBreakdownLabel = estimate?.rateBreakdown
    .map(
      (item) =>
        `${item.nights} ${item.nights > 1 ? t("home.booking.nightPlural") : t("home.booking.nightSingular")} × ${formatMoney(item.nightlyRate, locale)}`,
    )
    .join(" + ");

  return (
    <section id="reservation" className="bg-secondary/60 py-20 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <AnimatedSection>
            <span className="eyebrow">{t("home.booking.eyebrow")}</span>
            <h2 className="mt-3 text-3xl sm:text-5xl">
              {t("home.booking.title")}
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              {t("home.booking.body")}
            </p>
            <div className="mt-6 overflow-hidden rounded-[24px] border border-border bg-card shadow-card">
              {displayedRates.map((rate, index) => (
                <div
                  key={rate.label}
                  className={`flex items-center justify-between gap-4 px-5 py-5 ${index > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="text-sm text-muted-foreground">
                    {rate.label}
                  </div>
                  <div className="whitespace-nowrap text-right">
                    <span className="font-display text-2xl text-foreground">
                      ≈ {rate.price}
                    </span>
                    <span className="ml-1 text-xs text-muted-foreground">
                      {rate.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {pricingWarning ? (
              <p className="mt-3 text-xs text-muted-foreground">
                {pricingWarning}
              </p>
            ) : null}
            <p className="mt-4 text-sm text-muted-foreground">
              {t("home.booking.longStay")}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {t("home.booking.cleaningBaseNotice")}{" "}
              <strong className="font-semibold text-foreground">
                {formatMoney(pricingConfig.cleaningFee, locale)}
              </strong>
              .
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">
                {t("home.booking.minimumStayTitle")}
              </strong>{" "}
              {pricingConfig.minNightsLowMid}{" "}
              {pricingConfig.minNightsLowMid > 1
                ? t("home.booking.nightPlural")
                : t("home.booking.nightSingular")}{" "}
              {t("home.booking.minimumStayLowMid")}
              {" · "}
              {pricingConfig.minNightsHigh}{" "}
              {pricingConfig.minNightsHigh > 1
                ? t("home.booking.nightPlural")
                : t("home.booking.nightSingular")}{" "}
              {t("home.booking.minimumStayHigh")}
            </p>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-7">
          <AnimatedSection delay={150}>
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg sm:text-xl">
                  {t("home.booking.chooseDates")}
                </h3>
                <span className="label-tiny">{t("home.booking.estimate")}</span>
              </div>
              <div className="flex justify-center">
                <Calendar
                  mode="range"
                  selected={range}
                  onSelect={handleRangeSelect}
                  numberOfMonths={1}
                  locale={lang === "fr" ? fr : enUS}
                  disabled={[{ before: new Date() }, ...disabledRanges]}
                  className="pointer-events-auto"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-wider text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                  <i className="legend-dot legend-available" />{" "}
                  {t("home.booking.legendAvailable")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                  <i className="legend-dot legend-unavailable" />{" "}
                  {t("home.booking.legendUnavailable")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                  <i className="legend-dot legend-selected" />{" "}
                  {t("home.booking.legendSelected")}
                </span>
              </div>
              <div className="mt-5 rounded-xl bg-secondary/70 p-4 sm:p-5">
                {range?.from && range?.to ? (
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="text-sm text-muted-foreground">
                      {selectedLabel} · {nights}{" "}
                      {nights > 1
                        ? t("home.booking.nightPlural")
                        : t("home.booking.nightSingular")}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("home.booking.selectHint")}
                  </p>
                )}
              </div>
              {estimateLoading ? (
                <div className="mt-5 rounded-xl bg-secondary/70 p-4 text-sm text-muted-foreground sm:p-5">
                  {t("home.booking.estimateLoading")}
                </div>
              ) : estimate && range?.from && range?.to ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-secondary/70 p-4 sm:p-5">
                  <div className="text-sm text-muted-foreground">
                    {t("home.booking.from")}{" "}
                    <strong className="font-semibold text-foreground">
                      {formatStayDate(range.from, locale)}
                    </strong>{" "}
                    {t("home.booking.to")}{" "}
                    <strong className="font-semibold text-foreground">
                      {formatStayDate(range.to, locale)}
                    </strong>
                    {" · "}
                    {rateBreakdownLabel}
                    <div className="mt-1 text-xs">
                      {t("home.booking.cleaningFeeAdded")}{" "}
                      {formatMoney(estimate.cleaningFee, locale)}
                    </div>
                    <div className="mt-1 text-xs">
                      {t("home.booking.touristTaxIncluded")}{" "}
                      {formatMoney(estimate.touristTax, locale)}
                    </div>
                  </div>
                  <div className="font-display text-3xl text-foreground">
                    ≈ {formatMoney(estimate.totalEstimated, locale)}
                  </div>
                </div>
              ) : estimateError ? (
                <p className="mt-3 text-sm text-destructive">{estimateError}</p>
              ) : null}
              {estimateWarning ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {estimateWarning}
                </p>
              ) : null}
              {estimate && estimate.nights >= 7 ? (
                <p className="mt-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                  {t("home.booking.weeklyDiscountNotice")}
                </p>
              ) : null}
              <div className="mt-5 rounded-xl border border-border bg-background p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-foreground">
                    {t("home.booking.guestsTitle")}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {t("home.booking.guestLimit")}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <label className="block text-sm">
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      {t("home.booking.adults")}
                    </span>
                    <input
                      type="number"
                      min={MIN_ADULTS}
                      max={maxAdults}
                      value={adults}
                      onChange={(event) =>
                        handleAdultsChange(event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:border-terra focus:outline-none focus:ring-2 focus:ring-clay/30"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      {t("home.booking.children")}
                    </span>
                    <input
                      type="number"
                      min={MIN_CHILDREN}
                      max={maxChildren}
                      value={children}
                      onChange={(event) =>
                        handleChildrenChange(event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:border-terra focus:outline-none focus:ring-2 focus:ring-clay/30"
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                      {t("home.booking.infants")}
                    </span>
                    <input
                      type="number"
                      min={MIN_INFANTS}
                      max={MAX_INFANTS}
                      value={infants}
                      onChange={(event) =>
                        handleInfantsChange(event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground focus:border-terra focus:outline-none focus:ring-2 focus:ring-clay/30"
                    />
                  </label>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleRequestDates}
                  disabled={
                    airbnbLoading ||
                    !range?.from ||
                    !range?.to ||
                    selectedRangeUnavailable ||
                    Boolean(estimate && !estimate.valid)
                  }
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {airbnbLoading
                    ? t("home.booking.requestLoading")
                    : t("home.booking.requestDates")}
                </button>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost !border-border !text-foreground hover:!bg-secondary"
                >
                  {t("home.booking.viewMaps")}
                </a>
              </div>
              {airbnbError ? (
                <p className="mt-3 text-sm text-destructive">{airbnbError}</p>
              ) : null}
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg">{t("home.booking.practicalTitle")}</h3>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                {practical.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
              <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                <p>
                  {t("home.booking.towelsOption")}{" "}
                  {formatDetailedMoney(pricingConfig.towelPackPerPerson)}{" "}
                  {t("home.booking.perPerson")}
                </p>
                <p>{t("home.booking.extraCleaningNotice")}</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
