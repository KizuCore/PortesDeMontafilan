import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";
import { IMG } from "@/lib/home/images";

export function Region() {
  const { t, tm } = useI18n();
  const activities = tm("home.activities");
  const places = tm("home.places");
  const nearbyHighlights = tm("home.region.nearbyHighlights");
  const tourismLinks = tm("home.region.tourismLinks");
  const events = tm("home.region.events");

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
                <h3 className="text-lg">
                  {t("home.region.nearbyHighlightsTitle")}
                </h3>
                <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
                  {nearbyHighlights.map((item) => (
                    <li key={item.name}>
                      <strong className="font-semibold text-foreground">
                        {item.name}
                      </strong>{" "}
                      {item.text}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 border-t border-border pt-5">
                  <h3 className="text-lg">
                    {t("home.region.eventsTitle")}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t("home.region.eventsBody")}
                  </p>
                  <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                    {events.map((event) => (
                      <li key={event}>· {event}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5 border-t border-border pt-5">
                  <h3 className="text-lg">
                    {t("home.region.tourismLinksTitle")}
                  </h3>
                  <div className="mt-3 flex flex-col gap-2 text-sm">
                    {tourismLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-forest underline underline-offset-4"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t("home.region.tourismOfficeEmail")}{" "}
                    <a
                      href="mailto:infos@dinan-capfrehel.com"
                      className="text-forest underline underline-offset-4"
                    >
                      infos@dinan-capfrehel.com
                    </a>
                  </p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-border bg-card p-6 card-hover">
                <h3 className="text-lg">{t("home.region.activitiesTitle")}</h3>
                <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                  {activities.map((a) => (
                    <li key={a} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-terra" />
                      {a}
                    </li>
                  ))}
                </ul>
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
