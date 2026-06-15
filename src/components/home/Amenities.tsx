import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";

export function Amenities() {
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
