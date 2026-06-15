import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";

export function WhyHere() {
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
