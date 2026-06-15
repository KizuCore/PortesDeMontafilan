import { useI18n } from "@/lib/i18n";
import { AnimatedSection } from "@/components/AnimatedSection";
import { IMG } from "@/lib/home/images";

export function Intro() {
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
