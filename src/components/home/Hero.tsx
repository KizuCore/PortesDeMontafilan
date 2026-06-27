import { useI18n } from "@/lib/i18n";
import { IMG } from "@/lib/home/images";

export function Hero() {
  const { t, tm } = useI18n();
  const highlights = tm("home.highlights");

  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={IMG("house/ArriereCours1.png")}
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
            <span className="font-script text-4xl italic leading-none text-terra animate-fade-in-up delay-100">
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
