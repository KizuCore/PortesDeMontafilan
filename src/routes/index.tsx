import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { addDays, differenceInCalendarDays } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useI18n } from "@/lib/i18n";
import { LangSwitch } from "@/components/LangSwitch";
import { AnimatedSection } from "@/components/AnimatedSection";
import { getAirbnbRedirectUrl } from "@/lib/api/airbnb-link.functions";
import {
  getPricingConfig,
  getReservationEstimate,
} from "@/lib/api/estimate.functions";
import type { BusyRange } from "../../shared/availability";
import {
  defaultPricingConfig,
  type EstimateResult,
  type PricingConfig,
} from "../../shared/pricing";

const imageAssets = import.meta.glob(
  "../assets/img/**/*.{avif,jpg,jpeg,png,webp}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

const IMG = (path: string) => imageAssets[`../assets/img/${path}`] ?? path;
const OG_IMAGE = IMG("house/ArriereCours1.avif");
const LOGO_IMAGE = "/favicon/android-chrome-512x512.png";
const MIN_ADULTS = 1;
const MAX_ADULTS = 4;
const MIN_CHILDREN = 0;
const MAX_CHILDREN = 3;
const MAX_GUESTS = 4;
const MIN_INFANTS = 0;
const MAX_INFANTS = 1;
const GOOGLE_MAPS_URL =
  "https://maps.google.com/?q=G%C3%AEte%20-%20Les%20Portes%20de%20Montafilan";

function dateToYmd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatStayDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatMoney(amount: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function dateRangeIncludesBusyDate(
  from: Date,
  to: Date,
  busyRanges: BusyRange[],
) {
  let cursor = dateToYmd(from);
  const end = dateToYmd(to);

  while (cursor < end) {
    if (
      busyRanges.some((range) => cursor >= range.start && cursor < range.end)
    ) {
      return true;
    }

    cursor = dateToYmd(addDays(new Date(`${cursor}T00:00:00`), 1));
  }

  return false;
}

function Nav() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const links = [
    { href: "#gite", label: t("nav.gite") },
    { href: "#equipements", label: t("nav.equipements") },
    { href: "#galerie", label: t("nav.galerie") },
    { href: "#region", label: t("nav.region") },
    { href: "#pratique", label: t("nav.pratique") },
    { href: "#contact", label: t("nav.contact") },
  ];
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <a href="#top" className="flex min-w-max shrink-0 items-center gap-2">
            <img
              src={LOGO_IMAGE}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
            <span className="font-display text-lg leading-tight">
              Les Portes de Montafilan
            </span>
          </a>
          <nav className="hidden flex-1 items-center justify-center gap-5 xl:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="whitespace-nowrap text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex shrink-0 items-center justify-end gap-3">
            <div className="hidden sm:block">
              <LangSwitch />
            </div>
            <a
              href="#reservation"
              className="btn-primary hidden min-w-36 xl:inline-flex !py-2.5 !text-sm"
            >
              {t("nav.reserve")}
            </a>
            <button
              type="button"
              aria-label={t("nav.menu")}
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-secondary xl:hidden"
            >
              <span className="flex flex-col gap-[3px]">
                <span className="block h-px w-4 bg-foreground" />
                <span className="block h-px w-4 bg-foreground" />
              </span>
              {t("nav.menu")}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-forest text-primary-foreground">
            <div className="container-x flex h-16 items-center justify-between">
              <span className="font-display text-lg text-background">
                Les Portes de Montafilan
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-background/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-background hover:bg-background/10"
              >
                {t("nav.close")}
              </button>
            </div>
            <div className="container-x flex h-[calc(100vh-4rem)] flex-col justify-between pb-10 pt-8">
              <nav className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-baseline gap-4 border-b border-background/15 py-5"
                  >
                    <span className="label-tiny !text-background/50 w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-3xl text-background transition-colors group-hover:text-terra sm:text-4xl">
                      {l.label}
                    </span>
                  </a>
                ))}
              </nav>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <LangSwitch tone="light" />
                <a
                  href="#reservation"
                  onClick={() => setOpen(false)}
                  className="btn-accent"
                >
                  {t("nav.reserveLong")}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MobileReserveButton() {
  const { t } = useI18n();

  return (
    <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 sm:hidden">
      <a
        href="#reservation"
        className="btn-primary flex w-full shadow-glow !py-4"
      >
        {t("nav.reserve")}
      </a>
    </div>
  );
}

