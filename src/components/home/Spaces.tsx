import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";

export function Spaces() {
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
