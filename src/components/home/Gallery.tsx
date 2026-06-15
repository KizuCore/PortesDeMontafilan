import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";
import { IMG } from "@/lib/home/images";

export function Gallery() {
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