function Hero() {
  const { t, tm } = useI18n();
  const highlights = tm("home.highlights");

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={IMG("house/ArriereCours1.avif")}
          alt={t("home.hero.imageAlt")}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-forest/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/20 via-transparent to-forest/55" />
      </div>
      <div className="container-x relative flex min-h-[calc(100vh-4rem)] flex-col py-10 text-primary-foreground sm:min-h-[88vh] sm:py-12">
        <span className="label-tiny animate-fade-in !tracking-[0.28em] !text-background/75">
          {t("home.hero.eyebrow")}
        </span>
        <div className="flex flex-1 items-center justify-center py-14 text-center sm:py-20">
          <div className="w-full max-w-5xl">
            <span className="font-script text-2xl italic leading-none text-terra animate-fade-in-up delay-100">
              ”
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl font-script text-5xl font-normal italic leading-[0.95] tracking-[-0.035em] text-background drop-shadow-sm animate-fade-in-up delay-200 sm:text-7xl lg:text-[6rem]">
              {t("home.hero.titleBefore")}
              {t("home.hero.titleEm")}
              {t("home.hero.titleAfter")}
            </h1>
            <div className="mx-auto mt-10 flex items-center justify-center gap-5 text-[0.68rem] font-semibold uppercase tracking-[0.35em] text-background/70 animate-fade-in-up delay-300">
              <span className="h-px w-10 bg-background/45" />
              <span>Jocelyne & Christian</span>
              <span className="h-px w-10 bg-background/45" />
            </div>
          </div>
        </div>
        <div className="pb-4 sm:pb-0">
          <p className="max-w-3xl text-2xl font-semibold leading-tight text-background drop-shadow-sm animate-fade-in-up delay-200 sm:text-3xl">
            {t("home.hero.body")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-in-up delay-300">
            <a href="#reservation" className="btn-primary">
              {t("home.hero.primaryCta")}
            </a>
            <a
              href="#contact"
              className="btn-ghost !border-background/50 !text-background hover:!bg-background/10"
            >
              {t("home.hero.secondaryCta")}
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-background/25 pt-6 sm:grid-cols-4 sm:gap-8">
            {highlights.map((h, i) => (
              <div
                key={h.k}
                className={`animate-fade-in-up delay-${(i + 4) * 100}`}
              >
                <div className="font-display text-3xl font-semibold sm:text-4xl">
                  {h.k}
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-background/70 sm:text-sm">
                  {h.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Intro() {
  const { t, tm } = useI18n();
  const tags = tm("home.intro.tags");

  return (
    <section id="gite" className="py-20 sm:py-28">
      <div className="container-x grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <AnimatedSection>
            <span className="eyebrow">{t("home.intro.eyebrow")}</span>
            <h2 className="mt-3 text-3xl sm:text-5xl">
              {t("home.intro.title")}
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              {t("home.intro.p1")}
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {t("home.intro.p2")}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-7">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <AnimatedSection delay={100} className="col-span-2">
              <img
                src={IMG("house/Cuisine.avif")}
                alt="Cuisine ouverte équipée"
                className="aspect-[16/10] w-full rounded-2xl object-cover shadow-card img-reveal"
              />
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <img
                src={IMG("house/Chambre1.avif")}
                alt="Chambre"
                className="aspect-[4/5] w-full rounded-2xl object-cover shadow-card img-reveal"
              />
            </AnimatedSection>
            <AnimatedSection delay={300}>
              <img
                src={IMG("house/ArriereCours2.avif")}
                alt="Jardin"
                className="aspect-[4/5] w-full rounded-2xl object-cover shadow-card img-reveal"
              />
            </AnimatedSection>
            <AnimatedSection delay={400}>
              <img
                src={IMG("house/SalleDeBain1.avif")}
                alt="Salle de bain"
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card img-reveal"
              />
            </AnimatedSection>
            <AnimatedSection delay={500}>
              <img
                src={IMG("house/Exterieur1.avif")}
                alt="Extérieur"
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card img-reveal"
              />
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
}

function Spaces() {
  const { t, tm } = useI18n();
  const spaces = tm("home.spaces.items");

  return (
    <section className="bg-secondary/60 py-20 sm:py-28">
      <div className="container-x">
        <AnimatedSection className="max-w-2xl">
          <span className="eyebrow">{t("home.spaces.eyebrow")}</span>
          <h2 className="mt-3 text-3xl sm:text-4xl">
            {t("home.spaces.title")}
          </h2>
        </AnimatedSection>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((s, i) => (
            <AnimatedSection key={s.t} delay={i * 80}>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card card-hover h-full">
                <h3 className="text-xl">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.d}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Amenities() {
  const { t, tm } = useI18n();
  const amenities = tm("home.amenities.items");

  return (
    <section id="equipements" className="py-20 sm:py-28">
      <div className="container-x">
        <AnimatedSection className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="eyebrow">{t("home.amenities.eyebrow")}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              {t("home.amenities.title")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("home.amenities.body")}
            </p>
          </div>
        </AnimatedSection>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {amenities.map((cat, i) => (
            <AnimatedSection key={cat.title} delay={i * 60}>
              <div className="rounded-2xl border border-border bg-card p-6 card-hover h-full">
                <h3 className="text-lg">{cat.title}</h3>
                <ul className="mt-4 space-y-2">
                  {cat.items.map((i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terra" />
                      <span>{i}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
        <AnimatedSection delay={200}>
          <p className="mt-8 text-xs text-muted-foreground">
            {t("home.amenities.missing")}
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Gallery() {
  const { t, tm } = useI18n();
  const gallerySections = tm("home.gallery.sections");
  const [active, setActive] = useState(gallerySections[0].key);
  const current =
    gallerySections.find((s) => s.key === active) ?? gallerySections[0];
  return (
    <section id="galerie" className="bg-secondary/60 py-20 sm:py-28">
      <div className="container-x">
        <AnimatedSection className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <span className="eyebrow">{t("home.gallery.eyebrow")}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">
              {t("home.gallery.title")}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {t("home.gallery.body")}
            </p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={100}>
          <div className="mt-8 flex flex-wrap gap-2">
            {gallerySections.map((s) => {
              const isActive = s.key === active;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(s.key)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
                    isActive
                      ? "border-forest bg-forest text-primary-foreground shadow-soft"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  }`}
                >
                  {s.label}
                  <span
                    className={`ml-2 text-xs ${isActive ? "text-background/70" : "text-muted-foreground"}`}
                  >
                    {s.images.length}
                  </span>
                </button>
              );
            })}
          </div>
        </AnimatedSection>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {current.images.map((g, i) => (
            <AnimatedSection key={g.src} delay={i * 80}>
              <figure className="overflow-hidden rounded-2xl shadow-card">
                <img
                  src={IMG(g.src)}
                  alt={g.alt}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
              </figure>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Region() {
  const { t, tm } = useI18n();
  const activities = tm("home.activities");
  const places = tm("home.places");

  return (
    <section id="region" className="py-20 sm:py-28">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <AnimatedSection>
              <span className="eyebrow">{t("home.region.eyebrow")}</span>
              <h2 className="mt-3 text-3xl sm:text-5xl">
                {t("home.region.title")}
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                {t("home.region.p1")}
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                {t("home.region.p2")}
              </p>
              <div className="mt-8 rounded-2xl border border-border bg-card p-6 card-hover">
                <h3 className="text-lg">{t("home.region.activitiesTitle")}</h3>
                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {activities.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terra" />
                      {a}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.dinan-capfrehel.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-block text-sm text-forest underline underline-offset-4"
                >
                  {t("home.region.tourismOffice")}
                </a>
              </div>
            </AnimatedSection>
          </div>
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {places.map((p, i) => (
                <AnimatedSection
                  key={p.name}
                  delay={i * 70}
                  className={i === 0 ? "col-span-2" : ""}
                >
                  <article
                    className={`overflow-hidden rounded-2xl border border-border bg-card card-hover h-full ${i === 0 ? "col-span-2" : ""}`}
                  >
                    <div
                      className={`relative ${i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}
                    >
                      <img
                        src={IMG(p.img)}
                        alt={p.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4 sm:p-5">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-lg sm:text-xl">{p.name}</h3>
                        <span className="text-xs text-terra">{p.km}</span>
                      </div>
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground sm:text-sm">
                        {p.notes.map((n) => (
                          <li key={n}>· {n}</li>
                        ))}
                      </ul>
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhyHere() {
  const { t, tm } = useI18n();
  const blocks = tm("home.why.items");

  return (
    <section className="bg-forest text-primary-foreground py-20 sm:py-28">
      <div className="container-x">
        <AnimatedSection className="max-w-2xl">
          <span className="eyebrow !text-background/80">
            {t("home.why.eyebrow")}
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl">{t("home.why.title")}</h2>
        </AnimatedSection>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {blocks.map((b, i) => (
            <AnimatedSection key={b.t} delay={i * 100}>
              <div className="rounded-2xl border border-background/15 bg-background/5 p-6 backdrop-blur card-hover h-full">
                <h3 className="text-xl text-background">{b.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-background/80">
                  {b.d}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Reviews() {
  const { t } = useI18n();

  return (
    <section className="py-20 sm:py-28">
      <div className="container-x max-w-3xl text-center">
        <AnimatedSection>
          <span className="eyebrow">{t("home.reviews.eyebrow")}</span>
          <div
            className="mt-4 text-terra"
            aria-label={t("home.reviews.ratingLabel")}
          >
            ★★★★★
          </div>
          <blockquote className="mt-6 font-display text-2xl leading-snug sm:text-4xl">
            {t("home.reviews.quote")}
          </blockquote>
          <p className="mt-6 text-sm text-muted-foreground">
            {t("home.reviews.body")}
          </p>
          <p className="mt-4 text-sm font-medium">- Mimouna</p>
        </AnimatedSection>
      </div>
    </section>
  );
}

function AirbnbCalendar() {
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
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const { t, tm } = useI18n();
  const faqs = tm("home.faqs");

  return (
    <section id="pratique" className="py-20 sm:py-28">
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AnimatedSection>
            <span className="eyebrow">{t("home.faq.eyebrow")}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl">{t("home.faq.title")}</h2>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-8 divide-y divide-border">
          {faqs.map((f, i) => (
            <AnimatedSection key={f.q} delay={i * 80}>
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="font-display text-lg sm:text-xl">{f.q}</span>
                  <span className="text-terra text-2xl leading-none transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {f.a}
                </p>
              </details>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  const { lang, t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  return (
    <section
      id="contact"
      className="bg-forest text-primary-foreground py-20 sm:py-28"
    >
      <div className="container-x grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <AnimatedSection>
            <span className="eyebrow !text-background/70">
              {t("nav.contact")}
            </span>
            <h2 className="mt-3 text-3xl sm:text-5xl text-background">
              {t("home.contact.title")}
            </h2>
            <p className="mt-5 max-w-md text-background/75 leading-relaxed">
              {t("home.contact.body")}
            </p>
            <ul className="mt-8 space-y-4 text-background/90">
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  {t("home.contact.hosts")}
                </span>
                <div>Jocelyne & Christian</div>
              </li>
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  {t("home.contact.address")}
                </span>
                <div>Corseul, Bretagne</div>
              </li>
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  {t("home.contact.phone")}
                </span>
                <div>
                  <a href="tel:+33780710159" className="hover:text-terra">
                    +33 7 80 71 01 59
                  </a>
                </div>
              </li>
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  Email
                </span>
                <div>
                  <a
                    href="mailto:lesportesdemontafilan@gmail.com"
                    className="hover:text-terra break-all"
                  >
                    lesportesdemontafilan@gmail.com
                  </a>
                </div>
              </li>
              <li>
                <span className="text-background/60 text-xs uppercase tracking-wider">
                  Facebook
                </span>
                <div>
                  <a
                    href="https://www.facebook.com/LesPortesDeMontafilan"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-terra"
                  >
                    Les Portes De Montafilan
                  </a>
                </div>
              </li>
            </ul>
          </AnimatedSection>
        </div>
        <div className="lg:col-span-6">
          <AnimatedSection delay={150}>
            <form
              className="rounded-2xl border border-background/15 bg-background/5 p-6 sm:p-8 backdrop-blur"
              onSubmit={async (e) => {
                e.preventDefault();
                const f = e.currentTarget as HTMLFormElement;
                const data = new FormData(f);

                setIsSubmitting(true);
                setSubmitState("idle");
                setSubmitMessage(null);

                try {
                  const response = await fetch("/api/contact", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      language: lang,
                      form: {
                        firstName: String(data.get("firstname") || "").trim(),
                        lastName: String(data.get("lastname") || "").trim(),
                        email: String(data.get("email") || "").trim(),
                        phone: String(data.get("phone") || "").trim(),
                        subject: String(
                          data.get("subject") ||
                            t("home.contact.defaultSubject"),
                        ).trim(),
                        message: String(data.get("message") || "").trim(),
                      },
                    }),
                  });

                  const result = (await response.json().catch(() => null)) as {
                    error?: string;
                    ok?: boolean;
                  } | null;

                  if (!response.ok) {
                    throw new Error(result?.error || `HTTP ${response.status}`);
                  }

                  f.reset();
                  setSubmitState("success");
                  setSubmitMessage(t("home.contact.success"));
                } catch (error: unknown) {
                  setSubmitState("error");
                  setSubmitMessage(
                    error instanceof Error
                      ? error.message
                      : t("home.contact.error"),
                  );
                } finally {
                  setIsSubmitting(false);
                }
              }}
            >
              <h3 className="text-background text-xl">
                {t("home.contact.messageTitle")}
              </h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  name="firstname"
                  label={t("home.contact.firstName")}
                  required
                />
                <Field
                  name="lastname"
                  label={t("home.contact.lastName")}
                  required
                />
                <Field
                  name="email"
                  type="email"
                  label={t("home.contact.email")}
                  required
                />
                <Field name="phone" label={t("home.contact.phoneField")} />
                <Field
                  name="subject"
                  label={t("home.contact.subject")}
                  required
                  className="sm:col-span-2"
                />
                <Field
                  name="message"
                  label={t("home.contact.message")}
                  required
                  textarea
                  className="sm:col-span-2"
                />
              </div>
              {submitMessage ? (
                <div
                  className={`mt-6 rounded-xl border p-4 text-sm ${
                    submitState === "success"
                      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-50"
                      : "border-destructive/40 bg-destructive/10 text-destructive-foreground"
                  }`}
                >
                  {submitMessage}
                </div>
              ) : null}
              <button
                type="submit"
                className="btn-primary mt-6 w-full"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("home.contact.sending")
                  : t("home.contact.submit")}
              </button>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  className?: string;
}) {
  const base =
    "w-full rounded-lg border border-background/20 bg-background/5 px-4 py-3 text-background placeholder:text-background/40 focus:border-terra focus:outline-none focus:ring-2 focus:ring-clay/30 transition-colors";
  return (
    <label className={`block text-sm ${className}`}>
      <span className="block text-background/70 text-xs uppercase tracking-wider">
        {label}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          rows={5}
          className={`${base} mt-2 resize-none`}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          className={`${base} mt-2`}
        />
      )}
    </label>
  );
}

function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container-x grid gap-8 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <img
              src={LOGO_IMAGE}
              alt=""
              aria-hidden="true"
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-display text-lg">
              Les Portes de Montafilan
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("home.footer.body")}
          </p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("home.footer.navigation")}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="#gite" className="hover:text-terra">
                {t("nav.gite")}
              </a>
            </li>
            <li>
              <a href="#equipements" className="hover:text-terra">
                {t("nav.equipements")}
              </a>
            </li>
            <li>
              <a href="#galerie" className="hover:text-terra">
                {t("nav.galerie")}
              </a>
            </li>
            <li>
              <a href="#region" className="hover:text-terra">
                {t("nav.region")}
              </a>
            </li>
            <li>
              <a href="#reservation" className="hover:text-terra">
                {t("nav.reserve")}
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-terra">
                {t("nav.contact")}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("nav.contact")}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="tel:+33780710159" className="hover:text-terra">
                +33 7 80 71 01 59
              </a>
            </li>
            <li>
              <a
                href="mailto:lesportesdemontafilan@gmail.com"
                className="hover:text-terra break-all"
              >
                lesportesdemontafilan@gmail.com
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/LesPortesDeMontafilan"
                target="_blank"
                rel="noreferrer"
                className="hover:text-terra"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="https://maps.google.com/?q=G%C3%AEte%20-%20Les%20Portes%20de%20Montafilan"
                target="_blank"
                rel="noreferrer"
                className="hover:text-terra"
              >
                Google Maps
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container-x mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
        <span>
          © {new Date().getFullYear()} {t("home.footer.copyright")}
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/mentions-legales" className="hover:text-terra">
            {t("footer.legal")}
          </Link>
          <Link to="/confidentialite" className="hover:text-terra">
            {t("footer.privacy")}
          </Link>
          <Link to="/cookies" className="hover:text-terra">
            {t("footer.cookies")}
          </Link>
          <LangSwitch />
        </div>
      </div>
    </footer>
  );
}

export function Home() {
  return (
    <main className="bg-background pb-24 text-foreground sm:pb-0">
      <Nav />
      <Hero />
      <Intro />
      <Spaces />
      <Amenities />
      <Gallery />
      <Region />
      <WhyHere />
      <Reviews />
      <AirbnbCalendar />
      <Faq />
      <Contact />
      <Footer />
      <MobileReserveButton />
    </main>
  );
}
