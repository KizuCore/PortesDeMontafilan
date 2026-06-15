import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";
import { IMG } from "@/lib/home/images";

export function Region() {
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
