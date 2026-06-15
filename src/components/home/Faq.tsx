import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";

export function Faq() {
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
