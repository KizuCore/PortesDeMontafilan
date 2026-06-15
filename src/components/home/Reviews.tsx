import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";

export function Reviews() {
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
